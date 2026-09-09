package com.example.fireinspection.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fireinspection.dto.InspectionItemRequest;
import com.example.fireinspection.dto.InspectionItemResponse;
import com.example.fireinspection.entity.EquipmentCategory;
import com.example.fireinspection.entity.InspectionItem;
import com.example.fireinspection.exception.ApiException;
import com.example.fireinspection.repository.EquipmentCategoryRepository;
import com.example.fireinspection.repository.InspectionItemRepository;
import com.example.fireinspection.repository.SiteEquipmentCategoryRepository;

/**
 * 点検項目マスタ管理サービス（管理者向け）
 */
@Service
public class InspectionItemService {

    private final InspectionItemRepository inspectionItemRepository;
    private final EquipmentCategoryRepository equipmentCategoryRepository;
    private final SiteEquipmentCategoryRepository siteEquipmentCategoryRepository;

    public InspectionItemService(
            InspectionItemRepository inspectionItemRepository,
            EquipmentCategoryRepository equipmentCategoryRepository,
            SiteEquipmentCategoryRepository siteEquipmentCategoryRepository) {
        this.inspectionItemRepository = inspectionItemRepository;
        this.equipmentCategoryRepository = equipmentCategoryRepository;
        this.siteEquipmentCategoryRepository = siteEquipmentCategoryRepository;
    }

    /**
     * 点検項目一覧（category, display_order順）
     */
    @Transactional(readOnly = true)
    public List<InspectionItemResponse> list() {
        return inspectionItemRepository.findAllByOrderByEquipmentCategoryIdAscDisplayOrderAsc().stream()
                .map(InspectionItemResponse::from)
                .toList();
    }

    /**
     * 点検項目新規登録
     */
    @Transactional
    public InspectionItemResponse create(InspectionItemRequest request) {
        InspectionItem item = new InspectionItem();
        item.setEquipmentCategory(findCategory(request.equipmentCategoryId()));
        item.setName(request.name());
        item.setDisplayOrder(request.displayOrder());
        item.setIsActive(true);
        return InspectionItemResponse.from(inspectionItemRepository.save(item));
    }

    /**
     * 点検項目更新
     */
    @Transactional
    public InspectionItemResponse update(Long id, InspectionItemRequest request) {
        InspectionItem item = findItem(id);
        item.setEquipmentCategory(findCategory(request.equipmentCategoryId()));
        item.setName(request.name());
        item.setDisplayOrder(request.displayOrder());
        return InspectionItemResponse.from(inspectionItemRepository.save(item));
    }

    /**
     * 点検項目の論理削除（is_active=false）
     */
    @Transactional
    public void delete(Long id) {
        InspectionItem item = findItem(id);
        item.setIsActive(false);
        inspectionItemRepository.save(item);
    }

    /**
     * 現場IDに紐づく設備カテゴリで、点検項目を絞り込んで取得する（参照側・新規追加）
     */
    @Transactional(readOnly = true)
    public List<InspectionItemResponse> findBySiteId(Long siteId) {
        List<Long> categoryIds = siteEquipmentCategoryRepository.findBySiteId(siteId).stream()
                .map(link -> link.getEquipmentCategory().getId())
                .toList();
        return inspectionItemRepository.findByEquipmentCategoryIdInOrderByEquipmentCategoryIdAscDisplayOrderAsc(categoryIds)
                .stream()
                .map(InspectionItemResponse::from)
                .toList();
    }

    /** IDで点検項目を取得（存在しなければ404） */
    private InspectionItem findItem(Long id) {
        return inspectionItemRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "点検項目が見つかりません"));
    }

    /** IDで設備カテゴリを取得（存在しなければ400） */
    private EquipmentCategory findCategory(Long id) {
        return equipmentCategoryRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "設備カテゴリが見つかりません"));
    }
}