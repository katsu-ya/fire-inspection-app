package com.example.fireinspection.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fireinspection.dto.EquipmentCategoryResponse;
import com.example.fireinspection.dto.SiteRequest;
import com.example.fireinspection.dto.SiteResponse;
import com.example.fireinspection.entity.EquipmentCategory;
import com.example.fireinspection.entity.Site;
import com.example.fireinspection.entity.SiteEquipmentCategory;
import com.example.fireinspection.exception.ApiException;
import com.example.fireinspection.repository.EquipmentCategoryRepository;
import com.example.fireinspection.repository.SiteEquipmentCategoryRepository;
import com.example.fireinspection.repository.SiteRepository;

/**
 * 現場マスタ管理サービス（管理者向け）
 */
@Service
public class SiteService {

    private final SiteRepository siteRepository;
    private final SiteEquipmentCategoryRepository siteEquipmentCategoryRepository;
    private final EquipmentCategoryRepository equipmentCategoryRepository;

    public SiteService(
            SiteRepository siteRepository,
            SiteEquipmentCategoryRepository siteEquipmentCategoryRepository,
            EquipmentCategoryRepository equipmentCategoryRepository) {
        this.siteRepository = siteRepository;
        this.siteEquipmentCategoryRepository = siteEquipmentCategoryRepository;
        this.equipmentCategoryRepository = equipmentCategoryRepository;
    }

    /**
     * 現場一覧（keywordで名称・住所を部分一致検索可）
     */
    @Transactional(readOnly = true)
    public List<SiteResponse> list(String keyword) {
        List<Site> sites = (keyword == null || keyword.isBlank())
                ? siteRepository.findAllByOrderByIdAsc()
                : siteRepository.findByNameContainingOrAddressContainingOrderByIdAsc(keyword, keyword);
        return sites.stream()
        .map(site -> SiteResponse.from(site, getEquipmentCategories(site.getId())))
        .toList();
    }

    /**
     * 現場詳細
     */
    @Transactional(readOnly = true)
    public SiteResponse get(Long id) {
        Site site = findSite(id);
        return SiteResponse.from(site, getEquipmentCategories(id));
    }

    /**
     * 現場新規登録
     */
    @Transactional
    public SiteResponse create(SiteRequest request) {
        Site site = new Site();
        applyRequest(site, request);
        site.setIsActive(true);
        Site saved = siteRepository.save(site);
        saveEquipmentCategories(saved, request.equipmentCategoryIds());
        return SiteResponse.from(saved, getEquipmentCategories(saved.getId()));
    }

    /**
     * 現場更新
     */
    @Transactional
    public SiteResponse update(Long id, SiteRequest request) {
        Site site = findSite(id);
        applyRequest(site, request);
        Site saved = siteRepository.save(site);
        // 既存の紐付けを、一度、削除してから、作り直す
        List<SiteEquipmentCategory> existing = siteEquipmentCategoryRepository.findBySiteId(id);
        siteEquipmentCategoryRepository.deleteAll(existing);
        siteEquipmentCategoryRepository.flush();
        saveEquipmentCategories(saved, request.equipmentCategoryIds());
        return SiteResponse.from(saved, getEquipmentCategories(saved.getId()));
    }

    /**
     * 現場の論理削除（is_active=false）
     */
    @Transactional
    public void delete(Long id) {
        Site site = findSite(id);
        site.setIsActive(false);
        siteRepository.save(site);
    }

    /** リクエスト内容をエンティティに反映する */
    private void applyRequest(Site site, SiteRequest request) {
        site.setName(request.name());
        site.setAddress(request.address());
        site.setBuildingType(request.buildingType());
        site.setContactName(request.contactName());
        site.setContactPhone(request.contactPhone());
        site.setNote(request.note());
    }

    /** 設備カテゴリの紐付けを保存する */
    private void saveEquipmentCategories(Site site, List<Long> equipmentCategoryIds) {
        List<SiteEquipmentCategory> links = equipmentCategoryIds.stream()
                .map(categoryId -> {
                    EquipmentCategory category = equipmentCategoryRepository.findById(categoryId)
                            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "設備カテゴリが見つかりません"));
                    SiteEquipmentCategory link = new SiteEquipmentCategory();
                    link.setSite(site);
                    link.setEquipmentCategory(category);
                    return link;
                })
                .toList();
        siteEquipmentCategoryRepository.saveAll(links);
    }

    /** IDで現場を取得（存在しなければ404） */
    private Site findSite(Long id) {
        return siteRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "現場が見つかりません"));
    }

    /** 現場に紐づく設備カテゴリの一覧を取得する */
    private List<EquipmentCategoryResponse> getEquipmentCategories(Long siteId) {
        return siteEquipmentCategoryRepository.findBySiteId(siteId).stream()
                .map(link -> EquipmentCategoryResponse.from(link.getEquipmentCategory()))
                .toList();
    }
}
