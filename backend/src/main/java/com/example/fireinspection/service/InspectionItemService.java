package com.example.fireinspection.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fireinspection.dto.InspectionItemRequest;
import com.example.fireinspection.dto.InspectionItemResponse;
import com.example.fireinspection.entity.InspectionItem;
import com.example.fireinspection.exception.ApiException;
import com.example.fireinspection.repository.InspectionItemRepository;

/**
 * 点検項目マスタ管理サービス（管理者向け）
 */
@Service
public class InspectionItemService {

    private final InspectionItemRepository inspectionItemRepository;

    public InspectionItemService(InspectionItemRepository inspectionItemRepository) {
        this.inspectionItemRepository = inspectionItemRepository;
    }

    /**
     * 点検項目一覧（category, display_order順）
     */
    @Transactional(readOnly = true)
    public List<InspectionItemResponse> list() {
        return inspectionItemRepository.findAllByOrderByCategoryAscDisplayOrderAsc().stream()
                .map(InspectionItemResponse::from)
                .toList();
    }

    /**
     * 点検項目新規登録
     */
    @Transactional
    public InspectionItemResponse create(InspectionItemRequest request) {
        InspectionItem item = new InspectionItem();
        item.setCategory(request.category());
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
        item.setCategory(request.category());
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

    /** IDで点検項目を取得（存在しなければ404） */
    private InspectionItem findItem(Long id) {
        return inspectionItemRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "点検項目が見つかりません"));
    }
}
