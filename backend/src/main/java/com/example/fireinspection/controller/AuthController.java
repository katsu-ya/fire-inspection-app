package com.example.fireinspection.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.fireinspection.dto.AccessTokenResponse;
import com.example.fireinspection.dto.LoginRequest;
import com.example.fireinspection.dto.LogoutRequest;
import com.example.fireinspection.dto.RefreshRequest;
import com.example.fireinspection.dto.TokenResponse;
import com.example.fireinspection.dto.UserResponse;
import com.example.fireinspection.security.AppUserDetails;
import com.example.fireinspection.service.AuthService;

import jakarta.validation.Valid;

/**
 * 認証コントローラー
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** ログイン */
    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /** アクセストークンの再発行 */
    @PostMapping("/refresh")
    public AccessTokenResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request.refreshToken());
    }

    /** ログアウト（リフレッシュトークンの無効化） */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.noContent().build();
    }

    /** 認証済みユーザー情報の取得 */
    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal AppUserDetails principal) {
        return UserResponse.from(principal.getUser());
    }
}
