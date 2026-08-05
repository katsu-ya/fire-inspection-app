# インフラ要件 — Phase 1: Docker環境整備

## 目標

`docker compose up -d` 一発で全サービスが起動し、
`docker compose down` で完全に停止・削除できる開発環境を構築する。
ホストマシンにはDockerとDocker Compose以外インストール不要な状態にすること。

---

## 構成するサービス

| サービス名 | 役割                     | ポート |
|-----------|------------------------|--------|
| frontend  | Next.js開発サーバー       | 3000   |
| backend   | Spring Boot (Java 21)   | 8080   |
| db        | MySQL 8.0               | 3306   |

---

## 作成するファイル

```
/
├── docker-compose.yml
├── .env                    # 環境変数（.gitignoreに追加）
├── .env.example            # 環境変数のテンプレート
├── frontend/
│   ├── Dockerfile          # 開発用（ホットリロード有効）
│   └── .dockerignore
├── backend/
│   ├── Dockerfile          # 開発用（spring-boot:run + devtools）
│   └── .dockerignore
└── mysql/
    └── init.sql            # 初期スキーマ・シードデータ
```

---

## 各サービスの要件

### frontend (Next.js)

- ベースイメージ: `node:20-alpine`
- `src/` ディレクトリをボリュームマウントしてホットリロードを有効にする
- `node_modules` はコンテナ内に閉じ込め、ホストにマウントしない
- 起動コマンド: `npm run dev`

### backend (Spring Boot)

- ベースイメージ: `maven:3.9-eclipse-temurin-21`（開発用。Mavenでそのまま起動する）
- 起動コマンド: `mvn spring-boot:run`
- `src/` をボリュームマウントし、`spring-boot-devtools` によるホットリロードを有効にする
- Mavenのローカルリポジトリ（`/root/.m2`）は名前付きボリュームでキャッシュし、再起動時の依存解決を高速化する
- DB接続情報は環境変数（`MYSQL_DATABASE` / `MYSQL_USER` / `MYSQL_PASSWORD`）から組み立てる

### db (MySQL 8.0)

- `mysql/init.sql` を `/docker-entrypoint-initdb.d/` にマウントして初期スキーマを自動実行
- 文字コードは `utf8mb4` を強制（日本語文字化け防止）
- データは名前付きボリュームで永続化する
- `healthcheck` を設定してDBが完全起動するまで他サービスを待機させる

---

## docker-compose.yml の設計方針

- `depends_on` + `healthcheck` でサービスの起動順序を制御する（db → backend → frontend の順）
- すべての環境変数は `.env` から `env_file` で読み込む
- サービス間通信用の専用ブリッジネットワークを作成する

---

## 完了条件

- [ ] `docker compose up -d` でエラーなく全サービスが起動する
- [ ] http://localhost:3000 にアクセスしてNext.jsの画面が表示される
- [ ] http://localhost:8080/actuator/health が `{"status":"UP"}` を返す
- [ ] `docker compose down` でコンテナ・ネットワークがすべて削除される
- [ ] `docker compose down -v` でボリュームも含めて完全削除できる
