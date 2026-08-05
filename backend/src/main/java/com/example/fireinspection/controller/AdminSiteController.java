package com.example.fireinspection.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.fireinspection.dto.SiteRequest;
import com.example.fireinspection.dto.SiteResponse;
import com.example.fireinspection.service.SiteService;

import jakarta.validation.Valid;

/**
 * 現場マスタコントローラー（管理者向け）
 */
@RestController
@RequestMapping("/api/v1/admin/sites")
public class AdminSiteController {

    private final SiteService siteService;

    public AdminSiteController(SiteService siteService) {
        this.siteService = siteService;
    }

    /** 現場一覧（keywordで名称・住所を部分一致検索可） */
    @GetMapping
    public List<SiteResponse> list(@RequestParam(name = "keyword", required = false) String keyword) {
        return siteService.list(keyword);
    }

    /** 現場新規登録 */
    @PostMapping
    public ResponseEntity<SiteResponse> create(@Valid @RequestBody SiteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(siteService.create(request));
    }

    /** 現場詳細 */
    @GetMapping("/{id}")
    public SiteResponse get(@PathVariable(name = "id") Long id) {
        return siteService.get(id);
    }

    /** 現場更新 */
    @PutMapping("/{id}")
    public SiteResponse update(@PathVariable(name = "id") Long id,
                               @Valid @RequestBody SiteRequest request) {
        return siteService.update(id, request);
    }

    /** 現場の論理削除 */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable(name = "id") Long id) {
        siteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
