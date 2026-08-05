#!/usr/bin/env bash
# =============================================================
# 消防保守点検システム セットアップスクリプト
# - .env / .env.example を新プロジェクト用に生成
# - 旧テンプレート（在庫管理システム）の残骸を削除
# =============================================================
set -eu

cd "$(dirname "$0")"

echo "== 消防保守点検システム セットアップ =="

# ---- 1. 環境変数ファイルの生成 ----
ENV_CONTENT='# データベース
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
'

printf '%s' "$ENV_CONTENT" > .env.example

if [ -f .env ]; then
  cp .env .env.bak
  echo "既存の .env を .env.bak にバックアップしました"
fi
printf '%s' "$ENV_CONTENT" > .env
echo ".env / .env.example を生成しました"

# ---- 2. 旧FastAPIバックエンドの削除 ----
rm -rf backend/app backend/requirements.txt
echo "旧FastAPIバックエンド（backend/app）を削除しました"

# ---- 3. 旧フロントエンド画面の削除 ----
rm -rf \
  "frontend/src/app/(app)" \
  frontend/src/features/dashboard \
  frontend/src/features/products \
  frontend/src/features/inventory \
  frontend/src/features/reports \
  frontend/src/hooks/useAlert.ts \
  frontend/src/components/ui/AlertBanner.tsx
echo "旧フロントエンド画面（在庫管理）を削除しました"

# ---- 4. 完了メッセージ ----
echo ""
echo "セットアップ完了。次のコマンドで起動できます:"
echo "  docker compose down -v   # 旧DBボリュームを削除（初回のみ必須）"
echo "  docker compose up --build"
