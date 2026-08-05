package com.example.fireinspection.dto;

import java.time.LocalDate;

/**
 * 週間実績レスポンス（棒グラフ用）
 */
public record WeeklyCountResponse(
        LocalDate date,
        /** 予定現場数 */
        long planned,
        /** 完了現場数 */
        long completed
) {
}
