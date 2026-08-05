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
 * 現場マスタエンティティ
 */
@Entity
@Table(name = "sites")
@Getter
@Setter
@NoArgsConstructor
public class Site {

    /** ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 現場名（建物名） */
    @Column(name = "name", nullable = false)
    private String name;

    /** 住所 */
    @Column(name = "address")
    private String address;

    /** 建物用途 */
    @Column(name = "building_type")
    private String buildingType;

    /** 現場担当者名 */
    @Column(name = "contact_name")
    private String contactName;

    /** 連絡先電話番号 */
    @Column(name = "contact_phone")
    private String contactPhone;

    /** 備考（入館方法など） */
    @Column(name = "note")
    private String note;

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
