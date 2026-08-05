package com.example.fireinspection.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * ユーザー（職員・管理者）エンティティ
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    /** ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** メールアドレス */
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    /** ハッシュ化パスワード */
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    /** 氏名 */
    @Column(name = "name", nullable = false)
    private String name;

    /** ロール */
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    /** 有効フラグ */
    @Column(name = "is_active")
    private Boolean isActive = true;

    /** 作成日時（DB側で自動設定） */
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    /** 更新日時（DB側で自動設定） */
    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
