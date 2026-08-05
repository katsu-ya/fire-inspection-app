package com.example.fireinspection.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.fireinspection.dto.AdminDailyReportResponse;
import com.example.fireinspection.service.DailyReportService;

/**
 * 日報閲覧コントローラー（管理者向け）
 */
@RestController
@RequestMapping("/api/v1/admin/daily-reports")
public class AdminDailyReportController {

    private final DailyReportService dailyReportService;

    public AdminDailyReportController(DailyReportService dailyReportService) {
        this.dailyReportService = dailyReportService;
    }

    /** 日報一覧（date省略時は当日、user_id任意） */
    @GetMapping
    public List<AdminDailyReportResponse> list(
            @RequestParam(name = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(name = "user_id", required = false) Long userId) {
        return dailyReportService.adminList(date, userId);
    }
}
