from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import AccessTokenResponse, LoginRequest, RefreshRequest, TokenResponse
from app.schemas.user import UserResponse
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["認証"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """メール・パスワードでログインしてトークンを取得する"""
    return auth_service.login(db, data.email, data.password)


@router.post("/refresh", response_model=AccessTokenResponse)
def refresh(data: RefreshRequest, db: Session = Depends(get_db)) -> AccessTokenResponse:
    """リフレッシュトークンから新しいアクセストークンを取得する"""
    return auth_service.refresh_access_token(db, data.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(current_user: User = Depends(get_current_user)) -> None:
    """ログアウト（クライアント側でトークンを破棄する）"""
    # JWTはステートレスのため、サーバー側では何もしない
    # 本番環境ではブラックリスト管理が必要
    pass


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """認証済みユーザーの情報を取得する"""
    return UserResponse.model_validate(current_user)
