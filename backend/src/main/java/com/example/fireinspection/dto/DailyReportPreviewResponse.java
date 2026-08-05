package com.example.fireinspection.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 日報プレビューレスポンス（従業員向け）
 */
public record DailyReportPreviewResponse(
        LocalDate workDate,
        /** 提出済みか */
        boolean submitted,
        /** 特記事項（未提出ならnull） */
        String specialNote,
        /** 提出日時（未提出ならnull） */
        LocalDateTime submittedAt,
        /** 訪問実績（訪問順） */
        List<VisitSummaryResponse> visits,
        /** 合計作業時間（分） */
        long totalMinutes,
        /** 全現場が完了しているか */
        boolean allCompleted
) {
}
