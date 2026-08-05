package com.example.fireinspection.dto;

import com.example.fireinspection.entity.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 職員新規登録リクエスト
 */
public record UserCreateRequest(
        @NotBlank(message = "メールアドレスを入力してください")
        @Email(message = "メールアドレスの形式が不正です")
        String email,

        @NotBlank(message = "パスワードを入力してください")
        String password,

        @NotBlank(message = "氏名を入力してください")
        String name,

        @NotNull(message = "ロールを指定してください")
        Role role
) {
}
