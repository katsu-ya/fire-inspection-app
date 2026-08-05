package com.example.fireinspection.service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fireinspection.common.DateTimeUtil;
import com.example.fireinspection.dto.AdminDailyReportResponse;
import com.example.fireinspection.dto.DailyReportPreviewResponse;
import com.example.fireinspection.dto.DailyReportSubmitRequest;
import com.example.fireinspection.dto.VisitSummaryResponse;
import com.example.fireinspection.entity.AssignmentStatus;
import com.example.fireinspection.entity.DailyReport;
import com.example.fireinspection.entity.RouteAssignment;
import com.example.fireinspection.entity.Site;
import com.example.fireinspection.entity.User;
import com.example.fireinspection.exception.ApiException;
import com.example.fireinspection.repository.DailyReportRepository;
import com.example.fireinspection.repository.RouteAssignmentRepository;
import com.example.fireinspection.repository.SiteRepository;
import com.example.fireinspection.repository.UserRepository;

/**
 * 日報サービス（従業員のプレビュー・提出、管理者の一覧閲覧）
 */
@Service
public class DailyReportService {

    private final DailyReportRepository dailyReportRepository;
    private final RouteAssignmentRepository routeAssignmentRepository;
    private final SiteRepository siteRepository;
    private final UserRepository userRepository;

    public DailyReportService(DailyReportRepository dailyReportRepository,
                              RouteAssignmentRepository routeAssignmentRepository,
                              SiteRepository siteRepository,
                              UserRepository userRepository) {
        this.dailyReportRepository = dailyReportRepository;
        this.routeAssignmentRepository = routeAssignmentRepository;
        this.siteRepository = siteRepository;
        this.userRepository = userRepository;
    }

    /**
     * 日報プレビュー（date省略時は当日）
     */
    @Transactional(readOnly = true)
    public DailyReportPreviewResponse preview(User user, LocalDate date) {
        LocalDate workDate = date != null ? date : DateTimeUtil.today();
        return buildPreview(user.getId(), workDate);
    }

    /**
     * 日報提出（同日提出済みなら400。作業時間はサーバー側で自動計算）
     */
    @Transactional
    public DailyReportPreviewResponse submit(User user, DailyReportSubmitRequest request) {
        if (dailyReportRepository.existsByUserIdAndWorkDate(user.getId(), request.workDate())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "本日の日報はすでに提出済みです");
        }
        DailyReport report = new DailyReport();
        report.setUserId(user.getId());
        report.setWorkDate(request.workDate());
        report.setSpecialNote(request.specialNote());
        report.setSubmittedAt(DateTimeUtil.now());
        dailyReportRepository.save(report);
        return buildPreview(user.getId(), request.workDate());
    }

    /**
     * 管理者向け日報一覧（date省略時は当日、user_id任意）。
     * 日報未提出でも当日assignmentがある職員は submitted=false で含める。
     */
    @Transactional(readOnly = true)
    public List<AdminDailyReportResponse> adminList(LocalDate date, Long userId) {
        LocalDate workDate = date != null ? date : DateTimeUtil.today();

        // 対象職員 = 当日割当のある職員 ∪ 当日日報を提出した職員
        Set<Long> targetUserIds = new TreeSet<>();
        routeAssignmentRepository.findByWorkDateOrderByUserIdAscVisitOrderAsc(workDate)
                .forEach(a -> targetUserIds.add(a.getUserId()));
        dailyReportRepository.findByWorkDate(workDate)
                .forEach(r -> targetUserIds.add(r.getUserId()));
        if (userId != null) {
            targetUserIds.removeIf(id -> !id.equals(userId));
        }

        Map<Long, User> users = userRepository.findAllById(targetUserIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        List<AdminDailyReportResponse> responses = new ArrayList<>();
        for (Long targetUserId : targetUserIds) {
            DailyReportPreviewResponse preview = buildPreview(targetUserId, workDate);
            User targetUser = users.get(targetUserId);
            responses.add(new AdminDailyReportResponse(
                    targetUserId,
                    targetUser != null ? targetUser.getName() : null,
                    preview.workDate(),
                    preview.submitted(),
                    preview.specialNote(),
                    preview.submittedAt(),
                    preview.visits(),
                    preview.totalMinutes(),
                    preview.allCompleted()));
        }
        return responses;
    }

    /**
     * 職員×日付の日報プレビューを組み立てる共通処理
     */
    private DailyReportPreviewResponse buildPreview(Long userId, LocalDate workDate) {
        List<RouteAssignment> assignments =
                routeAssignmentRepository.findByUserIdAndWorkDateOrderByVisitOrderAsc(userId, workDate);

        // 現場名を一括取得
        Set<Long> siteIds = assignments.stream().map(RouteAssignment::getSiteId).collect(Collectors.toSet());
        Map<Long, Site> sites = siteRepository.findAllById(siteIds).stream()
                .collect(Collectors.toMap(Site::getId, Function.identity()));

        long totalMinutes = 0;
        List<VisitSummaryResponse> visits = new ArrayList<>();
        for (RouteAssignment assignment : assignments) {
            // 到着・離脱が両方揃っている場合のみ作業時間を分単位で計算する
            Long durationMinutes = null;
            if (assignment.getArrivedAt() != null && assignment.getDepartedAt() != null) {
                durationMinutes = Duration.between(assignment.getArrivedAt(), assignment.getDepartedAt()).toMinutes();
                totalMinutes += durationMinutes;
            }
            Site site = sites.get(assignment.getSiteId());
            visits.add(new VisitSummaryResponse(
                    assignment.getId(),
                    site != null ? site.getName() : null,
                    assignment.getStatus(),
                    assignment.getArrivedAt(),
                    assignment.getDepartedAt(),
                    durationMinutes));
        }

        boolean allCompleted = !assignments.isEmpty()
                && assignments.stream().allMatch(a -> a.getStatus() == AssignmentStatus.COMPLETED);

        Optional<DailyReport> report = dailyReportRepository.findByUserIdAndWorkDate(userId, workDate);

        return new DailyReportPreviewResponse(
                workDate,
                report.isPresent(),
                report.map(DailyReport::getSpecialNote).orElse(null),
                report.map(DailyReport::getSubmittedAt).orElse(null),
                visits,
                totalMinutes,
                allCompleted);
    }
}
