package com.example.fireinspection.dto;

import com.example.fireinspection.entity.ResultStatus;

import jakarta.validation.constraints.NotNull;

/**
 * 点検結果入力（項目単位）
 */
public record InspectionResultRequest(
        @NotNull(message = "点検項目IDを指定してください")
        Long itemId,

        @NotNull(message = "点検結果を指定してください")
        ResultStatus result,

        /** 指摘事項（任意） */
        String note
) {
}
