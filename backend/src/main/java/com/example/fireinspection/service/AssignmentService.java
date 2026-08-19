package com.example.fireinspection.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fireinspection.common.DateTimeUtil;
import com.example.fireinspection.dto.InspectionFormResponse;
import com.example.fireinspection.dto.InspectionItemResultResponse;
import com.example.fireinspection.dto.InspectionResultRequest;
import com.example.fireinspection.dto.InspectionSaveRequest;
import com.example.fireinspection.dto.MyAssignmentResponse;
import com.example.fireinspection.dto.MyRoutesResponse;
import com.example.fireinspection.dto.SiteSummaryResponse;
import com.example.fireinspection.entity.AssignmentStatus;
import com.example.fireinspection.entity.InspectionItem;
import com.example.fireinspection.entity.InspectionReport;
import com.example.fireinspection.entity.InspectionResult;
import com.example.fireinspection.entity.RouteAssignment;
import com.example.fireinspection.entity.Site;
import com.example.fireinspection.entity.User;
import com.example.fireinspection.exception.ApiException;
import com.example.fireinspection.repository.InspectionItemRepository;
import com.example.fireinspection.repository.InspectionReportRepository;
import com.example.fireinspection.repository.InspectionResultRepository;
import com.example.fireinspection.repository.RouteAssignmentRepository;
import com.example.fireinspection.repository.SiteRepository;

/**
 * 従業員の作業報告サービス（ルート閲覧・到着/離脱報告・点検入力）
 */
@Service
public class AssignmentService {

    private final RouteAssignmentRepository routeAssignmentRepository;
    private final SiteRepository siteRepository;
    private final InspectionReportRepository inspectionReportRepository;
    private final InspectionResultRepository inspectionResultRepository;
    private final InspectionItemRepository inspectionItemRepository;

    public AssignmentService(RouteAssignmentRepository routeAssignmentRepository,
                             SiteRepository siteRepository,
                             InspectionReportRepository inspectionReportRepository,
                             InspectionResultRepository inspectionResultRepository,
                             InspectionItemRepository inspectionItemRepository) {
        this.routeAssignmentRepository = routeAssignmentRepository;
        this.siteRepository = siteRepository;
        this.inspectionReportRepository = inspectionReportRepository;
        this.inspectionResultRepository = inspectionResultRepository;
        this.inspectionItemRepository = inspectionItemRepository;
    }

    /**
     * 自分のルート取得（date省略時は当日）
     */
    @Transactional(readOnly = true)
    public MyRoutesResponse getMyRoutes(User user, LocalDate date) {
        LocalDate workDate = date != null ? date : DateTimeUtil.today();
        List<RouteAssignment> assignments =
                routeAssignmentRepository.findByUserIdAndWorkDateOrderByVisitOrderAsc(user.getId(), workDate);

        // 現場情報を一括取得
        Set<Long> siteIds = assignments.stream().map(RouteAssignment::getSiteId).collect(Collectors.toSet());
        Map<Long, Site> sites = siteRepository.findAllById(siteIds).stream()
                .collect(Collectors.toMap(Site::getId, Function.identity()));

        // 点検報告の有無を一括取得
        List<Long> assignmentIds = assignments.stream().map(RouteAssignment::getId).toList();
        Set<Long> reportedIds = assignmentIds.isEmpty() ? Set.of()
                : inspectionReportRepository.findByRouteAssignmentIdIn(assignmentIds).stream()
                        .map(InspectionReport::getRouteAssignmentId)
                        .collect(Collectors.toSet());

        List<MyAssignmentResponse> responses = assignments.stream()
                .map(a -> toMyAssignmentResponse(a, user, sites.get(a.getSiteId()), reportedIds.contains(a.getId())))
                .toList();
        return new MyRoutesResponse(workDate, responses);
    }

    /**
     * 到着報告（arrived_at=now, status=IN_PROGRESS）
     */
    @Transactional
    public MyAssignmentResponse arrive(User user, Long assignmentId) {
        RouteAssignment assignment = findOwnedAssignment(user, assignmentId);
        if (assignment.getStatus() != AssignmentStatus.NOT_STARTED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "すでに到着報告済みです");
        }
        assignment.setArrivedAt(DateTimeUtil.now());
        assignment.setStatus(AssignmentStatus.IN_PROGRESS);
        routeAssignmentRepository.save(assignment);
        return toSingleResponse(assignment, user);
    }

    /**
     * 離脱報告（departed_at=now, status=COMPLETED）
     */
    @Transactional
    public MyAssignmentResponse depart(User user, Long assignmentId) {
        RouteAssignment assignment = findOwnedAssignment(user, assignmentId);
        if (assignment.getStatus() == AssignmentStatus.NOT_STARTED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "到着報告が完了していません");
        }
        if (assignment.getStatus() == AssignmentStatus.COMPLETED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "すでに離脱報告済みです");
        }
        if (!inspectionReportRepository.existsByRouteAssignmentId(assignment.getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "点検内容が保存されていません");
        }
        assignment.setDepartedAt(DateTimeUtil.now());
        assignment.setStatus(AssignmentStatus.COMPLETED);
        routeAssignmentRepository.save(assignment);
        return toSingleResponse(assignment, user);
    }

    /**
     * 点検フォーマット+入力済み結果の取得（未入力はresult=null）
     */
    @Transactional(readOnly = true)
    public InspectionFormResponse getInspection(User user, Long assignmentId) {
        RouteAssignment assignment = findOwnedAssignment(user, assignmentId);
        return buildInspectionForm(assignment);
    }

    /**
     * 点検報告の保存（upsert。何度でも上書き可。到着報告前は400）
     */
    @Transactional
    public InspectionFormResponse saveInspection(User user, Long assignmentId, InspectionSaveRequest request) {
        RouteAssignment assignment = findOwnedAssignment(user, assignmentId);
        if (assignment.getStatus() == AssignmentStatus.NOT_STARTED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "到着報告後に点検を入力してください");
        }

        // 点検項目の存在チェック
        Set<Long> itemIds = request.results().stream()
                .map(InspectionResultRequest::itemId)
                .collect(Collectors.toSet());
        Map<Long, InspectionItem> items = new HashMap<>();
        inspectionItemRepository.findAllById(itemIds).forEach(item -> items.put(item.getId(), item));
        if (!items.keySet().containsAll(itemIds)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "存在しない点検項目が含まれています");
        }

        // 点検報告のupsert
        InspectionReport report = inspectionReportRepository.findByRouteAssignmentId(assignment.getId())
                .orElseGet(() -> {
                    InspectionReport newReport = new InspectionReport();
                    newReport.setRouteAssignmentId(assignment.getId());
                    return newReport;
                });
        report.setRemarks(request.remarks());
        report = inspectionReportRepository.save(report);

        // 既存の結果を削除してから再作成する（ユニーク制約回避のためflushで即時反映）
        inspectionResultRepository.deleteByInspectionReportId(report.getId());
        inspectionResultRepository.flush();

        List<InspectionResult> newResults = new ArrayList<>();
        for (InspectionResultRequest resultRequest : request.results()) {
            InspectionResult result = new InspectionResult();
            result.setInspectionReportId(report.getId());
            result.setInspectionItemId(resultRequest.itemId());
            result.setResult(resultRequest.result());
            result.setNote(resultRequest.note());
            newResults.add(result);
        }
        inspectionResultRepository.saveAll(newResults);

        return buildInspectionForm(assignment);
    }

    /**
     * 割当を取得し本人のものか検証する（他人のIDなら403）
     */
    public RouteAssignment findOwnedAssignment(User user, Long assignmentId) {
        RouteAssignment assignment = routeAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "対象の割当が見つかりません"));
        if (!assignment.getUserId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "他の職員のデータは操作できません");
        }
        return assignment;
    }

    /** 点検フォーマット+入力済み結果のレスポンスを組み立てる */
    private InspectionFormResponse buildInspectionForm(RouteAssignment assignment) {
        Optional<InspectionReport> report =
                inspectionReportRepository.findByRouteAssignmentId(assignment.getId());

        // 入力済み結果を項目IDでマップ化
        Map<Long, InspectionResult> resultsByItem = report
                .map(r -> inspectionResultRepository.findByInspectionReportId(r.getId()))
                .orElse(List.of())
                .stream()
                .collect(Collectors.toMap(InspectionResult::getInspectionItemId, Function.identity()));

        List<InspectionItemResultResponse> items =
                inspectionItemRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                        .map(item -> {
                            InspectionResult result = resultsByItem.get(item.getId());
                            return new InspectionItemResultResponse(
                                    item.getId(),
                                    item.getEquipmentCategory().getId(),
                                    item.getEquipmentCategory().getName(),
                                    item.getName(),
                                    item.getDisplayOrder(),
                                    result != null ? result.getResult() : null,
                                    result != null ? result.getNote() : null);
                        })
                        .toList();

        return new InspectionFormResponse(report.map(InspectionReport::getRemarks).orElse(null), items);
    }

    /** 単一割当のレスポンスを組み立てる */
    private MyAssignmentResponse toSingleResponse(RouteAssignment assignment, User user) {
        Site site = siteRepository.findById(assignment.getSiteId()).orElse(null);
        boolean hasReport = inspectionReportRepository.existsByRouteAssignmentId(assignment.getId());
        return toMyAssignmentResponse(assignment, user, site, hasReport);
    }

    /** 割当エンティティを従業員向けレスポンスに変換する */
    private MyAssignmentResponse toMyAssignmentResponse(RouteAssignment assignment, User user, Site site,
                                                        boolean hasReport) {
        return new MyAssignmentResponse(
                assignment.getId(),
                user.getId(),
                user.getName(),
                assignment.getWorkDate(),
                assignment.getVisitOrder(),
                assignment.getStatus(),
                assignment.getArrivedAt(),
                assignment.getDepartedAt(),
                assignment.getNote(),
                site != null ? SiteSummaryResponse.from(site) : null,
                hasReport);
    }
}
