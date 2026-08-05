package com.example.fireinspection.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * 従業員向けルート一覧レスポンス
 */
public record MyRoutesResponse(
        LocalDate workDate,
        List<MyAssignmentResponse> assignments
) {
}
