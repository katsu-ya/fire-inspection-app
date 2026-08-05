package com.example.fireinspection.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.fireinspection.dto.DashboardSummaryResponse;
import com.example.fireinspection.dto.EmployeeStatusResponse;
import com.example.fireinspection.dto.FailCategoryResponse;
import com.example.fireinspection.dto.WeeklyCountResponse;
import com.example.fireinspection.service.DashboardService;

/**
 * ダッシュボードコントローラー（管理者向け）
 */
@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {

    private final DashboardService dashboardService;

    public AdminDashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /** サマリー集計（date省略時は当日） */
    @GetMapping("/summary")
    public DashboardSummaryResponse summary(
            @RequestParam(name = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return dashboardService.summary(date);
    }

    /** 職員ごとの当日状況一覧 */
    @GetMapping("/status")
    public List<EmployeeStatusResponse> status(
            @RequestParam(name = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return dashboardService.status(date);
    }

    /** 直近7日の予定・完了件数（棒グラフ用） */
    @GetMapping("/weekly")
    public List<WeeklyCountResponse> weekly() {
        return dashboardService.weekly();
    }

    /** 不良（FAIL）件数の設備カテゴリ別集計 */
    @GetMapping("/fail-categories")
    public List<FailCategoryResponse> failCategories(
            @RequestParam(name = "date_from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(name = "date_to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return dashboardService.failCategories(dateFrom, dateTo);
    }
}
