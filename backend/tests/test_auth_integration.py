"""Integration tests for authentication flows."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.models.user import User


class TestAuthRegistration:
    """Test user registration flow."""

    def test_register_user_success(self, client: TestClient, test_user_data: dict):
        """Test successful user registration."""
        response = client.post("/auth/register", json=test_user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["full_name"] == test_user_data["full_name"]
        assert "hashed_password" not in data  # Should not expose hashed password
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_register_user_with_minimal_data(self, client: TestClient):
        """Test user registration with minimal data (no full name)."""
        user_data = {
            "email": "minimal@example.com",
            "password": "password123",
        }
        response = client.post("/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "minimal@example.com"
        assert data["full_name"] is None

    def test_register_user_duplicate_email(self, client: TestClient, test_user_data: dict):
        """Test registration fails when email already exists."""
        # Register first user
        client.post("/auth/register", json=test_user_data)
        
        # Try to register with same email
        duplicate_data = test_user_data.copy()
        duplicate_data["password"] = "different_password"
        response = client.post("/auth/register", json=duplicate_data)
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    def test_register_user_invalid_email(self, client: TestClient):
        """Test registration fails with invalid email."""
        user_data = {
            "email": "not-an-email",
            "password": "password123",
        }
        # FastAPI validates the email format at schema level
        response = client.post("/auth/register", json=user_data)
        
        # Depending on implementation, might be 422 (validation error) or similar
        assert response.status_code in [400, 422]

    def test_register_user_password_too_short(self, client: TestClient):
        """Test registration fails when password is too short."""
        user_data = {
            "email": "test@example.com",
            "password": "short",  # Less than 8 characters
        }
        response = client.post("/auth/register", json=user_data)
        
        assert response.status_code == 422

    def test_register_user_missing_required_fields(self, client: TestClient):
        """Test registration fails when required fields are missing."""
        # Missing email
        response = client.post("/auth/register", json={"password": "password123"})
        assert response.status_code == 422
        
        # Missing password
        response = client.post("/auth/register", json={"email": "test@example.com"})
        assert response.status_code == 422


class TestAuthLogin:
    """Test user login and token generation."""

    def test_login_success(self, client: TestClient, test_user_data: dict):
        """Test successful login returns valid token."""
        # Register user
        client.post("/auth/register", json=test_user_data)
        
        # Login
        login_data = {
            "username": test_user_data["email"],
            "password": test_user_data["password"],
        }
        response = client.post("/auth/login", data=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert isinstance(data["access_token"], str)

    def test_login_invalid_email(self, client: TestClient):
        """Test login fails with non-existent email."""
        login_data = {
            "username": "nonexistent@example.com",
            "password": "password123",
        }
        response = client.post("/auth/login", data=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_login_wrong_password(self, client: TestClient, test_user_data: dict):
        """Test login fails with wrong password."""
        # Register user
        client.post("/auth/register", json=test_user_data)
        
        # Try login with wrong password
        login_data = {
            "username": test_user_data["email"],
            "password": "wrongpassword123",
        }
        response = client.post("/auth/login", data=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_login_missing_credentials(self, client: TestClient):
        """Test login fails when credentials are missing."""
        response = client.post("/auth/login", data={})
        
        assert response.status_code == 422

    def test_login_case_insensitive_email(self, client: TestClient, test_user_data: dict):
        """Test login with different email case."""
        # Register user
        client.post("/auth/register", json=test_user_data)
        
        # Login with different email case
        login_data = {
            "username": test_user_data["email"].upper(),
            "password": test_user_data["password"],
        }
        response = client.post("/auth/login", data=login_data)
        
        # This depends on whether emails are case-insensitive in the DB
        # Most implementations should be case-sensitive for emails
        assert response.status_code == 401


class TestAuthToken:
    """Test token validation and usage."""

    def test_access_protected_route_without_token(self, client: TestClient):
        """Test accessing protected route without token."""
        response = client.get("/portfolios/")
        
        assert response.status_code == 403

    def test_access_protected_route_with_invalid_token(self, client: TestClient):
        """Test accessing protected route with invalid token."""
        client.headers.update({"Authorization": "Bearer invalid_token_here"})
        response = client.get("/portfolios/")
        
        assert response.status_code == 403

    def test_access_protected_route_with_valid_token(
        self, authenticated_client: TestClient
    ):
        """Test accessing protected route with valid token."""
        response = authenticated_client.get("/portfolios/")
        
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_token_structure(self, client: TestClient, test_user_data: dict):
        """Test that token contains expected claims."""
        # Register user
        response = client.post("/auth/register", json=test_user_data)
        user_id = response.json()["id"]
        
        # Login
        login_data = {
            "username": test_user_data["email"],
            "password": test_user_data["password"],
        }
        response = client.post("/auth/login", data=login_data)
        token = response.json()["access_token"]
        
        # Decode token (JWT format: header.payload.signature)
        import base64
        import json
        
        parts = token.split(".")
        assert len(parts) == 3
        
        # Decode payload (add padding if needed)
        payload_str = parts[1]
        padding = 4 - (len(payload_str) % 4)
        if padding != 4:
            payload_str += "=" * padding
        
        payload = json.loads(base64.urlsafe_b64decode(payload_str))
        assert "exp" in payload
        assert "sub" in payload
        assert payload["sub"] == str(user_id)


class TestAuthIntegrationFlow:
    """Test complete authentication flow."""

    def test_complete_auth_flow(self, client: TestClient):
        """Test complete registration, login, and access flow."""
        user_data = {
            "email": "integration@example.com",
            "password": "securepass123",
            "full_name": "Integration Test",
        }
        
        # Step 1: Register
        response = client.post("/auth/register", json=user_data)
        assert response.status_code == 201
        user_id = response.json()["id"]
        
        # Step 2: Login
        login_data = {
            "username": user_data["email"],
            "password": user_data["password"],
        }
        response = client.post("/auth/login", data=login_data)
        assert response.status_code == 200
        token = response.json()["access_token"]
        
        # Step 3: Access protected route with token
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/portfolios/", headers=headers)
        assert response.status_code == 200
        
        # Step 4: Verify user sees their own data
        # At this point, they should have no portfolios
        assert len(response.json()) == 0

    def test_multiple_users_isolated(self, client: TestClient):
        """Test that different users are isolated from each other."""
        user1_data = {
            "email": "user1@example.com",
            "password": "password123",
            "full_name": "User One",
        }
        user2_data = {
            "email": "user2@example.com",
            "password": "password123",
            "full_name": "User Two",
        }
        
        # Register and login user 1
        client.post("/auth/register", json=user1_data)
        response1 = client.post(
            "/auth/login",
            data={"username": user1_data["email"], "password": user1_data["password"]},
        )
        token1 = response1.json()["access_token"]
        
        # Register and login user 2
        client.post("/auth/register", json=user2_data)
        response2 = client.post(
            "/auth/login",
            data={"username": user2_data["email"], "password": user2_data["password"]},
        )
        token2 = response2.json()["access_token"]
        
        # Both users should start with empty portfolios
        headers1 = {"Authorization": f"Bearer {token1}"}
        headers2 = {"Authorization": f"Bearer {token2}"}
        
        response = client.get("/portfolios/", headers=headers1)
        assert len(response.json()) == 0
        
        response = client.get("/portfolios/", headers=headers2)
        assert len(response.json()) == 0
