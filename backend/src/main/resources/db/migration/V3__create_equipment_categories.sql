-- V3__create_equipment_categories.sql

CREATE TABLE IF NOT EXISTS equipment_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL COMMENT '設備カテゴリ名',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT='設備カテゴリマスタ';

INSERT INTO equipment_categories (name) VALUES
    ('消火器具'),
    ('屋内消火栓設備'),
    ('自動火災報知設備'),
    ('避難器具'),
    ('誘導灯・誘導標識'),
    ('非常警報・放送設備'),
    ('消防用水'),
    ('防火設備'),
    ('防火管理');