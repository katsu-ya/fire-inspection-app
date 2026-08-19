package com.example.fireinspection.dto;

import com.example.fireinspection.entity.Site;
import java.util.List;

/**
 * 現場レスポンス（管理画面用。有効フラグ込み）
 */
public record SiteResponse(
        Long id,
        String name,
        String address,
        String buildingType,
        String contactName,
        String contactPhone,
        String note,
        Boolean isActive,
        List<EquipmentCategoryResponse> equipmentCategories
) {
    /** エンティティから生成する（設備カテゴリの一覧も、あわせて渡す） */
    public static SiteResponse from(Site site, List<EquipmentCategoryResponse> equipmentCategories) {
        return new SiteResponse(site.getId(), site.getName(), site.getAddress(), site.getBuildingType(),
                site.getContactName(), site.getContactPhone(), site.getNote(), site.getIsActive(),
                equipmentCategories);
    }
}
