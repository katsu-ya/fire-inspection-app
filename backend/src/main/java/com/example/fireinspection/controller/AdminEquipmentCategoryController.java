package com.example.fireinspection.controller;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.fireinspection.dto.EquipmentCategoryResponse;
import com.example.fireinspection.service.EquipmentCategoryService;

/**
 * 設備カテゴリマスタコントローラー（管理者向け）
 */
@RestController
@RequestMapping("/api/v1/admin/equipment-categories")
public class AdminEquipmentCategoryController {

    private final EquipmentCategoryService equipmentCategoryService;

    public AdminEquipmentCategoryController(EquipmentCategoryService equipmentCategoryService) {
        this.equipmentCategoryService = equipmentCategoryService;
    }

    /** 設備カテゴリ一覧 */
    @GetMapping
    public List<EquipmentCategoryResponse> list() {
        return equipmentCategoryService.list();
    }
}