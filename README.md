# 企業向け商品在庫管理システム

商品・在庫・入出庫を管理する企業向けの在庫管理システムです。
フロントエンドとバックエンドを分離した API アーキテクチャで構築されています。

## 技術スタック

| レイヤー       | 技術                                               |
|--------------|---------------------------------------------------|
| フロントエンド | Next.js (App Router) + TypeScript + Tailwind CSS  |
| バックエンド   | FastAPI (Python 3.12)                             |
| データベース   | MySQL 8.0                                         |
| 認証          | JWT（アクセストークン + リフレッシュトークン）          |
| インフラ       | Docker / Docker Compose                           |

## 必要なもの

- Docker Desktop（Docker Compose v2 含む）

ローカルに Node.js / Python / MySQL をインストールする必要はありません。すべてコンテナ内で動作します。

## 環境構築手順

### 1. リポジトリのクローン

```bash
git clone <このリポジトリのURL>
cd claude-react
```

### 2. 環境変数ファイルの作成

`.env.example` をコピーして `.env` を作成します。

```bash
cp .env.example .env
```

ローカル開発はデフォルト値のままで動作します。本番運用時は `MYSQL_PASSWORD` や `JWT_SECRET_KEY` を必ず変更してください。

### 3. コンテナのビルドと起動

```bash
docker compose up --build
```

初回はイメージのビルドと MySQL の初期化（`mysql/init.sql` によるテーブル作成・シードデータ投入）が走るため、数分かかります。
MySQL のヘルスチェックが通ってからバックエンドが起動する構成のため、起動順は自動で制御されます。

### 4. 動作確認

起動後、以下の URL にアクセスできます。

| サービス               | URL                          |
|----------------------|------------------------------|
| フロントエンド          | http://localhost:3000        |
| バックエンド API        | http://localhost:8000        |
| API ドキュメント (Swagger) | http://localhost:8000/docs |
| MySQL                | localhost:3306               |

※ Swagger UI は `ENV=development` のときのみ有効です。

### 5. ログイン

バックエンド起動時に管理者ユーザーが自動作成されます。

| 項目        | 値                  |
|------------|---------------------|
| メールアドレス | admin@example.com   |
| パスワード    | admin1234           |

## 開発時の操作

ソースコードはボリュームマウントされているため、`frontend/src` および `backend/app` の変更はコンテナを再起動せずに反映されます（ホットリロード対応）。

```bash
# バックグラウンドで起動
docker compose up -d

# ログを確認（サービス名: db / backend / frontend）
docker compose logs -f backend

# 停止
docker compose down

# DB データも含めて完全に削除（init.sql を再実行したい場合）
docker compose down -v

# MySQL に直接接続
docker compose exec db mysql -u app_user -papppassword inventory_db
```

## ディレクトリ構成

```
/
├── CLAUDE.md               # 開発ルール・コーディング規約
├── docker-compose.yml
├── .env.example            # 環境変数のテンプレート
├── docs/
│   └── requirements/       # 各フェーズの要件定義
├── frontend/               # Next.js フロントエンド
│   ├── Dockerfile
│   └── src/
├── backend/                # FastAPI バックエンド
│   ├── Dockerfile
│   └── app/
└── mysql/
    └── init.sql            # 初期スキーマ・シードデータ
```

## トラブルシューティング

- **ポートが既に使用されている**: 3000 / 8000 / 3306 番ポートを使用する他のプロセス（ローカルの MySQL など）を停止してください。
- **`mysql/init.sql` を変更したのに反映されない**: 初期化スクリプトは初回起動時のみ実行されます。`docker compose down -v` でボリュームを削除してから再起動してください。
- **日本語が文字化けする**: DB は utf8mb4 で構成済みです。`docker compose down -v` で DB を作り直すと解消する場合があります。
