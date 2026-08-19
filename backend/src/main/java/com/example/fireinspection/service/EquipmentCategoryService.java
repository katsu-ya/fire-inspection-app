package com.example.fireinspection.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.fireinspection.dto.EquipmentCategoryResponse;
import com.example.fireinspection.repository.EquipmentCategoryRepository;

/**
 * 設備カテゴリマスタ管理サービス（管理者向け）
 */
@Service
public class EquipmentCategoryService {

    private final EquipmentCategoryRepository equipmentCategoryRepository;

    public EquipmentCategoryService(EquipmentCategoryRepository equipmentCategoryRepository) {
        this.equipmentCategoryRepository = equipmentCategoryRepository;
    }

    /** 設備カテゴリ一覧 */
    @Transactional(readOnly = true)
    public List<EquipmentCategoryResponse> list() {
        return equipmentCategoryRepository.findAll().stream()
                .map(EquipmentCategoryResponse::from)
                .toList();
    }
}