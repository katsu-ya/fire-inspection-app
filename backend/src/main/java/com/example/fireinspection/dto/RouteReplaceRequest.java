package com.example.fireinspection.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/**
 * ルート丸ごと置き換えリクエスト
 */
public record RouteReplaceRequest(
        @NotNull(message = "職員IDを指定してください")
        Long userId,

        @NotNull(message = "作業日を指定してください")
        LocalDate workDate,

        /** 現場リスト（配列順=訪問順） */
        @NotNull(message = "現場リストを指定してください")
        @Valid
        List<RouteSiteRequest> sites
) {
}
