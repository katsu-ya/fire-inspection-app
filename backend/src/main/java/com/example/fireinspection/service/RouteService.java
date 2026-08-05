package com.example.fireinspection.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fireinspection.dto.AssignmentResponse;
import com.example.fireinspection.dto.RouteBulkRequest;
import com.example.fireinspection.dto.RouteReplaceRequest;
import com.example.fireinspection.dto.RouteSiteRequest;
import com.example.fireinspection.dto.SiteSummaryResponse;
import com.example.fireinspection.entity.AssignmentStatus;
import com.example.fireinspection.entity.RouteAssignment;
import com.example.fireinspection.entity.Site;
import com.example.fireinspection.entity.User;
import com.example.fireinspection.exception.ApiException;
import com.example.fireinspection.repository.RouteAssignmentRepository;
import com.example.fireinspection.repository.SiteRepository;
import com.example.fireinspection.repository.UserRepository;

/**
 * ルート設定サービス（管理者向け）
 */
@Service
public class RouteService {

    private final RouteAssignmentRepository routeAssignmentRepository;
    private final UserRepository userRepository;
    private final SiteRepository siteRepository;

    public RouteService(RouteAssignmentRepository routeAssignmentRepository,
                        UserRepository userRepository, SiteRepository siteRepository) {
        this.routeAssignmentRepository = routeAssignmentRepository;
        this.userRepository = userRepository;
        this.siteRepository = siteRepository;
    }

    /**
     * 割当一覧の検索（条件はすべて任意）
     */
    @Transactional(readOnly = true)
    public List<AssignmentResponse> search(Long userId, LocalDate dateFrom, LocalDate dateTo) {
        List<RouteAssignment> assignments = routeAssignmentRepository.search(userId, dateFrom, dateTo);
        return toResponses(assignments);
    }

    /**
     * 指定日のルートを丸ごと置き換える（配列順=訪問順）
     */
    @Transactional
    public List<AssignmentResponse> replace(RouteReplaceRequest request) {
        validateUser(request.userId());
        validateSites(request.sites());
        List<RouteAssignment> result = replaceForDate(request.userId(), request.workDate(), request.sites());
        return toResponses(result);
    }

    /**
     * 期間一括設定（skip_weekends=trueなら土日を飛ばす）
     */
    @Transactional
    public List<AssignmentResponse> bulk(RouteBulkRequest request) {
        if (request.dateFrom().isAfter(request.dateTo())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "期間の指定が不正です");
        }
        validateUser(request.userId());
        validateSites(request.sites());

        boolean skipWeekends = Boolean.TRUE.equals(request.skipWeekends());
        List<RouteAssignment> result = new ArrayList<>();
        for (LocalDate date = request.dateFrom(); !date.isAfter(request.dateTo()); date = date.plusDays(1)) {
            if (skipWeekends && (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY)) {
                continue;
            }
            result.addAll(replaceForDate(request.userId(), date, request.sites()));
        }
        return toResponses(result);
    }

    /**
     * 1日分のルート置き換えの中核処理。
     * 同じ現場の既存割当は（未着手でも）IDを温存して訪問順・メモのみ更新する。
     * ※IDを毎回振り直すと、置き換え前に画面を開いていた従業員が旧IDで到着報告して失敗するため。
     * 開始済み（status != NOT_STARTED）の割当を再利用する場合は状態・時刻・点検報告も保持される。
     */
    private List<RouteAssignment> replaceForDate(Long userId, LocalDate workDate, List<RouteSiteRequest> sites) {
        List<RouteAssignment> existing =
                routeAssignmentRepository.findByUserIdAndWorkDateOrderByVisitOrderAsc(userId, workDate);

        // 現場IDごとの既存割当キュー（開始済みを優先して再利用する。同一現場が複数ある場合は順番に割り当てる）
        Map<Long, Deque<RouteAssignment>> existingBySite = new HashMap<>();
        existing.stream()
                .sorted(Comparator.comparingInt(a -> a.getStatus() == AssignmentStatus.NOT_STARTED ? 1 : 0))
                .forEach(a -> existingBySite.computeIfAbsent(a.getSiteId(), k -> new ArrayDeque<>()).add(a));

        // 新リストの各位置に「再利用する既存割当（なければnull）」を割り付ける計画を立てる
        record Slot(RouteAssignment reusable, RouteSiteRequest request, int visitOrder) {
        }
        List<Slot> slots = new ArrayList<>();
        List<RouteAssignment> toReuse = new ArrayList<>();
        int order = 1;
        for (RouteSiteRequest siteRequest : sites) {
            Deque<RouteAssignment> queue = existingBySite.get(siteRequest.siteId());
            RouteAssignment reusable = (queue != null && !queue.isEmpty()) ? queue.poll() : null;
            if (reusable != null) {
                toReuse.add(reusable);
            }
            slots.add(new Slot(reusable, siteRequest, order));
            order++;
        }

        // 新リストに現れなかった既存割当の処理: 開始済みが残る場合はエラー、未着手は削除
        List<RouteAssignment> leftovers = existingBySite.values().stream()
                .flatMap(Deque::stream)
                .toList();
        if (leftovers.stream().anyMatch(a -> a.getStatus() != AssignmentStatus.NOT_STARTED)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "作業開始済みの現場は削除できません");
        }
        routeAssignmentRepository.deleteAll(leftovers);
        routeAssignmentRepository.flush();

        // 再利用する割当の訪問順を一時的に負数へ退避し、ユニーク制約違反を回避する
        int tempOrder = -1;
        for (RouteAssignment assignment : toReuse) {
            assignment.setVisitOrder(tempOrder--);
        }
        routeAssignmentRepository.saveAll(toReuse);
        routeAssignmentRepository.flush();

        // 訪問順・メモを確定する（再利用分はID・状態・時刻を保持したまま更新）
        List<RouteAssignment> result = new ArrayList<>();
        for (Slot slot : slots) {
            RouteAssignment assignment = slot.reusable();
            if (assignment == null) {
                assignment = new RouteAssignment();
                assignment.setUserId(userId);
                assignment.setSiteId(slot.request().siteId());
                assignment.setWorkDate(workDate);
                assignment.setStatus(AssignmentStatus.NOT_STARTED);
            }
            assignment.setVisitOrder(slot.visitOrder());
            assignment.setNote(slot.request().note());
            result.add(routeAssignmentRepository.save(assignment));
        }
        routeAssignmentRepository.flush();
        return result;
    }

    /** 職員の存在チェック */
    private void validateUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "職員が見つかりません");
        }
    }

    /** 現場の存在チェック */
    private void validateSites(List<RouteSiteRequest> sites) {
        Set<Long> siteIds = sites.stream().map(RouteSiteRequest::siteId).collect(Collectors.toSet());
        Set<Long> foundIds = new HashSet<>();
        siteRepository.findAllById(siteIds).forEach(site -> foundIds.add(site.getId()));
        if (!foundIds.containsAll(siteIds)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "存在しない現場が含まれています");
        }
    }

    /** 割当エンティティ一覧をレスポンスに変換する（職員・現場情報を一括取得） */
    private List<AssignmentResponse> toResponses(List<RouteAssignment> assignments) {
        Set<Long> userIds = assignments.stream().map(RouteAssignment::getUserId).collect(Collectors.toSet());
        Set<Long> siteIds = assignments.stream().map(RouteAssignment::getSiteId).collect(Collectors.toSet());
        Map<Long, User> users = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        Map<Long, Site> sites = siteRepository.findAllById(siteIds).stream()
                .collect(Collectors.toMap(Site::getId, Function.identity()));

        return assignments.stream()
                .map(a -> {
                    User user = users.get(a.getUserId());
                    Site site = sites.get(a.getSiteId());
                    return new AssignmentResponse(
                            a.getId(),
                            a.getUserId(),
                            user != null ? user.getName() : null,
                            a.getWorkDate(),
                            a.getVisitOrder(),
                            a.getStatus(),
                            a.getArrivedAt(),
                            a.getDepartedAt(),
                            a.getNote(),
                            site != null ? SiteSummaryResponse.from(site) : null);
                })
                .toList();
    }
}
