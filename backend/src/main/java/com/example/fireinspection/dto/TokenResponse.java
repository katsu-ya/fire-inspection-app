package com.example.fireinspection.dto;

/**
 * ログイン成功レスポンス（トークン+ユーザー情報）
 */
public record TokenResponse(
        String accessToken,
        String refreshToken,
        UserResponse user
) {
}
