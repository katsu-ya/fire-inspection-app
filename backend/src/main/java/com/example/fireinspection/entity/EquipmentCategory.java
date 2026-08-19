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
 * 設備カテゴリマスタエンティティ
 */
@Entity
@Table(name = "equipment_categories")
@Getter
@Setter
@NoArgsConstructor
public class EquipmentCategory {

    /** ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** カテゴリ名 */
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    /** 作成日時（DB側で自動設定） */
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}