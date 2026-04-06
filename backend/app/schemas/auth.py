from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """ログインリクエスト"""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """トークンレスポンス"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    """リフレッシュトークンリクエスト"""
    refresh_token: str


class AccessTokenResponse(BaseModel):
    """アクセストークンのみのレスポンス"""
    access_token: str
    token_type: str = "bearer"
