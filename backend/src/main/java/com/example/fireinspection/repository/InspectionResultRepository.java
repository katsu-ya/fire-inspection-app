package com.example.fireinspection.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.fireinspection.entity.InspectionResult;
import com.example.fireinspection.entity.ResultStatus;

/**
 * 点検結果リポジトリ
 */
public interface InspectionResultRepository extends JpaRepository<InspectionResult, Long> {

    /** 点検報告IDで結果一覧を取得 */
    List<InspectionResult> findByInspectionReportId(Long inspectionReportId);

    /** 点検報告IDで結果を全削除 */
    void deleteByInspectionReportId(Long inspectionReportId);

    /** 指定日の指定結果（FAIL等）の件数を集計 */
    @Query("""
            SELECT COUNT(r.id) FROM InspectionResult r, InspectionReport ir, RouteAssignment ra
            WHERE r.inspectionReportId = ir.id
              AND ir.routeAssignmentId = ra.id
              AND ra.workDate = :workDate
              AND r.result = :result
            """)
    long countByWorkDateAndResult(@Param("workDate") LocalDate workDate,
                                  @Param("result") ResultStatus result);

    /** 期間内の指定結果（FAIL等）の件数を設備カテゴリ別に集計（件数降順） */
    @Query("""
            SELECT it.category, COUNT(r.id)
            FROM InspectionResult r, InspectionReport ir, RouteAssignment ra, InspectionItem it
            WHERE r.inspectionReportId = ir.id
              AND ir.routeAssignmentId = ra.id
              AND r.inspectionItemId = it.id
              AND r.result = :result
              AND (:dateFrom IS NULL OR ra.workDate >= :dateFrom)
              AND (:dateTo IS NULL OR ra.workDate <= :dateTo)
            GROUP BY it.category
            ORDER BY COUNT(r.id) DESC
            """)
    List<Object[]> countByCategoryAndResult(@Param("dateFrom") LocalDate dateFrom,
                                            @Param("dateTo") LocalDate dateTo,
                                            @Param("result") ResultStatus result);
}
