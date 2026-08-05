package com.example.fireinspection.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/**
 * 点検報告保存リクエスト（upsert）
 */
public record InspectionSaveRequest(
        /** 現場全体の所見 */
        String remarks,

        /** 点検結果リスト */
        @NotNull(message = "点検結果を指定してください")
        @Valid
        List<InspectionResultRequest> results
) {
}
