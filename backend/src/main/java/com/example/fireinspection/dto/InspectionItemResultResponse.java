package com.example.fireinspection.dto;

import com.example.fireinspection.entity.ResultStatus;

/**
 * 点検項目+入力済み結果レスポンス（未入力はresult=null）
 */
public record InspectionItemResultResponse(
        Long itemId,
        Long equipmentCategoryId,
        String equipmentCategoryName,
        String name,
        Integer displayOrder,
        ResultStatus result,
        String note
) {
}
