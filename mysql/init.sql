-- 消防保守点検システム 初期スキーマ
-- 文字コードを明示的にutf8mb4に設定（init.sqlを latin1 で処理させないため）
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

USE fire_inspection_db;

-- 日本語文字化け防止: utf8mb4 に設定
ALTER DATABASE fire_inspection_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- ============================================================
-- シードデータ
-- ============================================================

-- ユーザー: password_hashはプレースホルダ。起動時にDataInitializerが
-- 「password123」のBCryptハッシュに置き換える
INSERT INTO users (email, password_hash, name, role) VALUES
    ('admin@example.com',  '{seed}', '管理者 太郎', 'ADMIN'),
    ('yamada@example.com', '{seed}', '山田 一郎',   'EMPLOYEE'),
    ('sato@example.com',   '{seed}', '佐藤 花子',   'EMPLOYEE'),
    ('suzuki@example.com', '{seed}', '鈴木 次郎',   'EMPLOYEE');

-- 現場マスタ
INSERT INTO sites (name, address, building_type, contact_name, contact_phone, note) VALUES
    ('グランドタワー新宿',       '東京都新宿区西新宿1-1-1',   '事務所',     '田中 守',   '03-1111-2222', '入館時は1F防災センターで受付'),
    ('サンライズマンション青葉', '東京都世田谷区青葉2-3-4',   '共同住宅',   '高橋 誠',   '03-3333-4444', '管理人室は9:00-17:00'),
    ('中央総合病院',             '東京都文京区本郷5-6-7',     '病院',       '伊藤 看子', '03-5555-6666', '点検前に防災担当へ内線連絡（内線201）'),
    ('みなと商業ビル',           '東京都港区芝浦8-9-10',      '複合用途',   '渡辺 商',   '03-7777-8888', '地下駐車場利用可'),
    ('さくら小学校',             '東京都杉並区桜上水11-12-13','学校',       '小林 学',   '03-9999-0000', '授業時間中はベル鳴動試験不可'),
    ('ホテルパシフィック横浜',   '神奈川県横浜市西区みなとみらい14-15', 'ホテル', '中村 泊', '045-1234-5678', '客室階の点検は11:00-15:00のみ');

-- 点検項目マスタ（全現場共通フォーマット）
INSERT INTO inspection_items (category, name, display_order) VALUES
    ('消火器具',             '設置場所に消火器が正しく設置されているか',       1),
    ('消火器具',             '消火器の外形に変形・腐食・損傷がないか',         2),
    ('消火器具',             '安全栓・封印が正常か',                           3),
    ('消火器具',             '圧力ゲージの指示値が正常範囲内か',               4),
    ('屋内消火栓設備',       '消火栓扉の開閉および表示灯が正常か',             5),
    ('屋内消火栓設備',       'ホース・ノズルに損傷・劣化がないか',             6),
    ('屋内消火栓設備',       '加圧送水装置（ポンプ）が正常に起動するか',       7),
    ('自動火災報知設備',     '受信機の表示・スイッチ類が正常か',               8),
    ('自動火災報知設備',     '感知器に破損・脱落・著しい汚損がないか',         9),
    ('自動火災報知設備',     '発信機・地区音響装置が正常に作動するか',         10),
    ('避難器具',             '避難器具の設置状態・標識が正常か',               11),
    ('避難器具',             '降下空間・避難空地が確保されているか',           12),
    ('誘導灯・誘導標識',     '誘導灯が正常に点灯しているか',                   13),
    ('誘導灯・誘導標識',     '非常電源への切替が正常に行われるか',             14),
    ('非常警報・放送設備',   '起動装置・スピーカーが正常に作動するか',         15),
    ('消防用水',             '防火水槽の水量が確保され周囲に障害物がないか',   16),
    ('防火設備',             '防火戸・防火シャッターの閉鎖に障害がないか',     17),
    ('防火管理',             '消防計画・防火管理体制に変更がないか',           18);

-- ルート割当のサンプル（本日と翌日。IDはシード投入順で確定: 山田=2, 佐藤=3, 鈴木=4）
INSERT INTO route_assignments (user_id, site_id, work_date, visit_order, note) VALUES
    -- 山田: 本日3現場
    (2, 1, CURDATE(), 1, '受付で点検立会者を呼び出すこと'),
    (2, 2, CURDATE(), 2, NULL),
    (2, 3, CURDATE(), 3, '院内は静音作業でお願いします'),
    -- 佐藤: 本日2現場
    (3, 4, CURDATE(), 1, NULL),
    (3, 5, CURDATE(), 2, '15時までに完了させること'),
    -- 鈴木: 本日1現場（大型現場に終日）
    (4, 6, CURDATE(), 1, '客室階は11時以降に着手'),
    -- 翌日: 鈴木は同じ現場に連続で入る（週間連続現場のサンプル）
    (4, 6, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 1, '客室階は11時以降に着手'),
    (2, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 1, NULL),
    (2, 5, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 2, NULL);
