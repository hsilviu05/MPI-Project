import pytest

from backend.core.config import Settings


def test_settings_uses_database_url_when_provided(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:password@db:5432/portfolio")
    monkeypatch.setenv("POSTGRES_USER", "ignored")
    monkeypatch.setenv("POSTGRES_PASSWORD", "ignored")
    monkeypatch.setenv("POSTGRES_HOST", "ignored")
    monkeypatch.setenv("POSTGRES_PORT", "5432")
    monkeypatch.setenv("POSTGRES_DB", "ignored")

    settings = Settings.load(env_file=None)

    assert settings.database_url == "postgresql://user:password@db:5432/portfolio"


def test_settings_builds_database_url_from_postgres_parts(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("POSTGRES_USER", "portfolio_user")
    monkeypatch.setenv("POSTGRES_PASSWORD", "p@ss word")
    monkeypatch.setenv("POSTGRES_HOST", "db")
    monkeypatch.setenv("POSTGRES_PORT", "5432")
    monkeypatch.setenv("POSTGRES_DB", "portfolio")

    settings = Settings.load(env_file=None)

    assert settings.database_url == "postgresql://portfolio_user:p%40ss%20word@db:5432/portfolio"


def test_validate_runtime_allows_development_defaults(monkeypatch):
    monkeypatch.setenv("APP_ENV", "development")
    monkeypatch.delenv("SECRET_KEY", raising=False)
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("POSTGRES_USER", raising=False)
    monkeypatch.delenv("POSTGRES_PASSWORD", raising=False)
    monkeypatch.delenv("POSTGRES_DB", raising=False)
    monkeypatch.setenv("DEBUG", "true")

    settings = Settings.load(env_file=None)

    settings.validate_runtime()


def test_validate_runtime_rejects_invalid_production_settings(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("DEBUG", "true")
    monkeypatch.setenv("SECRET_KEY", "dev-only-secret-key-change-me")
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("POSTGRES_USER", raising=False)
    monkeypatch.delenv("POSTGRES_PASSWORD", raising=False)
    monkeypatch.delenv("POSTGRES_DB", raising=False)

    settings = Settings.load(env_file=None)

    with pytest.raises(RuntimeError) as excinfo:
        settings.validate_runtime()

    message = str(excinfo.value)
    assert "SECRET_KEY" in message
    assert "DEBUG must be false" in message
    assert "DATABASE_URL" in message


def test_validate_runtime_accepts_valid_production_settings(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("DEBUG", "false")
    monkeypatch.setenv("SECRET_KEY", "production-secret-key-123")
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:password@db:5432/portfolio")

    settings = Settings.load(env_file=None)

    settings.validate_runtime()
