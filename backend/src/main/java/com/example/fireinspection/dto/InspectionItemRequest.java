package com.example.fireinspection.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 点検項目登録・更新リクエスト
 */
public record InspectionItemRequest(
        @NotBlank(message = "設備種別を入力してください")
        String category,

        @NotBlank(message = "点検内容を入力してください")
        String name,

        @NotNull(message = "表示順を指定してください")
        Integer displayOrder
) {
}
