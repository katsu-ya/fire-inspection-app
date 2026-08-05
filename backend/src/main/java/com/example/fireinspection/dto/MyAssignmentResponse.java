package com.example.fireinspection.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.fireinspection.entity.AssignmentStatus;

/**
 * 従業員向けルート割当レスポンス（点検報告の有無込み）
 */
public record MyAssignmentResponse(
        Long id,
        Long userId,
        String userName,
        LocalDate workDate,
        Integer visitOrder,
        AssignmentStatus status,
        LocalDateTime arrivedAt,
        LocalDateTime departedAt,
        String note,
        SiteSummaryResponse site,
        boolean hasReport
) {
}
