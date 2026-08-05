package com.example.fireinspection.dto;

import com.example.fireinspection.entity.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 職員更新リクエスト（passwordは任意。指定時のみ変更）
 */
public record UserUpdateRequest(
        @NotBlank(message = "メールアドレスを入力してください")
        @Email(message = "メールアドレスの形式が不正です")
        String email,

        @NotBlank(message = "氏名を入力してください")
        String name,

        @NotNull(message = "ロールを指定してください")
        Role role,

        /** 有効フラグ（省略時は変更しない） */
        Boolean isActive,

        /** パスワード（省略時は変更しない） */
        String password
) {
}
