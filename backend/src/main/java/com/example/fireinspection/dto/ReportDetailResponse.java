package com.example.fireinspection.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.example.fireinspection.entity.AssignmentStatus;

/**
 * 点検報告詳細レスポンス（管理者向け）
 */
public record ReportDetailResponse(
        Long assignmentId,
        LocalDate workDate,
        String userName,
        AssignmentStatus status,
        LocalDateTime arrivedAt,
        LocalDateTime departedAt,
        /** 現場全体の所見（報告未保存ならnull） */
        String remarks,
        SiteSummaryResponse site,
        /** 項目別結果（未入力項目はresult=null） */
        List<InspectionItemResultResponse> items
) {
}
