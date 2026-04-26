from pathlib import Path
from typing import Optional, cast
from urllib.parse import quote

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


# Load `.env` from the backend package directory so `.env` can remain in `backend/`.
env_path = Path(__file__).resolve().parents[1] / ".env"
INSECURE_SECRET_KEY_VALUES = {
    "",
    "change-me-in-production",
    "dev-only-secret-key-change-me",
}


def build_database_url(
    user: Optional[str],
    password: Optional[str],
    host: str,
    port: int,
    database: Optional[str],
) -> Optional[str]:
    if not user or not password or not database:
        return None

    safe_user = quote(user, safe="")
    safe_password = quote(password, safe="")
    return f"postgresql://{safe_user}:{safe_password}@{host}:{port}/{database}"


class Settings(BaseSettings):
    app_name: str = Field("Portfolio Tracker API", env="APP_NAME")
    app_env: str = Field("development", env="APP_ENV")
    debug: bool = Field(False, env="DEBUG")
    secret_key: Optional[str] = Field(None, env="SECRET_KEY")
    access_token_expire_minutes: int = Field(30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    database_url: Optional[str] = Field(None, env="DATABASE_URL")
    postgres_user: Optional[str] = Field(None, env="POSTGRES_USER")
    postgres_password: Optional[str] = Field(None, env="POSTGRES_PASSWORD")
    postgres_host: str = Field("localhost", env="POSTGRES_HOST")
    postgres_port: int = Field(5432, env="POSTGRES_PORT")
    postgres_db: Optional[str] = Field(None, env="POSTGRES_DB")
    host: str = Field("0.0.0.0", env="HOST")
    port: int = Field(8000, env="PORT")
    # External price provider configuration
    price_provider: Optional[str] = Field(None, env="PRICE_PROVIDER")
    price_provider_api_key: Optional[str] = Field(None, env="PRICE_PROVIDER_API_KEY")
    # Extra CORS origins, comma-separated (e.g. "https://app.example.com,https://app2.example.com")
    cors_allowed_origins: str = Field("", env="CORS_ALLOWED_ORIGINS")

    model_config = SettingsConfigDict(env_file=str(env_path), env_file_encoding="utf-8")

    @model_validator(mode="after")
    def populate_database_url(self) -> "Settings":
        if self.database_url:
            return self

        database_url = build_database_url(
            user=self.postgres_user,
            password=self.postgres_password,
            host=self.postgres_host,
            port=self.postgres_port,
            database=self.postgres_db,
        )
        if database_url:
            self.database_url = database_url

        return self

    def validate_runtime(self) -> None:
        if self.app_env.strip().lower() != "production":
            return

        errors = []
        secret_key = (self.secret_key or "").strip()

        if not secret_key or secret_key in INSECURE_SECRET_KEY_VALUES:
            errors.append(
                "SECRET_KEY must be set to a strong non-default value when APP_ENV=production."
            )
        if self.debug:
            errors.append("DEBUG must be false when APP_ENV=production.")
        if not self.database_url:
            errors.append(
                "DATABASE_URL or the POSTGRES_* variables must be set when APP_ENV=production."
            )

        if errors:
            raise RuntimeError("Invalid production configuration:\n- " + "\n- ".join(errors))

    @classmethod
    def load(cls, *, env_file: Optional[str] = str(env_path)) -> "Settings":
        is_default_env_file = False
        if env_file is not None:
            try:
                is_default_env_file = Path(env_file).resolve() == env_path.resolve()
            except OSError:
                is_default_env_file = False

        if is_default_env_file:
            return cast("Settings", cls())

        runtime_settings_cls = type(
            "RuntimeSettings",
            (cls,),
            {
                "model_config": SettingsConfigDict(
                    env_file=env_file,
                    env_file_encoding="utf-8",
                )
            },
        )
        return cast("Settings", runtime_settings_cls())


settings = Settings.load()
