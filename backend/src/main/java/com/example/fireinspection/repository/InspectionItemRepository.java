package com.example.fireinspection.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.fireinspection.entity.InspectionItem;

/**
 * 点検項目マスタリポジトリ
 */
public interface InspectionItemRepository extends JpaRepository<InspectionItem, Long> {

    /** 全件取得（設備カテゴリ・表示順） */
    List<InspectionItem> findAllByOrderByEquipmentCategoryIdAscDisplayOrderAsc();

    /** 有効な項目のみ取得（表示順） */
    List<InspectionItem> findByIsActiveTrueOrderByDisplayOrderAsc();

    /** 指定した設備カテゴリIDの一覧に属する、点検項目を取得する（参照側・新規追加） */
    List<InspectionItem> findByEquipmentCategoryIdInOrderByEquipmentCategoryIdAscDisplayOrderAsc(List<Long> equipmentCategoryIds);

    /** 指定した設備カテゴリIDの一覧に属し、有効な、点検項目を取得する（点検フォーム表示用・新規追加） */
    List<InspectionItem> findByEquipmentCategoryIdInAndIsActiveTrueOrderByDisplayOrderAsc(List<Long> equipmentCategoryIds);
}
