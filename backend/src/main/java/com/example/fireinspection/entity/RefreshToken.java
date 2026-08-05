package com.example.fireinspection.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * リフレッシュトークンエンティティ
 */
@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
public class RefreshToken {

    /** ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ユーザーID */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** トークン文字列 */
    @Column(name = "token", nullable = false, unique = true)
    private String token;

    /** 有効期限 */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /** 作成日時（DB側で自動設定） */
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
