import math
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductListResponse, ProductResponse, ProductUpdate


def get_products(
    db: Session,
    page: int = 1,
    size: int = 20,
    category_id: int | None = None,
    keyword: str | None = None,
) -> ProductListResponse:
    """商品一覧を取得する（ページネーション・フィルター対応）"""
    query = db.query(Product).filter(Product.is_active == True)  # noqa: E712

    if category_id is not None:
        query = query.filter(Product.category_id == category_id)

    if keyword:
        query = query.filter(
            Product.name.contains(keyword) | Product.sku.contains(keyword)
        )

    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    pages = math.ceil(total / size) if total > 0 else 1

    return ProductListResponse(
        items=[ProductResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


def get_product(db: Session, product_id: int) -> Product:
    """IDで商品を取得する。存在しない場合は404を返す"""
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.is_active == True)  # noqa: E712
        .first()
    )
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品が見つかりません",
        )
    return product


def create_product(db: Session, data: ProductCreate) -> Product:
    """商品を新規登録する"""
    # SKUの重複チェック
    existing = db.query(Product).filter(Product.sku == data.sku).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このSKUはすでに使用されています",
        )
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, data: ProductUpdate) -> Product:
    """商品情報を更新する"""
    product = get_product(db, product_id)
    update_data = data.model_dump(exclude_unset=True)

    # SKU変更時の重複チェック
    if "sku" in update_data:
        existing = (
            db.query(Product)
            .filter(Product.sku == update_data["sku"], Product.id != product_id)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="このSKUはすでに使用されています",
            )

    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> None:
    """商品を論理削除する（is_active=False）"""
    product = get_product(db, product_id)
    product.is_active = False
    db.commit()
