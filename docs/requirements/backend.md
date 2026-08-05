# バックエンド要件 — Phase 2: Spring Boot + MySQL

## 前提

`docs/requirements/infra.md` のDocker環境が構築済みであること。

---

## 技術スタック

- Java 21 / Spring Boot 3.x（Maven）
- 主要依存: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`,
  `spring-boot-starter-security`, `spring-boot-starter-validation`,
  `spring-boot-starter-actuator`, `spring-boot-devtools`, `mysql-connector-j`,
  `jjwt (io.jsonwebtoken 0.12.x)`, `lombok`
- JSONは `spring.jackson.property-naming-strategy: SNAKE_CASE` で**snake_case**に統一
- 日時はJST（`Asia/Tokyo`）で扱う

## ディレクトリ構成

```
backend/
├── Dockerfile
├── pom.xml
└── src/main/
    ├── resources/application.yml
    └── java/com/example/fireinspection/
        ├── FireInspectionApplication.java
        ├── config/
        │   ├── SecurityConfig.java        # Spring Security設定・CORS
        │   ├── JacksonConfig.java         # snake_case等（application.ymlでも可）
        │   └── DataInitializer.java       # シードユーザーのパスワード初期化
        ├── security/
        │   ├── JwtService.java            # トークン生成・検証
        │   ├── JwtAuthenticationFilter.java
        │   └── AppUserDetailsService.java
        ├── entity/                        # JPAエンティティ
        ├── repository/                    # Spring Data JPAリポジトリ
        ├── dto/                           # record定義のリクエスト/レスポンス
        ├── service/                       # ビジネスロジック
        ├── controller/                    # ルーティングのみ（ロジック禁止）
        └── exception/
            ├── ApiException.java          # HTTPステータス+日本語メッセージ
            └── GlobalExceptionHandler.java # {"detail": "..."} 形式に統一
```

---

## DBスキーマ

DDLは `mysql/init.sql` で管理する（JPAの `ddl-auto` は `none`）。

### users（職員・管理者）

```sql
id            BIGINT PRIMARY KEY AUTO_INCREMENT
email         VARCHAR(255) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
name          VARCHAR(100) NOT NULL
role          ENUM('ADMIN','EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE'
is_active     BOOLEAN DEFAULT TRUE
created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at    DATETIME ON UPDATE CURRENT_TIMESTAMP
```

### refresh_tokens

```sql
id         BIGINT PRIMARY KEY AUTO_INCREMENT
user_id    BIGINT NOT NULL REFERENCES users(id)
token      VARCHAR(512) UNIQUE NOT NULL
expires_at DATETIME NOT NULL
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

### sites（現場マスタ）

```sql
id            BIGINT PRIMARY KEY AUTO_INCREMENT
name          VARCHAR(255) NOT NULL          -- 現場名（建物名）
address       VARCHAR(255)                   -- 住所
building_type VARCHAR(100)                   -- 建物用途（事務所・共同住宅など）
contact_name  VARCHAR(100)                   -- 現場担当者名
contact_phone VARCHAR(50)                    -- 連絡先電話番号
note          TEXT                           -- 備考（入館方法など）
is_active     BOOLEAN DEFAULT TRUE
created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at    DATETIME ON UPDATE CURRENT_TIMESTAMP
```

### inspection_items（点検項目マスタ = 全現場共通フォーマット）

```sql
id            BIGINT PRIMARY KEY AUTO_INCREMENT
category      VARCHAR(100) NOT NULL          -- 設備種別（消火器具・自動火災報知設備など）
name          VARCHAR(255) NOT NULL          -- 点検内容
display_order INT NOT NULL DEFAULT 0         -- 表示順
is_active     BOOLEAN DEFAULT TRUE
created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
```

### route_assignments（ルート = 職員×日付×現場×訪問順。当日の作業状態も持つ）

```sql
id          BIGINT PRIMARY KEY AUTO_INCREMENT
user_id     BIGINT NOT NULL REFERENCES users(id)
site_id     BIGINT NOT NULL REFERENCES sites(id)
work_date   DATE NOT NULL
visit_order INT NOT NULL                     -- 訪問順（1始まり）
status      ENUM('NOT_STARTED','IN_PROGRESS','COMPLETED') NOT NULL DEFAULT 'NOT_STARTED'
arrived_at  DATETIME NULL                    -- 到着報告日時
departed_at DATETIME NULL                    -- 離脱報告日時
note        VARCHAR(500)                     -- 管理者からの指示メモ
created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at  DATETIME ON UPDATE CURRENT_TIMESTAMP
UNIQUE(user_id, work_date, visit_order)
```

### inspection_reports（現場ごとの点検報告。route_assignmentと1:1）

```sql
id                  BIGINT PRIMARY KEY AUTO_INCREMENT
route_assignment_id BIGINT UNIQUE NOT NULL REFERENCES route_assignments(id)
remarks             TEXT                     -- 現場全体の所見
created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at          DATETIME ON UPDATE CURRENT_TIMESTAMP
```

### inspection_results（点検項目ごとの結果）

```sql
id                   BIGINT PRIMARY KEY AUTO_INCREMENT
inspection_report_id BIGINT NOT NULL REFERENCES inspection_reports(id)
inspection_item_id   BIGINT NOT NULL REFERENCES inspection_items(id)
result               ENUM('PASS','FAIL','NA') NOT NULL   -- 良 / 不良 / 対象外
note                 VARCHAR(500)                        -- 指摘事項など
UNIQUE(inspection_report_id, inspection_item_id)
```

### daily_reports（日報。職員×日付で1件）

```sql
id           BIGINT PRIMARY KEY AUTO_INCREMENT
user_id      BIGINT NOT NULL REFERENCES users(id)
work_date    DATE NOT NULL
special_note TEXT                            -- 特記事項
submitted_at DATETIME NOT NULL               -- 提出日時
UNIQUE(user_id, work_date)
```

---

## APIエンドポイント

すべてのエンドポイントのプレフィックスは `/api/v1/`。
認証系以外はすべてJWT認証必須（`Authorization: Bearer <token>` ヘッダー）。
`/api/v1/admin/**` は `ADMIN` ロールのみアクセス可能。
`/api/v1/me/**` は認証済みユーザー本人のデータのみ操作可能（他人のassignment操作は403）。

### 認証 `/api/v1/auth`

| メソッド | パス       | 説明 |
|--------|-----------|------|
| POST   | /login    | `{email, password}` → `{access_token, refresh_token, user}` |
| POST   | /refresh  | `{refresh_token}` → `{access_token}` |
| POST   | /logout   | `{refresh_token}` を無効化（204） |
| GET    | /me       | 認証済みユーザー情報取得 |

`user` の形: `{id, email, name, role, is_active}`（roleは `"ADMIN"` / `"EMPLOYEE"`）

### 職員マスタ `/api/v1/admin/users`（ADMIN）

| メソッド | パス   | 説明 |
|--------|-------|------|
| GET    | /     | 一覧（`role` / `is_active` フィルター任意） |
| POST   | /     | 新規登録 `{email, password, name, role}` |
| PUT    | /{id} | 更新（passwordは任意。指定時のみ変更） |
| DELETE | /{id} | 論理削除（is_active=false） |

### 現場マスタ `/api/v1/admin/sites`（ADMIN）

| メソッド | パス   | 説明 |
|--------|-------|------|
| GET    | /     | 一覧（`keyword` で名称・住所を部分一致検索可） |
| POST   | /     | 新規登録 |
| GET    | /{id} | 詳細 |
| PUT    | /{id} | 更新 |
| DELETE | /{id} | 論理削除 |

### 点検項目マスタ `/api/v1/admin/inspection-items`（ADMIN）

| メソッド | パス   | 説明 |
|--------|-------|------|
| GET    | /     | 一覧（category, display_order順） |
| POST   | /     | 新規登録 `{category, name, display_order}` |
| PUT    | /{id} | 更新 |
| DELETE | /{id} | 論理削除 |

### ルート設定 `/api/v1/admin/routes`（ADMIN）

| メソッド | パス    | 説明 |
|--------|--------|------|
| GET    | /      | `?user_id=&date_from=&date_to=` 指定範囲のassignment一覧（site・status込み） |
| PUT    | /      | `{user_id, work_date, sites: [{site_id, note?}, ...]}` でその日のルートを**丸ごと置き換え**（配列順=訪問順） |
| POST   | /bulk  | `{user_id, date_from, date_to, skip_weekends, sites: [...]}` で期間一括設定（同じ現場に1週間通うケース用） |

- 置き換え時、作業開始済み（status != NOT_STARTED）のassignmentが新リストに含まれない場合は
  400 `{"detail": "作業開始済みの現場は削除できません"}` を返す
- assignmentのレスポンス形:
  `{id, user_id, user_name, work_date, visit_order, status, arrived_at, departed_at, note, site: {id, name, address, building_type, contact_name, contact_phone, note}}`

### 日報閲覧 `/api/v1/admin/daily-reports`（ADMIN）

| メソッド | パス   | 説明 |
|--------|-------|------|
| GET    | /     | `?date=&user_id=` 日報一覧（従業員向けと同じ集計形+user情報） |

### 点検報告閲覧 `/api/v1/admin/reports`（ADMIN）

| メソッド | パス              | 説明 |
|--------|------------------|------|
| GET    | /{assignmentId}  | 該当現場の点検報告詳細（項目別結果・所見） |

### ダッシュボード `/api/v1/admin/dashboard`（ADMIN）

| メソッド | パス      | 説明 |
|--------|----------|------|
| GET    | /summary | `?date=`（省略時は当日）`{working_employees, planned_sites, completed_sites, in_progress_sites, submitted_daily_reports, fail_count}` |
| GET    | /status  | `?date=` 職員ごとの当日状況一覧 `[{user_id, user_name, total_sites, completed_sites, current_site_name, daily_report_submitted}]` |
| GET    | /weekly  | 直近7日の `[{date, planned, completed}]`（棒グラフ用） |
| GET    | /fail-categories | `?date_from=&date_to=` 不良（FAIL）件数の設備カテゴリ別集計 `[{category, count}]` |

### 従業員向け `/api/v1/me`

| メソッド | パス | 説明 |
|--------|-----|------|
| GET    | /routes | `?date=`（省略時は当日）自分のルート `{work_date, assignments: [...]}`（各assignmentに `has_report: boolean` を含む） |
| POST   | /assignments/{id}/arrive | 到着報告。`arrived_at=now, status=IN_PROGRESS`。報告済みなら400 |
| POST   | /assignments/{id}/depart | 離脱報告。`departed_at=now, status=COMPLETED`。到着前・点検報告未保存なら400 |
| GET    | /assignments/{id}/inspection | 点検フォーマット+入力済み結果 `{remarks, items: [{item_id, category, name, display_order, result, note}]}`（未入力はresult=null） |
| PUT    | /assignments/{id}/inspection | `{remarks, results: [{item_id, result, note?}]}` を保存（upsert。何度でも上書き可。到着報告前は400） |
| GET    | /daily-report | `?date=` 日報プレビュー `{work_date, submitted, special_note, submitted_at, visits: [{site_name, status, arrived_at, departed_at, duration_minutes}], total_minutes, all_completed}` |
| POST   | /daily-report | `{work_date, special_note}` で日報提出。提出済みなら400。作業時間はarrived/departedから自動計算するため送信しない |

---

## 実装方針

- パスワードはBCryptでハッシュ化する
- CORSはfrontendのオリジン（http://localhost:3000）のみ許可する
- 認可はSpring Securityで行う: `/api/v1/auth/login`・`/refresh` は許可、
  `/api/v1/admin/**` は `hasRole('ADMIN')`、その他は認証必須
- 到着・離脱・日報提出はサーバー時刻（JST）を採用する（クライアントから時刻を受け取らない）
- 日報の作業時間集計は `departed_at - arrived_at` を分単位で計算する
- 業務エラーは `ApiException`（HTTPステータス+日本語メッセージ）を投げ、
  `GlobalExceptionHandler` で `{"detail": "..."}` に変換する。
  バリデーションエラー（400）・認証エラー（401）・認可エラー（403）も同フォーマットに統一する

## シードデータの初期化

- `mysql/init.sql` はシードユーザーを `password_hash='{seed}'` のプレースホルダで投入する
- 起動時に `DataInitializer`（CommandLineRunner）が `{seed}` のユーザーを検出し、
  BCryptで `password123` をエンコードして書き戻す（毎回起動時にチェック、冪等）

---

## 完了条件

- [ ] `POST /api/v1/auth/login` でトークンが取得できる（admin@example.com / password123）
- [ ] 認証トークンなしでの保護エンドポイントへのアクセスが401を返す
- [ ] EMPLOYEEロールで `/api/v1/admin/**` にアクセスすると403を返す
- [ ] 管理者がルートを設定すると従業員の `/me/routes` に反映される
- [ ] 到着報告 → 点検保存 → 離脱報告 の順序制約が守られる（順序違反は400）
- [ ] 日報の作業時間が到着/離脱時刻から正しく計算される
- [ ] ダッシュボードAPIが正しい集計値を返す
