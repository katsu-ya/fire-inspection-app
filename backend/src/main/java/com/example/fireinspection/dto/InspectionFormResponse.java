package com.example.fireinspection.dto;

import java.util.List;

/**
 * 点検フォーマット+入力済み結果レスポンス
 */
public record InspectionFormResponse(
        /** 現場全体の所見 */
        String remarks,
        /** 点検項目一覧（結果込み） */
        List<InspectionItemResultResponse> items
) {
}
