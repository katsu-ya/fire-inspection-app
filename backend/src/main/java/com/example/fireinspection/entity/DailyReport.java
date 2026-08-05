package com.example.fireinspection.entity;

import java.time.LocalDate;
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
 * 日報エンティティ（職員×日付で1件）
 */
@Entity
@Table(name = "daily_reports")
@Getter
@Setter
@NoArgsConstructor
public class DailyReport {

    /** ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 職員ID */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** 作業日 */
    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    /** 特記事項 */
    @Column(name = "special_note")
    private String specialNote;

    /** 提出日時 */
    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;
}
