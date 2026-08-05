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
 * 点検項目マスタエンティティ（全現場共通フォーマット）
 */
@Entity
@Table(name = "inspection_items")
@Getter
@Setter
@NoArgsConstructor
public class InspectionItem {

    /** ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 設備種別（消火器具・自動火災報知設備など） */
    @Column(name = "category", nullable = false)
    private String category;

    /** 点検内容 */
    @Column(name = "name", nullable = false)
    private String name;

    /** 表示順 */
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    /** 有効フラグ */
    @Column(name = "is_active")
    private Boolean isActive = true;

    /** 作成日時（DB側で自動設定） */
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
