package com.example.fireinspection.entity;

import java.time.LocalDate;
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
 * ルート割当エンティティ（職員×日付×現場×訪問順。当日の作業状態も保持する）
 */
@Entity
@Table(name = "route_assignments")
@Getter
@Setter
@NoArgsConstructor
public class RouteAssignment {

    /** ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 担当職員ID */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** 現場ID */
    @Column(name = "site_id", nullable = false)
    private Long siteId;

    /** 作業日 */
    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    /** 訪問順（1始まり） */
    @Column(name = "visit_order", nullable = false)
    private Integer visitOrder;

    /** 作業状態 */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AssignmentStatus status = AssignmentStatus.NOT_STARTED;

    /** 到着報告日時 */
    @Column(name = "arrived_at")
    private LocalDateTime arrivedAt;

    /** 離脱報告日時 */
    @Column(name = "departed_at")
    private LocalDateTime departedAt;

    /** 管理者からの指示メモ */
    @Column(name = "note")
    private String note;

    /** 作成日時（DB側で自動設定） */
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    /** 更新日時（DB側で自動設定） */
    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
