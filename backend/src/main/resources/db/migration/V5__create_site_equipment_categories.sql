-- V5__create_site_equipment_categories.sql

CREATE TABLE IF NOT EXISTS site_equipment_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    site_id BIGINT NOT NULL COMMENT '現場ID',
    equipment_category_id BIGINT NOT NULL COMMENT '設備カテゴリID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
    UNIQUE KEY uq_site_equipment_category (site_id, equipment_category_id),
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (equipment_category_id) REFERENCES equipment_categories(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT='現場×設備カテゴリ';