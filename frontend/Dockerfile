FROM node:20-alpine

WORKDIR /app

# 依存パッケージをインストール（node_modulesはコンテナ内に閉じ込める）
COPY package.json package-lock.json* ./
RUN npm install

# アプリケーションコードをコピー
COPY . .

EXPOSE 3000

# ホットリロードを有効にして起動
CMD ["npm", "run", "dev"]
