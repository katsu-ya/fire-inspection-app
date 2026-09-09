package com.example.fireinspection.repository;

import com.example.fireinspection.entity.EquipmentCategory;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 設備カテゴリマスタリポジトリ
 */
public interface EquipmentCategoryRepository extends JpaRepository<EquipmentCategory, Long> {
}
