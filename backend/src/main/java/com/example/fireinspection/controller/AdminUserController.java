package com.example.fireinspection.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.fireinspection.dto.UserCreateRequest;
import com.example.fireinspection.dto.UserResponse;
import com.example.fireinspection.dto.UserUpdateRequest;
import com.example.fireinspection.entity.Role;
import com.example.fireinspection.service.UserService;

import jakarta.validation.Valid;

/**
 * 職員マスタコントローラー（管理者向け）
 */
@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    /** 職員一覧（role / is_active フィルター任意） */
    @GetMapping
    public List<UserResponse> list(
            @RequestParam(name = "role", required = false) Role role,
            @RequestParam(name = "is_active", required = false) Boolean isActive) {
        return userService.list(role, isActive);
    }

    /** 職員新規登録 */
    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    /** 職員更新（passwordは指定時のみ変更） */
    @PutMapping("/{id}")
    public UserResponse update(@PathVariable(name = "id") Long id,
                               @Valid @RequestBody UserUpdateRequest request) {
        return userService.update(id, request);
    }

    /** 職員の論理削除 */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable(name = "id") Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
