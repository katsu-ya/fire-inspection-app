from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.product import ProductCreate, ProductListResponse, ProductResponse, ProductUpdate
from app.services import product as product_service

router = APIRouter(prefix="/products", tags=["商品"])


@router.get("/", response_model=ProductListResponse)
def list_products(
    page: int = 1,
    size: int = 20,
    category_id: int | None = None,
    keyword: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> ProductListResponse:
    """商品一覧を取得する（ページネーション・フィルター対応）"""
    return product_service.get_products(db, page, size, category_id, keyword)


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> ProductResponse:
    """商品を新規登録する"""
    product = product_service.create_product(db, data)
    return ProductResponse.model_validate(product)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> ProductResponse:
    """商品詳細を取得する"""
    product = product_service.get_product(db, product_id)
    return ProductResponse.model_validate(product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> ProductResponse:
    """商品情報を更新する"""
    product = product_service.update_product(db, product_id, data)
    return ProductResponse.model_validate(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> None:
    """商品を論理削除する"""
    product_service.delete_product(db, product_id)
