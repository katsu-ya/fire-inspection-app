from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel

from app.schemas.category import CategoryResponse


class ProductCreate(BaseModel):
    """商品作成リクエスト"""
    name: str
    sku: str
    category_id: int | None = None
    unit_price: Decimal
    current_stock: int = 0
    min_stock_alert: int = 0


class ProductUpdate(BaseModel):
    """商品更新リクエスト（全フィールド任意）"""
    name: str | None = None
    sku: str | None = None
    category_id: int | None = None
    unit_price: Decimal | None = None
    min_stock_alert: int | None = None
    is_active: bool | None = None


class ProductResponse(BaseModel):
    """商品レスポンス"""
    id: int
    name: str
    sku: str
    category_id: int | None
    category: CategoryResponse | None
    unit_price: Decimal
    current_stock: int
    min_stock_alert: int
    is_active: bool
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    """商品一覧レスポンス（ページネーション付き）"""
    items: list[ProductResponse]
    total: int
    page: int
    size: int
    pages: int
