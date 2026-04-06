from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User


def init_db(db: Session) -> None:
    """初期データを投入する（管理者ユーザーが存在しない場合のみ作成）"""
    # 管理者ユーザーが存在するか確認
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin_user = User(
            email="admin@example.com",
            password_hash=hash_password("admin1234"),
            name="管理者",
            is_active=True,
        )
        db.add(admin_user)
        db.commit()
        print("管理者ユーザーを作成しました: admin@example.com / admin1234")
