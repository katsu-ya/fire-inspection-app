-- 在庫管理システム 初期スキーマ
USE inventory_db;

-- 日本語文字化け防止: utf8mb4 に設定
ALTER DATABASE inventory_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'メールアドレス',
    password_hash VARCHAR(255) NOT NULL COMMENT 'ハッシュ化パスワード',
    name VARCHAR(100) NOT NULL COMMENT 'ユーザー名',
    is_active BOOLEAN DEFAULT TRUE COMMENT '有効フラグ',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT='ユーザー';

-- カテゴリテーブル
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL COMMENT 'カテゴリ名',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT='商品カテゴリ';

-- 商品テーブル
CREATE TABLE IF NOT EXISTS products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL COMMENT '商品名',
    sku VARCHAR(100) UNIQUE NOT NULL COMMENT 'SKUコード',
    category_id BIGINT COMMENT 'カテゴリID',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '単価',
    current_stock INT DEFAULT 0 COMMENT '現在庫数',
    min_stock_alert INT DEFAULT 0 COMMENT 'アラート閾値',
    is_active BOOLEAN DEFAULT TRUE COMMENT '有効フラグ',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT='商品';

-- 在庫入出庫トランザクションテーブル
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL COMMENT '商品ID',
    type ENUM('IN', 'OUT') NOT NULL COMMENT '入庫/出庫',
    quantity INT NOT NULL COMMENT '数量',
    note TEXT COMMENT '備考',
    created_by BIGINT NOT NULL COMMENT '登録者ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT='在庫入出庫トランザクション';

-- シードデータ: カテゴリ
INSERT INTO categories (name) VALUES
    ('電子機器'),
    ('食品'),
    ('衣類'),
    ('文具');
