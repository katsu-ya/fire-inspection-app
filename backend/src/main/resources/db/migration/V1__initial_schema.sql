-- ユーザー（職員・管理者）テーブル
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'メールアドレス',
    password_hash VARCHAR(255) NOT NULL COMMENT 'ハッシュ化パスワード',
    name VARCHAR(100) NOT NULL COMMENT '氏名',
    role ENUM('ADMIN', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE' COMMENT 'ロール',
    is_active BOOLEAN DEFAULT TRUE COMMENT '有効フラグ',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT='ユーザー';

-- リフレッシュトークンテーブル
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT 'ユーザーID',
    token VARCHAR(512) UNIQUE NOT NULL COMMENT 'リフレッシュトークン',
    expires_at DATETIME NOT NULL COMMENT '有効期限',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT='リフレッシュトークン';

-- 現場マスタテーブル
CREATE TABLE IF NOT EXISTS sites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL COMMENT '現場名（建物名）',
    address VARCHAR(255) COMMENT '住所',
    building_type VARCHAR(100) COMMENT '建物用途',
    contact_name VARCHAR(100) COMMENT '現場担当者名',
    contact_phone VARCHAR(50) COMMENT '連絡先電話番号',
    note TEXT COMMENT '備考（入館方法など）',
    is_active BOOLEAN DEFAULT TRUE COMMENT '有効フラグ',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT='現場マスタ';

-- 点検項目マスタテーブル（全現場共通の点検フォーマット）
CREATE TABLE IF NOT EXISTS inspection_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(100) NOT NULL COMMENT '設備種別',
    name VARCHAR(255) NOT NULL COMMENT '点検内容',
    display_order INT NOT NULL DEFAULT 0 COMMENT '表示順',
    is_active BOOLEAN DEFAULT TRUE COMMENT '有効フラグ',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT='点検項目マスタ';

-- ルート割当テーブル（職員×日付×現場×訪問順。当日の作業状態も保持する）
CREATE TABLE IF NOT EXISTS route_assignments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '担当職員ID',
    site_id BIGINT NOT NULL COMMENT '現場ID',
    work_date DATE NOT NULL COMMENT '作業日',
    visit_order INT NOT NULL COMMENT '訪問順（1始まり）',
    status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'NOT_STARTED' COMMENT '作業状態',
    arrived_at DATETIME NULL COMMENT '到着報告日時',
    departed_at DATETIME NULL COMMENT '離脱報告日時',
    note VARCHAR(500) COMMENT '管理者からの指示メモ',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
    UNIQUE KEY uq_route (user_id, work_date, visit_order),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (site_id) REFERENCES sites(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT='ルート割当';

-- 点検報告テーブル（ルート割当と1:1）
CREATE TABLE IF NOT EXISTS inspection_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    route_assignment_id BIGINT UNIQUE NOT NULL COMMENT 'ルート割当ID',
    remarks TEXT COMMENT '現場全体の所見',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
    FOREIGN KEY (route_assignment_id) REFERENCES route_assignments(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT='点検報告';

-- 点検結果テーブル（点検項目ごとの結果）
CREATE TABLE IF NOT EXISTS inspection_results (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    inspection_report_id BIGINT NOT NULL COMMENT '点検報告ID',
    inspection_item_id BIGINT NOT NULL COMMENT '点検項目ID',
    result ENUM('PASS', 'FAIL', 'NA') NOT NULL COMMENT '結果（良/不良/対象外）',
    note VARCHAR(500) COMMENT '指摘事項',
    UNIQUE KEY uq_result (inspection_report_id, inspection_item_id),
    FOREIGN KEY (inspection_report_id) REFERENCES inspection_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (inspection_item_id) REFERENCES inspection_items(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT='点検結果';

-- 日報テーブル（職員×日付で1件）
CREATE TABLE IF NOT EXISTS daily_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '職員ID',
    work_date DATE NOT NULL COMMENT '作業日',
    special_note TEXT COMMENT '特記事項',
    submitted_at DATETIME NOT NULL COMMENT '提出日時',
    UNIQUE KEY uq_daily_report (user_id, work_date),
    FOREIGN KEY (user_id) REFERENCES users(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT='日報';