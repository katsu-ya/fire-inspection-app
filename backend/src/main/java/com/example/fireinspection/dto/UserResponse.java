package com.example.fireinspection.dto;

import com.example.fireinspection.entity.Role;
import com.example.fireinspection.entity.User;

/**
 * ユーザー情報レスポンス
 */
public record UserResponse(
        Long id,
        String email,
        String name,
        Role role,
        Boolean isActive
) {
    /** エンティティから生成する */
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getName(), user.getRole(), user.getIsActive());
    }
}
