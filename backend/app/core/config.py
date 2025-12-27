from pydantic_settings import BaseSettings
from typing import Optional, List
import secrets


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/cursor_market"

    # JWT - Production uchun SECRET_KEY .env dan o'qilishi kerak
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS - Production uchun kerakli domainlarni qo'shing
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004"
    ]

    # App
    PROJECT_NAME: str = "AyTiX Marketplace API"
    API_V1_PREFIX: str = "/api/v1"

    # Upload settings
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    ALLOWED_VIDEO_TYPES: List[str] = ["video/mp4", "video/webm", "video/quicktime"]

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # .env dagi qo'shimcha maydonlarni ignore qilish


settings = Settings()



