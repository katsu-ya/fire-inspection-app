package com.example.fireinspection.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/**
 * ルート期間一括設定リクエスト（同じ現場に1週間通うケース用）
 */
public record RouteBulkRequest(
        @NotNull(message = "職員IDを指定してください")
        Long userId,

        @NotNull(message = "開始日を指定してください")
        LocalDate dateFrom,

        @NotNull(message = "終了日を指定してください")
        LocalDate dateTo,

        /** 土日をスキップするか（省略時はfalse） */
        Boolean skipWeekends,

        /** 現場リスト（配列順=訪問順） */
        @NotNull(message = "現場リストを指定してください")
        @Valid
        List<RouteSiteRequest> sites
) {
}
