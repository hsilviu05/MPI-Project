import sys
import os
from pathlib import Path
import tempfile
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# Add parent directories to path
ROOT_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = ROOT_DIR.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.main import app
from backend.db import get_db, init_db, close_db
from backend.models.base import Base
from backend.core.config import settings

# Set test secret key if not already set
if not settings.secret_key:
    settings.secret_key = "test-secret-key-for-testing-only-not-for-production"


# Use SQLite in-memory database for testing with StaticPool to ensure single connection
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,  # Use StaticPool to keep a single connection for in-memory DB
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Enable foreign keys for SQLite (disabled by default)
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


def override_get_db() -> Generator[Session, None, None]:
    """Override the get_db dependency for testing."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create all tables in the test database."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def clean_db():
    """Clean up the database before each test by truncating all tables."""
    # Truncate all data from tables before each test
    with engine.connect() as connection:
        for table in reversed(Base.metadata.sorted_tables):
            connection.execute(table.delete())
        connection.commit()
    yield


@pytest.fixture
def db() -> Generator[Session, None, None]:
    """Provide a clean database session for each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db: Session) -> TestClient:
    """Provide a test client with overridden database dependency."""
    app.dependency_overrides[get_db] = override_get_db
    
    yield TestClient(app)
    
    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    """Test user data."""
    return {
        "email": "testuser@example.com",
        "password": "testpassword123",
        "full_name": "Test User",
    }


@pytest.fixture
def test_user(client: TestClient, test_user_data: dict):
    """Create a test user and return the user data with ID."""
    response = client.post("/auth/register", json=test_user_data)
    assert response.status_code == 201
    user_data = response.json()
    return user_data


@pytest.fixture
def auth_token(client: TestClient, test_user: dict, test_user_data: dict) -> str:
    """Get an authentication token for the test user."""
    # User already registered by test_user fixture; just login
    login_data = {
        "username": test_user_data["email"],
        "password": test_user_data["password"],
    }
    response = client.post("/auth/login", data=login_data)
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture
def authenticated_client(client: TestClient, auth_token: str) -> TestClient:
    """Provide a test client with authentication header set."""
    client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return client
