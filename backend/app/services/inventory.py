import math
from datetime import date
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.inventory import InventoryTransaction
from app.models.product import Product
from app.schemas.inventory import (
    InventoryHistoryResponse,
    InventoryInRequest,
    InventoryOutRequest,
    InventoryTransactionResponse,
)


def stock_in(db: Session, data: InventoryInRequest, user_id: int) -> InventoryTransactionResponse:
    """入庫を登録し、在庫数を加算する"""
    product = db.query(Product).filter(
        Product.id == data.product_id, Product.is_active == True  # noqa: E712
    ).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品が見つかりません",
        )

    # トランザクション：在庫加算と履歴登録を同時に行う
    product.current_stock += data.quantity
    transaction = InventoryTransaction(
        product_id=data.product_id,
        type="IN",
        quantity=data.quantity,
        note=data.note,
        created_by=user_id,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return InventoryTransactionResponse.model_validate(transaction)


def stock_out(db: Session, data: InventoryOutRequest, user_id: int) -> InventoryTransactionResponse:
    """出庫を登録し、在庫数を減算する。在庫不足の場合はエラーを返す"""
    product = db.query(Product).filter(
        Product.id == data.product_id, Product.is_active == True  # noqa: E712
    ).with_for_update().first()  # 同時書き込み防止のためロック
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品が見つかりません",
        )

    # 在庫がマイナスになる場合はエラー
    if product.current_stock < data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"在庫が不足しています（現在庫: {product.current_stock}）",
        )

    product.current_stock -= data.quantity
    transaction = InventoryTransaction(
        product_id=data.product_id,
        type="OUT",
        quantity=data.quantity,
        note=data.note,
        created_by=user_id,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return InventoryTransactionResponse.model_validate(transaction)


def get_history(
    db: Session,
    page: int = 1,
    size: int = 20,
    product_id: int | None = None,
    transaction_type: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> InventoryHistoryResponse:
    """入出庫履歴を取得する（フィルター・ページネーション対応）"""
    query = db.query(InventoryTransaction)

    if product_id is not None:
        query = query.filter(InventoryTransaction.product_id == product_id)

    if transaction_type is not None:
        query = query.filter(InventoryTransaction.type == transaction_type)

    if date_from is not None:
        query = query.filter(InventoryTransaction.created_at >= date_from)

    if date_to is not None:
        from datetime import datetime, time
        end_of_day = datetime.combine(date_to, time.max)
        query = query.filter(InventoryTransaction.created_at <= end_of_day)

    query = query.order_by(InventoryTransaction.created_at.desc())
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    pages = math.ceil(total / size) if total > 0 else 1

    return InventoryHistoryResponse(
        items=[InventoryTransactionResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        size=size,
        pages=pages,
    )
