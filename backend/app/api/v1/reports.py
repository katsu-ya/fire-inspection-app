from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services import report as report_service

router = APIRouter(prefix="/reports", tags=["レポート"])


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    """ダッシュボード用集計データを返す"""
    return report_service.get_summary(db)


@router.get("/trend")
def get_trend(
    product_id: int,
    date_from: date | None = None,
    date_to: date | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[dict]:
    """指定商品の在庫推移データを返す"""
    return report_service.get_trend(db, product_id, date_from, date_to)


@router.get("/category-stock")
def get_category_stock(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[dict]:
    """カテゴリ別在庫割合を返す"""
    return report_service.get_category_stock(db)


@router.get("/daily-movement")
def get_daily_movement(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[dict]:
    """直近30日の日別入出庫集計を返す"""
    return report_service.get_daily_movement(db)
