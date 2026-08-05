# 消防保守点検システム

消防設備の保守点検業務を管理するシステムです。
管理者が職員ごとの巡回ルート（現場の訪問順）とマスタを管理し、
従業員は現場ごとに「到着報告 → 点検記入 → 離脱報告」を行い、最後に日報を提出します。
フロントエンドとバックエンドを分離した API アーキテクチャで構築されています。

## 技術スタック

| レイヤー       | 技術                                               |
|--------------|---------------------------------------------------|
| フロントエンド | Next.js (App Router) + TypeScript + Tailwind CSS  |
| バックエンド   | Spring Boot 3 (Java 21) + Spring Security + JPA   |
| データベース   | MySQL 8.0                                         |
| 認証          | JWT（アクセストークン + リフレッシュトークン）          |
| インフラ       | Docker / Docker Compose                           |

## 必要なもの

- Docker Desktop（Docker Compose v2 含む）

ローカルに Node.js / Java / MySQL をインストールする必要はありません。すべてコンテナ内で動作します。

## 環境構築手順

### 1. リポジトリのクローン

```bash
git clone <このリポジトリのURL>
cd claude-shinjyo
```

### 2. セットアップスクリプトの実行

`.env` / `.env.example` の生成と、旧テンプレート由来ファイルの掃除を行います。

```bash
bash setup.sh
```

ローカル開発はデフォルト値のままで動作します。本番運用時は `MYSQL_PASSWORD` や `JWT_SECRET_KEY` を必ず変更してください。

### 3. コンテナのビルドと起動

```bash
# 旧テンプレートのDBボリュームが残っている場合は先に削除
docker compose down -v

docker compose up --build
```

初回はイメージのビルド（Maven の依存解決を含む）と MySQL の初期化（`mysql/init.sql` によるテーブル作成・シードデータ投入）が走るため、数分かかります。
MySQL のヘルスチェックが通ってからバックエンドが起動する構成のため、起動順は自動で制御されます。

### 4. 動作確認

起動後、以下の URL にアクセスできます。

| サービス               | URL                                    |
|----------------------|----------------------------------------|
| フロントエンド          | http://localhost:3000                  |
| バックエンド API        | http://localhost:8080                  |
| ヘルスチェック          | http://localhost:8080/actuator/health  |
| MySQL                | localhost:3306                         |

### 5. ログイン

初期データとして以下のユーザーが作成されます（パスワードはすべて `password123`）。

| ロール  | メールアドレス        | 氏名        |
|--------|---------------------|------------|
| 管理者  | admin@example.com   | 管理者 太郎 |
| 従業員  | yamada@example.com  | 山田 一郎   |
| 従業員  | sato@example.com    | 佐藤 花子   |
| 従業員  | suzuki@example.com  | 鈴木 次郎   |

管理者はルート設定・各種マスタ管理・日報/点検報告の閲覧ができます。
従業員は自分のルート確認と、現場での到着報告・点検記入・離脱報告・日報提出ができます。
シードデータとして当日分のルートが職員3名に設定済みです。

## 開発時の操作

フロントエンドは `frontend/src` がボリュームマウントされており、変更は即時反映されます（ホットリロード対応）。
バックエンドは `backend/src` がマウントされていますが、Java のため変更後は再起動が必要です。

```bash
# バックグラウンドで起動
docker compose up -d

# バックエンドのソース変更を反映
docker compose restart backend

# ログを確認（サービス名: db / backend / frontend）
docker compose logs -f backend

# 停止
docker compose down

# DB データも含めて完全に削除（init.sql を再実行したい場合）
docker compose down -v

# MySQL に直接接続
docker compose exec db mysql -u app_user -papppassword fire_inspection_db
```

## ディレクトリ構成

```
/
├── CLAUDE.md               # 開発ルール・コーディング規約
├── docker-compose.yml
├── setup.sh                # .env生成・旧テンプレート残骸の削除
├── .env.example            # 環境変数のテンプレート
├── docs/
│   └── requirements/       # 各フェーズの要件定義
├── frontend/               # Next.js フロントエンド
│   ├── Dockerfile
│   └── src/
├── backend/                # Spring Boot バックエンド
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/
└── mysql/
    └── init.sql            # 初期スキーマ・シードデータ
```

## トラブルシューティング

- **ポートが既に使用されている**: 3000 / 8080 / 3306 番ポートを使用する他のプロセス（ローカルの MySQL など）を停止してください。
- **`mysql/init.sql` を変更したのに反映されない**: 初期化スクリプトは初回起動時のみ実行されます。`docker compose down -v` でボリュームを削除してから再起動してください。
- **バックエンドが `Unknown database 'fire_inspection_db'` で落ちる**: 旧テンプレートの DB ボリュームが残っています。`docker compose down -v` してから起動し直してください。
- **日本語が文字化けする**: DB は utf8mb4 で構成済みです。`docker compose down -v` で DB を作り直すと解消する場合があります。
