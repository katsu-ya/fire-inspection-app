package com.example.fireinspection.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.fireinspection.entity.Site;

/**
 * 現場マスタリポジトリ
 */
public interface SiteRepository extends JpaRepository<Site, Long> {

    /** ID順の全件取得 */
    List<Site> findAllByOrderByIdAsc();

    /** 名称・住所の部分一致検索（ID順） */
    List<Site> findByNameContainingOrAddressContainingOrderByIdAsc(String name, String address);
}
