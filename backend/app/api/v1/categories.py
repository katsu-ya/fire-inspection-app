from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse

router = APIRouter(prefix="/categories", tags=["カテゴリ"])


@router.get("/", response_model=list[CategoryResponse])
def list_categories(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[CategoryResponse]:
    """カテゴリ一覧を取得する"""
    categories = db.query(Category).order_by(Category.name).all()
    return [CategoryResponse.model_validate(c) for c in categories]


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> CategoryResponse:
    """カテゴリを新規作成する"""
    category = Category(name=data.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return CategoryResponse.model_validate(category)
