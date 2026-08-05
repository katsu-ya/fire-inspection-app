package com.example.fireinspection.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 管理者向け日報一覧レスポンス（従業員向けプレビューと同じ集計+職員情報）
 */
public record AdminDailyReportResponse(
        Long userId,
        String userName,
        LocalDate workDate,
        boolean submitted,
        String specialNote,
        LocalDateTime submittedAt,
        List<VisitSummaryResponse> visits,
        long totalMinutes,
        boolean allCompleted
) {
}
