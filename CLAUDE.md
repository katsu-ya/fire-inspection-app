# CLAUDE.md — 消防保守点検システム

## 作業ディレクトリ

このプロジェクトのカレントディレクトリ（`/`）以外のファイルは参照・編集しないこと。

---

## プロジェクト概要

消防設備の保守点検業務を管理するシステム。
フロントエンドとバックエンドを分離したAPIアーキテクチャで構築する。

- 管理者は職員ごとの1日の巡回ルート（現場の訪問順）と各種マスタを管理する
- 従業員は自分のルートを確認し、現場ごとに「到着報告 → 点検記入 → 離脱報告」を繰り返す
- 1日の最後に日報（各現場の作業時間は到着/離脱報告から自動計算 + 特記事項）を提出して業務終了

## 技術スタック

| レイヤー       | 技術                                                |
|--------------|---------------------------------------------------|
| フロントエンド | Next.js (App Router) + TypeScript + Tailwind CSS  |
| バックエンド   | Spring Boot 3 (Java 21) + Spring Security + JPA   |
| データベース   | MySQL 8.0                                         |
| 認証          | JWT（アクセストークン + リフレッシュトークン）          |
| インフラ       | Docker / Docker Compose                           |

## リポジトリ構成

```
/
├── CLAUDE.md
├── README.md
├── docker-compose.yml
├── setup.sh                # .env生成・旧テンプレート残骸の削除
├── .env                    # 環境変数（コミット禁止）
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
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/example/fireinspection/
│       └── resources/application.yml
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
- APIのJSONプロパティ名は**snake_case**で統一する（バックエンドはJacksonのSNAKE_CASE設定を使用）

### フロントエンド（Next.js + TypeScript）

- コンポーネントはすべてアロー関数で定義し `export default` する
- Props型は `type` で定義する（`interface` は使わない）
- `any` 型の使用禁止
- APIレスポンスの型は `src/types/index.ts` で一元管理する
- すべてのAPIコールは `src/lib/api.ts` のaxiosインスタンス経由で行う

### バックエンド（Spring Boot + Java）

- レイヤー構成は `controller / service / repository / entity / dto / config / security / exception` に分離する
- ビジネスロジックはコントローラに書かず `service/` に分離する
- リクエスト・レスポンスのDTOは Java の `record` で定義し、`jakarta.validation` でバリデーションする
- エンティティのボイラープレート削減に Lombok を使用してよい
- エラーレスポンスは `{"detail": "エラーメッセージ"}` の統一フォーマット
- エラーメッセージは日本語で記述する
- N+1を避けるため一覧系クエリは `JOIN FETCH` または `@EntityGraph` を検討する

---

## 環境変数一覧

`.env.example` として管理する変数の一覧。

```env
# データベース
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=fire_inspection_db
MYSQL_USER=app_user
MYSQL_PASSWORD=apppassword

# バックエンド
ENV=development

# JWT認証（HS256のため秘密鍵は32文字以上必須）
JWT_SECRET_KEY=change-this-to-a-random-secret-key-at-least-32-chars
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# フロントエンド
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```
