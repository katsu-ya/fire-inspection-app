package com.example.fireinspection.dto;

import java.time.LocalDateTime;

import com.example.fireinspection.entity.AssignmentStatus;

/**
 * 日報の訪問実績（1現場分）
 */
public record VisitSummaryResponse(
        /** ルート割当ID（管理者画面から点検報告詳細へ遷移するために使用） */
        Long assignmentId,
        String siteName,
        AssignmentStatus status,
        LocalDateTime arrivedAt,
        LocalDateTime departedAt,
        /** 作業時間（分）。到着・離脱が揃っていない場合はnull */
        Long durationMinutes
) {
}
