from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.inventory import (
    InventoryHistoryResponse,
    InventoryInRequest,
    InventoryOutRequest,
    InventoryTransactionResponse,
)
from app.services import inventory as inventory_service

router = APIRouter(prefix="/inventory", tags=["在庫入出庫"])


@router.post("/in", response_model=InventoryTransactionResponse)
def stock_in(
    data: InventoryInRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InventoryTransactionResponse:
    """入庫を登録する"""
    return inventory_service.stock_in(db, data, current_user.id)


@router.post("/out", response_model=InventoryTransactionResponse)
def stock_out(
    data: InventoryOutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InventoryTransactionResponse:
    """出庫を登録する（在庫不足の場合はエラー）"""
    return inventory_service.stock_out(db, data, current_user.id)


@router.get("/history", response_model=InventoryHistoryResponse)
def get_history(
    page: int = 1,
    size: int = 20,
    product_id: int | None = None,
    type: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> InventoryHistoryResponse:
    """入出庫履歴を取得する"""
    return inventory_service.get_history(db, page, size, product_id, type, date_from, date_to)
