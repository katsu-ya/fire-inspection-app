package com.example.fireinspection.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 点検項目登録・更新リクエスト
 */
public record InspectionItemRequest(
        @NotNull(message = "設備カテゴリを選択してください")
        Long equipmentCategoryId,
        @NotBlank(message = "点検内容を入力してください")
        String name,
        @NotNull(message = "表示順を指定してください")
        Integer displayOrder
) {
}
