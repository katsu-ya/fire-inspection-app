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
 * 点検報告エンティティ（ルート割当と1:1）
 */
@Entity
@Table(name = "inspection_reports")
@Getter
@Setter
@NoArgsConstructor
public class InspectionReport {

    /** ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ルート割当ID */
    @Column(name = "route_assignment_id", nullable = false, unique = true)
    private Long routeAssignmentId;

    /** 現場全体の所見 */
    @Column(name = "remarks")
    private String remarks;

    /** 作成日時（DB側で自動設定） */
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    /** 更新日時（DB側で自動設定） */
    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
