"""
Central application configuration.

All environment-dependent values (DB credentials, secrets, CORS origins, etc.)
are read here via Pydantic's BaseSettings, so no other module should read
os.environ directly. This keeps configuration in one auditable place.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- General app metadata ---
    PROJECT_NAME: str = "Digital Evidence Correlation System"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"  # development | staging | production
    DEBUG: bool = True

    # --- Database (values come from .env; not connected to yet in this module) ---
    DATABASE_URL: str = (
        "postgresql+psycopg://postgres:Postgres123@localhost:5432/alibi_verification_db"
    )

    # --- Security placeholders (used starting Module 2 - Auth) ---
    JWT_SECRET_KEY: str = "change-this-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # --- CORS ---
    CORS_ORIGINS: list[str] = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


@lru_cache
def get_settings() -> Settings:
    """
    Returns a cached Settings instance so the .env file is parsed only once
    per process, instead of on every import.
    """
    return Settings()


settings = get_settings()