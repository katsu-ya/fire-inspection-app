package com.example.fireinspection.dto;

import com.example.fireinspection.entity.InspectionItem;

/**
 * 点検項目レスポンス
 */
public record InspectionItemResponse(
        Long id,
        Long equipmentCategoryId,
        String equipmentCategoryName,
        String name,
        Integer displayOrder,
        Boolean isActive
) {
    /** エンティティから生成する */
    public static InspectionItemResponse from(InspectionItem item) {
        return new InspectionItemResponse(
                item.getId(),
                item.getEquipmentCategory().getId(),
                item.getEquipmentCategory().getName(),
                item.getName(),
                item.getDisplayOrder(),
                item.getIsActive());
    }
}