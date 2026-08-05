package com.example.fireinspection.entity;

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
 * 点検結果エンティティ（点検項目ごとの結果）
 */
@Entity
@Table(name = "inspection_results")
@Getter
@Setter
@NoArgsConstructor
public class InspectionResult {

    /** ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 点検報告ID */
    @Column(name = "inspection_report_id", nullable = false)
    private Long inspectionReportId;

    /** 点検項目ID */
    @Column(name = "inspection_item_id", nullable = false)
    private Long inspectionItemId;

    /** 結果（良/不良/対象外） */
    @Enumerated(EnumType.STRING)
    @Column(name = "result", nullable = false)
    private ResultStatus result;

    /** 指摘事項 */
    @Column(name = "note")
    private String note;
}
