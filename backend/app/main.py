from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# アプリケーションインスタンスを作成
app = FastAPI(
    title="在庫管理API",
    description="企業向け商品在庫管理システムのREST API",
    version="0.1.0",
)

# CORSミドルウェアの設定（フロントエンドからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, str]:
    """ヘルスチェック用エンドポイント"""
    return {"message": "在庫管理システムAPIが起動しました"}
