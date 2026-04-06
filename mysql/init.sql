-- 在庫管理システム 初期スキーマ
-- データベースの選択
USE inventory_db;

-- 商品カテゴリテーブル
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'カテゴリ名',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時'
) COMMENT='商品カテゴリ';

-- 商品テーブル
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL COMMENT '商品名',
    code VARCHAR(50) UNIQUE NOT NULL COMMENT '商品コード',
    category_id INT COMMENT 'カテゴリID',
    price DECIMAL(10, 2) NOT NULL DEFAULT 0 COMMENT '価格',
    stock_quantity INT NOT NULL DEFAULT 0 COMMENT '在庫数',
    description TEXT COMMENT '商品説明',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) COMMENT='商品';

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT 'ユーザー名',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'メールアドレス',
    hashed_password VARCHAR(255) NOT NULL COMMENT 'ハッシュ化パスワード',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '有効フラグ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時'
) COMMENT='ユーザー';

-- シードデータ: カテゴリ
INSERT INTO categories (name) VALUES
    ('電子機器'),
    ('食品'),
    ('衣類'),
    ('文具');

-- シードデータ: 商品
INSERT INTO products (name, code, category_id, price, stock_quantity, description) VALUES
    ('ノートパソコン', 'ELEC-001', 1, 89800.00, 10, '高性能ノートパソコン'),
    ('スマートフォン', 'ELEC-002', 1, 59800.00, 25, '最新スマートフォン'),
    ('ボールペン（10本セット）', 'STAT-001', 4, 500.00, 200, '書きやすいボールペンセット');
