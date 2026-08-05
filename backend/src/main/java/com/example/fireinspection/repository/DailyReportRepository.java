package com.example.fireinspection.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.fireinspection.entity.DailyReport;

/**
 * 日報リポジトリ
 */
public interface DailyReportRepository extends JpaRepository<DailyReport, Long> {

    /** 職員×日付で検索 */
    Optional<DailyReport> findByUserIdAndWorkDate(Long userId, LocalDate workDate);

    /** 職員×日付での存在チェック */
    boolean existsByUserIdAndWorkDate(Long userId, LocalDate workDate);

    /** 日付の日報一覧を取得 */
    List<DailyReport> findByWorkDate(LocalDate workDate);

    /** 日付の提出済み日報数を集計 */
    long countByWorkDate(LocalDate workDate);
}
