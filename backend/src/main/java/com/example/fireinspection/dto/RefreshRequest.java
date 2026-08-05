package com.example.fireinspection.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * トークンリフレッシュリクエスト
 */
public record RefreshRequest(
        /** リフレッシュトークン */
        @NotBlank(message = "リフレッシュトークンを指定してください")
        String refreshToken
) {
}
