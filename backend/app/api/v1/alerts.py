from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.product import ProductResponse
from app.services import alert as alert_service

router = APIRouter(prefix="/alerts", tags=["アラート"])


@router.get("/", response_model=list[ProductResponse])
def get_alerts(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[ProductResponse]:
    """在庫数がアラート閾値以下の商品一覧を返す"""
    return alert_service.get_alert_products(db)
