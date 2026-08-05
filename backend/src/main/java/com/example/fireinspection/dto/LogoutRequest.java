package com.example.fireinspection.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * ログアウトリクエスト
 */
public record LogoutRequest(
        /** 無効化するリフレッシュトークン */
        @NotBlank(message = "リフレッシュトークンを指定してください")
        String refreshToken
) {
}
