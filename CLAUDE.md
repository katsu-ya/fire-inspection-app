# CLAUDE.md — 企業向け商品在庫管理システム

## 作業ディレクトリ

このプロジェクトのカレントディレクトリ（`/`）以外のファイルは参照・編集しないこと。

---

## プロジェクト概要

企業向けの商品在庫管理システム。
フロントエンドとバックエンドを分離したAPIアーキテクチャで構築する。

## 技術スタック

| レイヤー       | 技術                                                |
|--------------|---------------------------------------------------|
| フロントエンド | Next.js (App Router) + TypeScript + Tailwind CSS  |
| バックエンド   | FastAPI (Python 3.12)                             |
| データベース   | MySQL 8.0                                         |
| 認証          | JWT（アクセストークン + リフレッシュトークン）          |
| インフラ       | Docker / Docker Compose                           |

## リポジトリ構成

```
/
├── CLAUDE.md
├── docker-compose.yml
├── .env
├── .env.example
├── docs/
│   └── requirements/
│       ├── infra.md        # インフラ（Docker）要件
│       ├── backend.md      # バックエンド要件
│       └── frontend.md     # フロントエンド要件
├── frontend/
│   ├── Dockerfile
│   └── src/
├── backend/
│   ├── Dockerfile
│   └── app/
└── mysql/
    └── init.sql
```

## 開発フェーズ

実装は以下の順序で進める。各フェーズの詳細要件は対応するファイルを参照すること。

| フェーズ  | 内容              | 要件ファイル                        |
|---------|-----------------|----------------------------------|
| Phase 1 | インフラ環境整備   | `docs/requirements/infra.md`    |
| Phase 2 | バックエンド構築   | `docs/requirements/backend.md`  |
| Phase 3 | フロントエンド構築 | `docs/requirements/frontend.md` |

---

## コーディング規約

### 共通

- コメントはすべて**日本語**で記述する
- 変数名・関数名・クラス名は英語（日本語コメントで補足する）
- シークレット情報（DBパスワード・JWT秘密鍵など）は環境変数で管理し、コードにハードコードしない
- `.env` は `.gitignore` に追加し、リポジトリにコミットしない。代わりに `.env.example` を管理する

### フロントエンド（Next.js + TypeScript）

- コンポーネントはすべてアロー関数で定義し `export default` する
- Props型は `type` で定義する（`interface` は使わない）
- `any` 型の使用禁止
- APIレスポンスの型は `src/types/index.ts` で一元管理する
- すべてのAPIコールは `src/lib/api.ts` のaxiosインスタンス経由で行う

### バックエンド（FastAPI + Python）

- 型ヒントを必ず付ける
- リクエスト・レスポンスは必ずPydanticスキーマで定義する
- ビジネスロジックはルーターに書かず `services/` に分離する
- エラーレスポンスは `{"detail": "エラーメッセージ"}` の統一フォーマット
- エラーメッセージは日本語で記述する

---

## 環境変数一覧

`.env.example` として管理する変数の一覧。

```env
# データベース
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=inventory_db
MYSQL_USER=app_user
MYSQL_PASSWORD=apppassword

# バックエンド
DATABASE_URL=mysql+pymysql://app_user:apppassword@db:3306/inventory_db
ENV=development

# JWT認証
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# フロントエンド
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```
