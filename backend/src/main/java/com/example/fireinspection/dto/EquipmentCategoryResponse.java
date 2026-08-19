package com.example.fireinspection.dto;

import com.example.fireinspection.entity.EquipmentCategory;

/**
 * 設備カテゴリレスポンス
 */
public record EquipmentCategoryResponse(
        Long id,
        String name
) {
    /** エンティティから生成する */
    public static EquipmentCategoryResponse from(EquipmentCategory category) {
        return new EquipmentCategoryResponse(category.getId(), category.getName());
    }
}