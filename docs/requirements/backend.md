# バックエンド要件 — Phase 2: FastAPI + MySQL

## 前提

`docs/requirements/infra.md` のDocker環境が構築済みであること。

---

## ディレクトリ構成

```
backend/
├── Dockerfile
├── requirements.txt
└── app/
    ├── main.py              # FastAPIアプリ初期化・ルーター登録・CORS設定
    ├── core/
    │   ├── config.py        # 環境変数の読み込み（pydantic-settings）
    │   └── security.py      # JWTトークン生成・検証・パスワードハッシュ
    ├── db/
    │   ├── base.py          # SQLAlchemyのベースクラス
    │   ├── session.py       # DBセッション管理・依存性注入用関数
    │   └── init_db.py       # 初期データ投入（管理者ユーザー）
    ├── models/              # SQLAlchemyモデル（テーブル定義）
    │   ├── user.py
    │   ├── product.py
    │   ├── category.py
    │   └── inventory.py
    ├── schemas/             # Pydanticスキーマ（リクエスト/レスポンス型）
    │   ├── auth.py
    │   ├── user.py
    │   ├── product.py
    │   ├── category.py
    │   └── inventory.py
    ├── api/
    │   ├── deps.py          # 共通依存性（認証済みユーザー取得など）
    │   └── v1/
    │       ├── router.py    # v1ルーターの集約
    │       ├── auth.py
    │       ├── products.py
    │       ├── categories.py
    │       ├── inventory.py
    │       ├── alerts.py
    │       └── reports.py
    └── services/            # ビジネスロジック（APIルーターから分離）
        ├── auth.py
        ├── product.py
        ├── inventory.py
        ├── alert.py
        └── report.py
```

---

## DBスキーマ

### users テーブル

```sql
id            BIGINT PRIMARY KEY AUTO_INCREMENT
email         VARCHAR(255) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
name          VARCHAR(100) NOT NULL
is_active     BOOLEAN DEFAULT TRUE
created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at    DATETIME ON UPDATE CURRENT_TIMESTAMP
```

### categories テーブル

```sql
id         BIGINT PRIMARY KEY AUTO_INCREMENT
name       VARCHAR(100) UNIQUE NOT NULL
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

### products テーブル

```sql
id              BIGINT PRIMARY KEY AUTO_INCREMENT
name            VARCHAR(255) NOT NULL
sku             VARCHAR(100) UNIQUE NOT NULL
category_id     BIGINT REFERENCES categories(id)
unit_price      DECIMAL(10,2) NOT NULL
current_stock   INT DEFAULT 0
min_stock_alert INT DEFAULT 0     -- アラート閾値
is_active       BOOLEAN DEFAULT TRUE
created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at      DATETIME ON UPDATE CURRENT_TIMESTAMP
```

### inventory_transactions テーブル

```sql
id         BIGINT PRIMARY KEY AUTO_INCREMENT
product_id BIGINT REFERENCES products(id)
type       ENUM('IN', 'OUT') NOT NULL    -- 入庫 / 出庫
quantity   INT NOT NULL
note       TEXT
created_by BIGINT REFERENCES users(id)
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

---

## APIエンドポイント

すべてのエンドポイントのプレフィックスは `/api/v1/`。
認証系以外はすべてJWT認証必須（`Authorization: Bearer <token>` ヘッダー）。

### 認証 `/api/v1/auth`

| メソッド | パス       | 説明                                           |
|--------|-----------|----------------------------------------------|
| POST   | /login    | メール+パスワード → アクセストークン+リフレッシュトークン返却 |
| POST   | /refresh  | リフレッシュトークン → 新しいアクセストークン返却          |
| POST   | /logout   | リフレッシュトークンを無効化                          |
| GET    | /me       | 認証済みユーザー情報取得                            |

### 商品 `/api/v1/products`

| メソッド  | パス      | 説明                                                        |
|---------|----------|-----------------------------------------------------------|
| GET     | /        | 一覧取得（ページネーション・カテゴリフィルター・キーワード検索対応） |
| POST    | /        | 新規登録                                                    |
| GET     | /{id}    | 詳細取得                                                    |
| PUT     | /{id}    | 更新                                                        |
| DELETE  | /{id}    | 論理削除（is_active=False）                                  |

### 在庫入出庫 `/api/v1/inventory`

| メソッド | パス       | 説明                                               |
|--------|-----------|--------------------------------------------------|
| POST   | /in       | 入庫登録（products.current_stock を加算）             |
| POST   | /out      | 出庫登録（products.current_stock を減算、マイナスは拒否） |
| GET    | /history  | 入出庫履歴（商品ID・日付範囲・種別でフィルター可能）        |

### アラート `/api/v1/alerts`

| メソッド | パス | 説明                                          |
|--------|-----|---------------------------------------------|
| GET    | /   | current_stock <= min_stock_alert の商品一覧を返す |

### レポート `/api/v1/reports`

| メソッド | パス              | 説明                                                   |
|--------|-----------------|------------------------------------------------------|
| GET    | /summary        | ダッシュボード用集計（総商品数・総在庫数・アラート件数・直近7日の入出庫件数） |
| GET    | /trend          | 在庫推移データ（商品ID・日付範囲指定）                        |
| GET    | /category-stock | カテゴリ別在庫割合                                        |
| GET    | /daily-movement | 日別入出庫集計（直近30日）                                 |

---

## 実装方針

- パスワードはbcryptでハッシュ化する
- CORSはfrontendのオリジン（http://localhost:3000）のみ許可する
- `/docs`（Swagger UI）は環境変数 `ENV=development` のときのみ有効にする
- 在庫数は入出庫登録時にトランザクションを使って整合性を保つ

---

## requirements.txt（主要ライブラリ）

```
fastapi
uvicorn[standard]
sqlalchemy
pymysql
alembic
pydantic-settings
python-jose[cryptography]
passlib[bcrypt]
python-multipart
```

---

## 完了条件

- [ ] http://localhost:8000/docs でSwagger UIが開く
- [ ] Swagger UIからログインAPIを叩いてトークンが取得できる
- [ ] 認証トークンなしでの保護エンドポイントへのアクセスが401を返す
- [ ] 商品のCRUDがすべて動作する
- [ ] 入庫・出庫を行うと `products.current_stock` が正しく更新される
- [ ] 出庫時に在庫がマイナスになる場合はエラーを返す
- [ ] アラートAPIが閾値以下の商品のみを返す
- [ ] レポートAPIが正しい集計値を返す
