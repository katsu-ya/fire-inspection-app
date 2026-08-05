package com.example.fireinspection.dto;

import com.example.fireinspection.entity.Site;

/**
 * 現場概要レスポンス（assignmentに埋め込む形）
 */
public record SiteSummaryResponse(
        Long id,
        String name,
        String address,
        String buildingType,
        String contactName,
        String contactPhone,
        String note
) {
    /** エンティティから生成する */
    public static SiteSummaryResponse from(Site site) {
        return new SiteSummaryResponse(site.getId(), site.getName(), site.getAddress(), site.getBuildingType(),
                site.getContactName(), site.getContactPhone(), site.getNote());
    }
}
