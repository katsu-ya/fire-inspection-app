package com.example.fireinspection.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.fireinspection.dto.SiteRequest;
import com.example.fireinspection.dto.SiteResponse;
import com.example.fireinspection.entity.Site;
import com.example.fireinspection.exception.ApiException;
import com.example.fireinspection.repository.SiteRepository;

/**
 * 現場マスタ管理サービス（管理者向け）
 */
@Service
public class SiteService {

    private final SiteRepository siteRepository;

    public SiteService(SiteRepository siteRepository) {
        this.siteRepository = siteRepository;
    }

    /**
     * 現場一覧（keywordで名称・住所を部分一致検索可）
     */
    @Transactional(readOnly = true)
    public List<SiteResponse> list(String keyword) {
        List<Site> sites = (keyword == null || keyword.isBlank())
                ? siteRepository.findAllByOrderByIdAsc()
                : siteRepository.findByNameContainingOrAddressContainingOrderByIdAsc(keyword, keyword);
        return sites.stream().map(SiteResponse::from).toList();
    }

    /**
     * 現場詳細
     */
    @Transactional(readOnly = true)
    public SiteResponse get(Long id) {
        return SiteResponse.from(findSite(id));
    }

    /**
     * 現場新規登録
     */
    @Transactional
    public SiteResponse create(SiteRequest request) {
        Site site = new Site();
        applyRequest(site, request);
        site.setIsActive(true);
        return SiteResponse.from(siteRepository.save(site));
    }

    /**
     * 現場更新
     */
    @Transactional
    public SiteResponse update(Long id, SiteRequest request) {
        Site site = findSite(id);
        applyRequest(site, request);
        return SiteResponse.from(siteRepository.save(site));
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

    /** IDで現場を取得（存在しなければ404） */
    private Site findSite(Long id) {
        return siteRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "現場が見つかりません"));
    }
}
