from pydantic import BaseSettings, Field
from typing import Optional
from pathlib import Path


# Load `.env` from the backend package directory so `.env` can remain in `backend/`.
env_path = Path(__file__).resolve().parents[1] / ".env"


class Settings(BaseSettings):
    app_name: str = Field("Portfolio Tracker API", env="APP_NAME")
    debug: bool = Field(False, env="DEBUG")
    secret_key: Optional[str] = Field(None, env="SECRET_KEY")
    access_token_expire_minutes: int = Field(30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    database_url: Optional[str] = Field(None, env="DATABASE_URL")
    host: str = Field("0.0.0.0", env="HOST")
    port: int = Field(8000, env="PORT")
    # External price provider configuration
    price_provider: Optional[str] = Field(None, env="PRICE_PROVIDER")
    price_provider_api_key: Optional[str] = Field(None, env="PRICE_PROVIDER_API_KEY")

    class Config:
        env_file = str(env_path)
        env_file_encoding = "utf-8"


settings = Settings()
