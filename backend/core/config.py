from pydantic import BaseSettings, Field
from typing import Optional
from pathlib import Path


# Load `.env` from the backend package directory so `.env` can remain in `backend/`.
env_path = Path(__file__).resolve().parents[1] / ".env"


class Settings(BaseSettings):
    app_name: str = Field("Portfolio Tracker API", env="APP_NAME")
    debug: bool = Field(False, env="DEBUG")
    secret_key: Optional[str] = Field(None, env="SECRET_KEY")
    database_url: Optional[str] = Field(None, env="DATABASE_URL")
    host: str = Field("0.0.0.0", env="HOST")
    port: int = Field(8000, env="PORT")

    class Config:
        env_file = str(env_path)
        env_file_encoding = "utf-8"


settings = Settings()
