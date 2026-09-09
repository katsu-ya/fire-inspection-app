package com.example.fireinspection.repository;

import com.example.fireinspection.entity.SiteEquipmentCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 現場×設備カテゴリリポジトリ
 */
public interface SiteEquipmentCategoryRepository extends JpaRepository<SiteEquipmentCategory, Long> {

    /** 対象の現場に紐づく、設備カテゴリの一覧を取得する */
    List<SiteEquipmentCategory> findBySiteId(Long siteId);
}