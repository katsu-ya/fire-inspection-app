package com.example.fireinspection.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.fireinspection.entity.RouteAssignment;

/**
 * ルート割当リポジトリ
 */
public interface RouteAssignmentRepository extends JpaRepository<RouteAssignment, Long> {

    /** 職員×日付の割当を訪問順で取得 */
    List<RouteAssignment> findByUserIdAndWorkDateOrderByVisitOrderAsc(Long userId, LocalDate workDate);

    /** 日付の全割当を職員・訪問順で取得 */
    List<RouteAssignment> findByWorkDateOrderByUserIdAscVisitOrderAsc(LocalDate workDate);

    /** 期間内の全割当を取得 */
    List<RouteAssignment> findByWorkDateBetween(LocalDate dateFrom, LocalDate dateTo);

    /** 管理者向け検索（条件はすべて任意。作業日・職員・訪問順で整列） */
    @Query("""
            SELECT ra FROM RouteAssignment ra
            WHERE (:userId IS NULL OR ra.userId = :userId)
              AND (:dateFrom IS NULL OR ra.workDate >= :dateFrom)
              AND (:dateTo IS NULL OR ra.workDate <= :dateTo)
            ORDER BY ra.workDate ASC, ra.userId ASC, ra.visitOrder ASC
            """)
    List<RouteAssignment> search(@Param("userId") Long userId,
                                 @Param("dateFrom") LocalDate dateFrom,
                                 @Param("dateTo") LocalDate dateTo);
}
