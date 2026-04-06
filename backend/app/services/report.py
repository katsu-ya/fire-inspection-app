from datetime import datetime, timedelta, timezone, date
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.inventory import InventoryTransaction
from app.models.product import Product
from app.models.category import Category


def get_summary(db: Session) -> dict:
    """ダッシュボード用集計データを返す"""
    # 総商品数（アクティブのみ）
    total_products = db.query(func.count(Product.id)).filter(
        Product.is_active == True  # noqa: E712
    ).scalar() or 0

    # 総在庫数
    total_stock = db.query(func.sum(Product.current_stock)).filter(
        Product.is_active == True  # noqa: E712
    ).scalar() or 0

    # アラート件数（在庫 <= 閾値）
    alert_count = db.query(func.count(Product.id)).filter(
        Product.is_active == True,  # noqa: E712
        Product.current_stock <= Product.min_stock_alert,
    ).scalar() or 0

    # 直近7日の入出庫件数
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_transactions = db.query(func.count(InventoryTransaction.id)).filter(
        InventoryTransaction.created_at >= seven_days_ago
    ).scalar() or 0

    return {
        "total_products": total_products,
        "total_stock": total_stock,
        "alert_count": alert_count,
        "recent_transactions": recent_transactions,
    }


def get_trend(
    db: Session,
    product_id: int,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[dict]:
    """指定商品の在庫推移データを返す（日別累積）"""
    query = db.query(
        func.date(InventoryTransaction.created_at).label("date"),
        func.sum(
            func.IF(InventoryTransaction.type == "IN", InventoryTransaction.quantity, -InventoryTransaction.quantity)
        ).label("net_change"),
    ).filter(InventoryTransaction.product_id == product_id)

    if date_from:
        query = query.filter(InventoryTransaction.created_at >= date_from)
    if date_to:
        from datetime import time
        end_of_day = datetime.combine(date_to, time.max)
        query = query.filter(InventoryTransaction.created_at <= end_of_day)

    rows = query.group_by(func.date(InventoryTransaction.created_at)).order_by("date").all()

    return [{"date": str(row.date), "net_change": int(row.net_change)} for row in rows]


def get_category_stock(db: Session) -> list[dict]:
    """カテゴリ別在庫割合を返す"""
    rows = (
        db.query(
            Category.id,
            Category.name,
            func.sum(Product.current_stock).label("stock"),
        )
        .join(Product, Product.category_id == Category.id)
        .filter(Product.is_active == True)  # noqa: E712
        .group_by(Category.id, Category.name)
        .all()
    )

    return [
        {"category_id": row.id, "category_name": row.name, "stock": int(row.stock or 0)}
        for row in rows
    ]


def get_daily_movement(db: Session) -> list[dict]:
    """直近30日の日別入出庫集計を返す"""
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)

    rows = (
        db.query(
            func.date(InventoryTransaction.created_at).label("date"),
            InventoryTransaction.type,
            func.sum(InventoryTransaction.quantity).label("quantity"),
        )
        .filter(InventoryTransaction.created_at >= thirty_days_ago)
        .group_by(func.date(InventoryTransaction.created_at), InventoryTransaction.type)
        .order_by("date")
        .all()
    )

    # 日付ごとにIN/OUTをまとめる
    daily: dict[str, dict] = {}
    for row in rows:
        d = str(row.date)
        if d not in daily:
            daily[d] = {"date": d, "in_quantity": 0, "out_quantity": 0}
        if row.type == "IN":
            daily[d]["in_quantity"] = int(row.quantity)
        else:
            daily[d]["out_quantity"] = int(row.quantity)

    return list(daily.values())
