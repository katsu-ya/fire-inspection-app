package com.example.fireinspection.entity;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 現場×設備カテゴリの紐付けエンティティ
 */
@Entity
@Table(name = "site_equipment_categories")
@Getter
@Setter
@NoArgsConstructor
public class SiteEquipmentCategory {

    /** ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 現場 */
    @ManyToOne
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    /** 設備カテゴリ */
    @ManyToOne
    @JoinColumn(name = "equipment_category_id", nullable = false)
    private EquipmentCategory equipmentCategory;

    /** 作成日時（DB側で自動設定） */
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}