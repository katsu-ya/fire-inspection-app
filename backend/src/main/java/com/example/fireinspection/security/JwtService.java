package com.example.fireinspection.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.fireinspection.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * JWTアクセストークンの生成・検証サービス
 */
@Service
public class JwtService {

    /** 署名鍵 */
    private final SecretKey key;

    /** アクセストークン有効期間（分） */
    private final long accessTokenExpireMinutes;

    /** リフレッシュトークン有効期間（日） */
    private final long refreshTokenExpireDays;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-expire-minutes}") long accessTokenExpireMinutes,
            @Value("${app.jwt.refresh-token-expire-days}") long refreshTokenExpireDays) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpireMinutes = accessTokenExpireMinutes;
        this.refreshTokenExpireDays = refreshTokenExpireDays;
    }

    /**
     * アクセストークンを生成する（subject=メールアドレス）
     */
    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(accessTokenExpireMinutes * 60);
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("uid", user.getId())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(key)
                .compact();
    }

    /**
     * トークンを検証してsubject（メールアドレス）を取り出す。
     * 無効・期限切れの場合は JwtException を投げる。
     */
    public String extractSubject(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    /** リフレッシュトークン有効期間（日）を返す */
    public long getRefreshTokenExpireDays() {
        return refreshTokenExpireDays;
    }
}
