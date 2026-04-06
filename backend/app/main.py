from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.base import Base
from app.db.session import engine
from app.db.init_db import init_db
from app.db.session import SessionLocal

# モデルをインポートしてテーブルを認識させる
from app.models import user, category, product, inventory  # noqa: F401

# ENV=development の場合のみSwagger UIを有効にする
docs_url = "/docs" if settings.ENV == "development" else None
redoc_url = "/redoc" if settings.ENV == "development" else None

# アプリケーションインスタンスを作成
app = FastAPI(
    title="在庫管理API",
    description="企業向け商品在庫管理システムのREST API",
    version="1.0.0",
    docs_url=docs_url,
    redoc_url=redoc_url,
)

# CORSミドルウェアの設定（フロントエンドからのアクセスのみ許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# v1ルーターを登録
app.include_router(api_router)


@app.on_event("startup")
def startup_event() -> None:
    """アプリ起動時にテーブル作成と初期データ投入を行う"""
    # テーブルが存在しない場合のみ作成
    Base.metadata.create_all(bind=engine)
    # 初期データ投入
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()


@app.get("/")
def root() -> dict[str, str]:
    """ヘルスチェック用エンドポイント"""
    return {"message": "在庫管理システムAPIが起動しました"}
