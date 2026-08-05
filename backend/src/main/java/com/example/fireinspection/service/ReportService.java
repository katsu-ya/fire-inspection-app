package com.example.fireinspection.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fireinspection.dto.InspectionItemResultResponse;
import com.example.fireinspection.dto.ReportDetailResponse;
import com.example.fireinspection.dto.SiteSummaryResponse;
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
import com.example.fireinspection.repository.UserRepository;

/**
 * 点検報告閲覧サービス（管理者向け）
 */
@Service
public class ReportService {

    private final RouteAssignmentRepository routeAssignmentRepository;
    private final SiteRepository siteRepository;
    private final UserRepository userRepository;
    private final InspectionReportRepository inspectionReportRepository;
    private final InspectionResultRepository inspectionResultRepository;
    private final InspectionItemRepository inspectionItemRepository;

    public ReportService(RouteAssignmentRepository routeAssignmentRepository,
                         SiteRepository siteRepository,
                         UserRepository userRepository,
                         InspectionReportRepository inspectionReportRepository,
                         InspectionResultRepository inspectionResultRepository,
                         InspectionItemRepository inspectionItemRepository) {
        this.routeAssignmentRepository = routeAssignmentRepository;
        this.siteRepository = siteRepository;
        this.userRepository = userRepository;
        this.inspectionReportRepository = inspectionReportRepository;
        this.inspectionResultRepository = inspectionResultRepository;
        this.inspectionItemRepository = inspectionItemRepository;
    }

    /**
     * 点検報告詳細（項目別結果・所見。結果未入力項目はresult=null）
     */
    @Transactional(readOnly = true)
    public ReportDetailResponse getDetail(Long assignmentId) {
        RouteAssignment assignment = routeAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "対象の割当が見つかりません"));

        Site site = siteRepository.findById(assignment.getSiteId()).orElse(null);
        User user = userRepository.findById(assignment.getUserId()).orElse(null);

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
                                    item.getCategory(),
                                    item.getName(),
                                    item.getDisplayOrder(),
                                    result != null ? result.getResult() : null,
                                    result != null ? result.getNote() : null);
                        })
                        .toList();

        return new ReportDetailResponse(
                assignment.getId(),
                assignment.getWorkDate(),
                user != null ? user.getName() : null,
                assignment.getStatus(),
                assignment.getArrivedAt(),
                assignment.getDepartedAt(),
                report.map(InspectionReport::getRemarks).orElse(null),
                site != null ? SiteSummaryResponse.from(site) : null,
                items);
    }
}
