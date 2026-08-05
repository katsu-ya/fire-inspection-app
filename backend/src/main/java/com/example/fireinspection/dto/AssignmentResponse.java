package com.example.fireinspection.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.fireinspection.entity.AssignmentStatus;

/**
 * ルート割当レスポンス（管理者向け。担当職員・現場情報込み）
 */
public record AssignmentResponse(
        Long id,
        Long userId,
        String userName,
        LocalDate workDate,
        Integer visitOrder,
        AssignmentStatus status,
        LocalDateTime arrivedAt,
        LocalDateTime departedAt,
        String note,
        SiteSummaryResponse site
) {
}
