package com.example.fireinspection.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.fireinspection.dto.ReportDetailResponse;
import com.example.fireinspection.service.ReportService;

/**
 * 点検報告閲覧コントローラー（管理者向け）
 */
@RestController
@RequestMapping("/api/v1/admin/reports")
public class AdminReportController {

    private final ReportService reportService;

    public AdminReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /** 該当現場の点検報告詳細（項目別結果・所見） */
    @GetMapping("/{assignmentId}")
    public ReportDetailResponse detail(@PathVariable(name = "assignmentId") Long assignmentId) {
        return reportService.getDetail(assignmentId);
    }
}
