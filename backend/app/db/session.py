from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings

# SQLAlchemyエンジンの作成（日本語文字化け防止のため charset=utf8mb4 を指定）
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # 接続の生存確認を行う
    connect_args={"charset": "utf8mb4"},
)

# セッションファクトリの作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPIの依存性注入用DBセッション取得関数"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
