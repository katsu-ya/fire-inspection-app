package com.example.fireinspection.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.fireinspection.entity.InspectionItem;

/**
 * 点検項目マスタリポジトリ
 */
public interface InspectionItemRepository extends JpaRepository<InspectionItem, Long> {

    /** 全件取得（カテゴリ・表示順） */
    List<InspectionItem> findAllByOrderByCategoryAscDisplayOrderAsc();

    /** 有効な項目のみ取得（表示順） */
    List<InspectionItem> findByIsActiveTrueOrderByDisplayOrderAsc();
}
