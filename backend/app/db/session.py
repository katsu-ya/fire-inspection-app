from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings

# SQLAlchemyエンジンの作成
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # 接続の生存確認を行う
    connect_args={"charset": "utf8mb4"},
)


@event.listens_for(engine, "connect")
def set_charset(dbapi_connection: object, connection_record: object) -> None:
    """接続ごとに文字コードをutf8mb4に強制する（connect_argsだけでは不十分な場合の保険）"""
    cursor = dbapi_connection.cursor()  # type: ignore[attr-defined]
    cursor.execute("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci")
    cursor.close()

# セッションファクトリの作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPIの依存性注入用DBセッション取得関数"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
