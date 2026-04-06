from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """SQLAlchemyの全モデルが継承するベースクラス"""
    pass
