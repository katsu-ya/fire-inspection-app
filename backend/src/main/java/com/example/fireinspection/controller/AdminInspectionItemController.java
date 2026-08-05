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
import org.springframework.web.bind.annotation.RestController;

import com.example.fireinspection.dto.InspectionItemRequest;
import com.example.fireinspection.dto.InspectionItemResponse;
import com.example.fireinspection.service.InspectionItemService;

import jakarta.validation.Valid;

/**
 * 点検項目マスタコントローラー（管理者向け）
 */
@RestController
@RequestMapping("/api/v1/admin/inspection-items")
public class AdminInspectionItemController {

    private final InspectionItemService inspectionItemService;

    public AdminInspectionItemController(InspectionItemService inspectionItemService) {
        this.inspectionItemService = inspectionItemService;
    }

    /** 点検項目一覧（category, display_order順） */
    @GetMapping
    public List<InspectionItemResponse> list() {
        return inspectionItemService.list();
    }

    /** 点検項目新規登録 */
    @PostMapping
    public ResponseEntity<InspectionItemResponse> create(@Valid @RequestBody InspectionItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inspectionItemService.create(request));
    }

    /** 点検項目更新 */
    @PutMapping("/{id}")
    public InspectionItemResponse update(@PathVariable(name = "id") Long id,
                                         @Valid @RequestBody InspectionItemRequest request) {
        return inspectionItemService.update(id, request);
    }

    /** 点検項目の論理削除 */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable(name = "id") Long id) {
        inspectionItemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
