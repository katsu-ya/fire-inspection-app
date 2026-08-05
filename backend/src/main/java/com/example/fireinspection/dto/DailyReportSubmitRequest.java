package com.example.fireinspection.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

/**
 * 日報提出リクエスト（作業時間はサーバー側で自動計算するため送信しない）
 */
public record DailyReportSubmitRequest(
        @NotNull(message = "作業日を指定してください")
        LocalDate workDate,

        /** 特記事項（任意） */
        String specialNote
) {
}
