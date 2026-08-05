package com.example.fireinspection.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 現場登録・更新リクエスト
 */
public record SiteRequest(
        @NotBlank(message = "現場名を入力してください")
        String name,

        /** 住所 */
        String address,

        /** 建物用途 */
        String buildingType,

        /** 現場担当者名 */
        String contactName,

        /** 連絡先電話番号 */
        String contactPhone,

        /** 備考（入館方法など） */
        String note
) {
}
