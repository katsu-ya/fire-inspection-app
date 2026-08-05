package com.example.fireinspection.dto;

import com.example.fireinspection.entity.Site;

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
        Boolean isActive
) {
    /** エンティティから生成する */
    public static SiteResponse from(Site site) {
        return new SiteResponse(site.getId(), site.getName(), site.getAddress(), site.getBuildingType(),
                site.getContactName(), site.getContactPhone(), site.getNote(), site.getIsActive());
    }
}
