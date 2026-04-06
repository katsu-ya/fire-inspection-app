from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    """ユーザー情報レスポンス"""
    id: int
    email: EmailStr
    name: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
