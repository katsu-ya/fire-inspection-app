package com.example.fireinspection.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * ログインリクエスト
 */
public record LoginRequest(
        /** メールアドレス */
        @NotBlank(message = "メールアドレスを入力してください")
        @Email(message = "メールアドレスの形式が不正です")
        String email,

        /** パスワード */
        @NotBlank(message = "パスワードを入力してください")
        String password
) {
}
