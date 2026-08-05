package com.example.fireinspection.dto;

/**
 * 不良（FAIL）件数の設備カテゴリ別集計レスポンス
 */
public record FailCategoryResponse(
        String category,
        long count
) {
}
