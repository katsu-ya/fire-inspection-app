package com.example.fireinspection.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fireinspection.common.DateTimeUtil;
import com.example.fireinspection.dto.DashboardSummaryResponse;
import com.example.fireinspection.dto.EmployeeStatusResponse;
import com.example.fireinspection.dto.FailCategoryResponse;
import com.example.fireinspection.dto.WeeklyCountResponse;
import com.example.fireinspection.entity.AssignmentStatus;
import com.example.fireinspection.entity.ResultStatus;
import com.example.fireinspection.entity.RouteAssignment;
import com.example.fireinspection.entity.Site;
import com.example.fireinspection.entity.User;
import com.example.fireinspection.repository.DailyReportRepository;
import com.example.fireinspection.repository.InspectionResultRepository;
import com.example.fireinspection.repository.RouteAssignmentRepository;
import com.example.fireinspection.repository.SiteRepository;
import com.example.fireinspection.repository.UserRepository;

/**
 * ダッシュボード集計サービス（管理者向け）
 */
@Service
public class DashboardService {

    private final RouteAssignmentRepository routeAssignmentRepository;
    private final DailyReportRepository dailyReportRepository;
    private final InspectionResultRepository inspectionResultRepository;
    private final UserRepository userRepository;
    private final SiteRepository siteRepository;

    public DashboardService(RouteAssignmentRepository routeAssignmentRepository,
                            DailyReportRepository dailyReportRepository,
                            InspectionResultRepository inspectionResultRepository,
                            UserRepository userRepository,
                            SiteRepository siteRepository) {
        this.routeAssignmentRepository = routeAssignmentRepository;
        this.dailyReportRepository = dailyReportRepository;
        this.inspectionResultRepository = inspectionResultRepository;
        this.userRepository = userRepository;
        this.siteRepository = siteRepository;
    }

    /**
     * サマリー集計（date省略時は当日）
     */
    @Transactional(readOnly = true)
    public DashboardSummaryResponse summary(LocalDate date) {
        LocalDate workDate = date != null ? date : DateTimeUtil.today();
        List<RouteAssignment> assignments =
                routeAssignmentRepository.findByWorkDateOrderByUserIdAscVisitOrderAsc(workDate);

        long workingEmployees = assignments.stream().map(RouteAssignment::getUserId).distinct().count();
        long plannedSites = assignments.size();
        long completedSites = assignments.stream()
                .filter(a -> a.getStatus() == AssignmentStatus.COMPLETED).count();
        long inProgressSites = assignments.stream()
                .filter(a -> a.getStatus() == AssignmentStatus.IN_PROGRESS).count();
        long submittedDailyReports = dailyReportRepository.countByWorkDate(workDate);
        long failCount = inspectionResultRepository.countByWorkDateAndResult(workDate, ResultStatus.FAIL);

        return new DashboardSummaryResponse(workingEmployees, plannedSites, completedSites,
                inProgressSites, submittedDailyReports, failCount);
    }

    /**
     * 職員ごとの当日状況一覧（date省略時は当日）
     */
    @Transactional(readOnly = true)
    public List<EmployeeStatusResponse> status(LocalDate date) {
        LocalDate workDate = date != null ? date : DateTimeUtil.today();
        List<RouteAssignment> assignments =
                routeAssignmentRepository.findByWorkDateOrderByUserIdAscVisitOrderAsc(workDate);

        // 職員ごとにグルーピング（取得順=職員ID順を維持）
        Map<Long, List<RouteAssignment>> byUser = new LinkedHashMap<>();
        for (RouteAssignment assignment : assignments) {
            byUser.computeIfAbsent(assignment.getUserId(), k -> new ArrayList<>()).add(assignment);
        }

        Map<Long, User> users = userRepository.findAllById(byUser.keySet()).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        Set<Long> siteIds = assignments.stream().map(RouteAssignment::getSiteId).collect(Collectors.toSet());
        Map<Long, Site> sites = siteRepository.findAllById(siteIds).stream()
                .collect(Collectors.toMap(Site::getId, Function.identity()));

        List<EmployeeStatusResponse> responses = new ArrayList<>();
        for (Map.Entry<Long, List<RouteAssignment>> entry : byUser.entrySet()) {
            Long userId = entry.getKey();
            List<RouteAssignment> userAssignments = entry.getValue();
            long completed = userAssignments.stream()
                    .filter(a -> a.getStatus() == AssignmentStatus.COMPLETED).count();

            // 作業中の現場名（なければnull）
            String currentSiteName = userAssignments.stream()
                    .filter(a -> a.getStatus() == AssignmentStatus.IN_PROGRESS)
                    .findFirst()
                    .map(a -> {
                        Site site = sites.get(a.getSiteId());
                        return site != null ? site.getName() : null;
                    })
                    .orElse(null);

            User user = users.get(userId);
            responses.add(new EmployeeStatusResponse(
                    userId,
                    user != null ? user.getName() : null,
                    userAssignments.size(),
                    completed,
                    currentSiteName,
                    dailyReportRepository.existsByUserIdAndWorkDate(userId, workDate)));
        }
        return responses;
    }

    /**
     * 直近7日（当日含む）の予定・完了件数（棒グラフ用）
     */
    @Transactional(readOnly = true)
    public List<WeeklyCountResponse> weekly() {
        LocalDate today = DateTimeUtil.today();
        LocalDate from = today.minusDays(6);
        List<RouteAssignment> assignments = routeAssignmentRepository.findByWorkDateBetween(from, today);

        Map<LocalDate, List<RouteAssignment>> byDate = assignments.stream()
                .collect(Collectors.groupingBy(RouteAssignment::getWorkDate));

        List<WeeklyCountResponse> responses = new ArrayList<>();
        for (LocalDate date = from; !date.isAfter(today); date = date.plusDays(1)) {
            List<RouteAssignment> dayAssignments = byDate.getOrDefault(date, List.of());
            long completed = dayAssignments.stream()
                    .filter(a -> a.getStatus() == AssignmentStatus.COMPLETED).count();
            responses.add(new WeeklyCountResponse(date, dayAssignments.size(), completed));
        }
        return responses;
    }

    /**
     * 不良（FAIL）件数の設備カテゴリ別集計（期間任意）
     */
    @Transactional(readOnly = true)
    public List<FailCategoryResponse> failCategories(LocalDate dateFrom, LocalDate dateTo) {
        return inspectionResultRepository.countByCategoryAndResult(dateFrom, dateTo, ResultStatus.FAIL).stream()
                .map(row -> new FailCategoryResponse((String) row[0], ((Number) row[1]).longValue()))
                .toList();
    }
}
