from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductResponse


def get_alert_products(db: Session) -> list[ProductResponse]:
    """在庫数がアラート閾値以下の商品一覧を返す"""
    products = (
        db.query(Product)
        .filter(
            Product.is_active == True,  # noqa: E712
            Product.current_stock <= Product.min_stock_alert,
        )
        .all()
    )
    return [ProductResponse.model_validate(p) for p in products]
