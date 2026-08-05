package com.example.fireinspection.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.fireinspection.dto.DailyReportPreviewResponse;
import com.example.fireinspection.dto.DailyReportSubmitRequest;
import com.example.fireinspection.dto.InspectionFormResponse;
import com.example.fireinspection.dto.InspectionSaveRequest;
import com.example.fireinspection.dto.MyAssignmentResponse;
import com.example.fireinspection.dto.MyRoutesResponse;
import com.example.fireinspection.security.AppUserDetails;
import com.example.fireinspection.service.AssignmentService;
import com.example.fireinspection.service.DailyReportService;

import jakarta.validation.Valid;

/**
 * 従業員向けコントローラー（本人のデータのみ操作可能）
 */
@RestController
@RequestMapping("/api/v1/me")
public class MeController {

    private final AssignmentService assignmentService;
    private final DailyReportService dailyReportService;

    public MeController(AssignmentService assignmentService, DailyReportService dailyReportService) {
        this.assignmentService = assignmentService;
        this.dailyReportService = dailyReportService;
    }

    /** 自分のルート取得（date省略時は当日） */
    @GetMapping("/routes")
    public MyRoutesResponse routes(
            @AuthenticationPrincipal AppUserDetails principal,
            @RequestParam(name = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return assignmentService.getMyRoutes(principal.getUser(), date);
    }

    /** 到着報告 */
    @PostMapping("/assignments/{id}/arrive")
    public MyAssignmentResponse arrive(
            @AuthenticationPrincipal AppUserDetails principal,
            @PathVariable(name = "id") Long id) {
        return assignmentService.arrive(principal.getUser(), id);
    }

    /** 離脱報告 */
    @PostMapping("/assignments/{id}/depart")
    public MyAssignmentResponse depart(
            @AuthenticationPrincipal AppUserDetails principal,
            @PathVariable(name = "id") Long id) {
        return assignmentService.depart(principal.getUser(), id);
    }

    /** 点検フォーマット+入力済み結果の取得 */
    @GetMapping("/assignments/{id}/inspection")
    public InspectionFormResponse getInspection(
            @AuthenticationPrincipal AppUserDetails principal,
            @PathVariable(name = "id") Long id) {
        return assignmentService.getInspection(principal.getUser(), id);
    }

    /** 点検報告の保存（upsert） */
    @PutMapping("/assignments/{id}/inspection")
    public InspectionFormResponse saveInspection(
            @AuthenticationPrincipal AppUserDetails principal,
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody InspectionSaveRequest request) {
        return assignmentService.saveInspection(principal.getUser(), id, request);
    }

    /** 日報プレビュー（date省略時は当日） */
    @GetMapping("/daily-report")
    public DailyReportPreviewResponse dailyReportPreview(
            @AuthenticationPrincipal AppUserDetails principal,
            @RequestParam(name = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return dailyReportService.preview(principal.getUser(), date);
    }

    /** 日報提出 */
    @PostMapping("/daily-report")
    public ResponseEntity<DailyReportPreviewResponse> submitDailyReport(
            @AuthenticationPrincipal AppUserDetails principal,
            @Valid @RequestBody DailyReportSubmitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(dailyReportService.submit(principal.getUser(), request));
    }
}
