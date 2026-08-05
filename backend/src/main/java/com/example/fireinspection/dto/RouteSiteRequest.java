package com.example.fireinspection.dto;

import jakarta.validation.constraints.NotNull;

/**
 * ルート設定の現場指定（配列順=訪問順）
 */
public record RouteSiteRequest(
        @NotNull(message = "現場IDを指定してください")
        Long siteId,

        /** 管理者からの指示メモ（任意） */
        String note
) {
}
