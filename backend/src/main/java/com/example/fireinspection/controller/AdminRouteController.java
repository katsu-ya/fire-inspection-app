package com.example.fireinspection.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.fireinspection.dto.AssignmentResponse;
import com.example.fireinspection.dto.RouteBulkRequest;
import com.example.fireinspection.dto.RouteReplaceRequest;
import com.example.fireinspection.service.RouteService;

import jakarta.validation.Valid;

/**
 * ルート設定コントローラー（管理者向け）
 */
@RestController
@RequestMapping("/api/v1/admin/routes")
public class AdminRouteController {

    private final RouteService routeService;

    public AdminRouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    /** 指定範囲の割当一覧（site・status込み） */
    @GetMapping
    public List<AssignmentResponse> list(
            @RequestParam(name = "user_id", required = false) Long userId,
            @RequestParam(name = "date_from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(name = "date_to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return routeService.search(userId, dateFrom, dateTo);
    }

    /** 指定日のルートを丸ごと置き換え（配列順=訪問順） */
    @PutMapping
    public List<AssignmentResponse> replace(@Valid @RequestBody RouteReplaceRequest request) {
        return routeService.replace(request);
    }

    /** 期間一括設定（同じ現場に連日通うケース用） */
    @PostMapping("/bulk")
    public List<AssignmentResponse> bulk(@Valid @RequestBody RouteBulkRequest request) {
        return routeService.bulk(request);
    }
}
