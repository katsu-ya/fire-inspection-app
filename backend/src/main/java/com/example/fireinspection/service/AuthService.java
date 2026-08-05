package com.example.fireinspection.service;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fireinspection.common.DateTimeUtil;
import com.example.fireinspection.dto.AccessTokenResponse;
import com.example.fireinspection.dto.LoginRequest;
import com.example.fireinspection.dto.TokenResponse;
import com.example.fireinspection.dto.UserResponse;
import com.example.fireinspection.entity.RefreshToken;
import com.example.fireinspection.entity.User;
import com.example.fireinspection.exception.ApiException;
import com.example.fireinspection.repository.RefreshTokenRepository;
import com.example.fireinspection.repository.UserRepository;
import com.example.fireinspection.security.JwtService;

/**
 * 認証サービス（ログイン・トークンリフレッシュ・ログアウト）
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
                       JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * ログイン（アクセストークン+リフレッシュトークンを発行する）
     */
    @Transactional
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(this::invalidCredentials);
        if (!Boolean.TRUE.equals(user.getIsActive())
                || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }

        String accessToken = jwtService.generateAccessToken(user);

        // リフレッシュトークンはランダム文字列としてDBに保存する
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(user.getId());
        refreshToken.setToken(UUID.randomUUID().toString() + UUID.randomUUID().toString());
        refreshToken.setExpiresAt(DateTimeUtil.now().plusDays(jwtService.getRefreshTokenExpireDays()));
        refreshTokenRepository.save(refreshToken);

        return new TokenResponse(accessToken, refreshToken.getToken(), UserResponse.from(user));
    }

    /**
     * アクセストークンの再発行
     */
    @Transactional
    public AccessTokenResponse refresh(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "リフレッシュトークンが無効です"));

        // 有効期限の検証（期限切れは削除して401）
        if (refreshToken.getExpiresAt().isBefore(DateTimeUtil.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "リフレッシュトークンの有効期限が切れています");
        }

        User user = userRepository.findById(refreshToken.getUserId())
                .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "ユーザーが無効です"));

        return new AccessTokenResponse(jwtService.generateAccessToken(user));
    }

    /**
     * ログアウト（リフレッシュトークンを無効化する）
     */
    @Transactional
    public void logout(String token) {
        refreshTokenRepository.deleteByToken(token);
    }

    /** 認証失敗エラー */
    private ApiException invalidCredentials() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "メールアドレスまたはパスワードが正しくありません");
    }
}
