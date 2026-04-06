from datetime import datetime
from pydantic import BaseModel, field_validator

from app.schemas.user import UserResponse


class InventoryInRequest(BaseModel):
    """入庫リクエスト"""
    product_id: int
    quantity: int
    note: str | None = None

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("数量は1以上を指定してください")
        return v


class InventoryOutRequest(BaseModel):
    """出庫リクエスト"""
    product_id: int
    quantity: int
    note: str | None = None

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("数量は1以上を指定してください")
        return v


class InventoryTransactionResponse(BaseModel):
    """在庫トランザクションレスポンス"""
    id: int
    product_id: int
    type: str
    quantity: int
    note: str | None
    created_by: int
    created_at: datetime
    user: UserResponse | None = None

    model_config = {"from_attributes": True}


class InventoryHistoryResponse(BaseModel):
    """在庫履歴一覧レスポンス"""
    items: list[InventoryTransactionResponse]
    total: int
    page: int
    size: int
    pages: int
