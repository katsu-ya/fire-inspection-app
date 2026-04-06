from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # データベース設定
    DATABASE_URL: str

    # JWT設定
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # 環境設定
    ENV: str = "production"

    class Config:
        env_file = ".env"


settings = Settings()
