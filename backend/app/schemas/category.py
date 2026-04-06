from datetime import datetime
from pydantic import BaseModel


class CategoryCreate(BaseModel):
    """カテゴリ作成リクエスト"""
    name: str


class CategoryResponse(BaseModel):
    """カテゴリレスポンス"""
    id: int
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}
