package com.example.fireinspection.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.fireinspection.entity.InspectionReport;

/**
 * 点検報告リポジトリ
 */
public interface InspectionReportRepository extends JpaRepository<InspectionReport, Long> {

    /** ルート割当IDで検索 */
    Optional<InspectionReport> findByRouteAssignmentId(Long routeAssignmentId);

    /** ルート割当IDでの存在チェック */
    boolean existsByRouteAssignmentId(Long routeAssignmentId);

    /** 複数のルート割当IDに紐づく報告を取得 */
    List<InspectionReport> findByRouteAssignmentIdIn(Collection<Long> routeAssignmentIds);
}
