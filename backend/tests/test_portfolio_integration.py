"""Integration tests for portfolio management flows."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestPortfolioCreation:
    """Test portfolio creation."""

    def test_create_portfolio_success(self, authenticated_client: TestClient):
        """Test successful portfolio creation."""
        portfolio_data = {
            "name": "My Investment Portfolio",
            "description": "A portfolio to track my investments",
        }
        response = authenticated_client.post("/portfolios/", json=portfolio_data)

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == portfolio_data["name"]
        assert data["description"] == portfolio_data["description"]
        assert data["owner_id"] is not None
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_portfolio_minimal_data(self, authenticated_client: TestClient):
        """Test portfolio creation with minimal data."""
        portfolio_data = {
            "name": "Simple Portfolio",
        }
        response = authenticated_client.post("/portfolios/", json=portfolio_data)

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Simple Portfolio"
        assert data["description"] is None

    def test_create_portfolio_without_auth(self, client: TestClient):
        """Test portfolio creation fails without authentication."""
        portfolio_data = {
            "name": "My Portfolio",
        }
        response = client.post("/portfolios/", json=portfolio_data)

        assert response.status_code == 401

    def test_create_portfolio_missing_required_fields(
        self, authenticated_client: TestClient
    ):
        """Test portfolio creation fails with missing required fields."""
        # Missing name
        response = authenticated_client.post("/portfolios/", json={"description": "Test"})
        assert response.status_code == 422

    def test_create_portfolio_name_too_long(self, authenticated_client: TestClient):
        """Test portfolio creation fails when name exceeds max length."""
        portfolio_data = {
            "name": "x" * 256,  # Exceeds 255 character limit
        }
        response = authenticated_client.post("/portfolios/", json=portfolio_data)

        assert response.status_code == 422


class TestPortfolioRetrieval:
    """Test portfolio retrieval."""

    def test_list_empty_portfolios(self, authenticated_client: TestClient):
        """Test listing portfolios when none exist."""
        response = authenticated_client.get("/portfolios/")

        assert response.status_code == 200
        assert response.json() == []

    def test_list_portfolios(self, authenticated_client: TestClient):
        """Test listing multiple portfolios."""
        # Create first portfolio
        auth_client = authenticated_client
        portfolio1_data = {"name": "Portfolio 1"}
        response1 = auth_client.post("/portfolios/", json=portfolio1_data)
        portfolio1_id = response1.json()["id"]

        # Create second portfolio
        portfolio2_data = {"name": "Portfolio 2"}
        response2 = auth_client.post("/portfolios/", json=portfolio2_data)
        portfolio2_id = response2.json()["id"]

        # List portfolios
        response = auth_client.get("/portfolios/")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["id"] == portfolio1_id
        assert data[1]["id"] == portfolio2_id

    def test_get_portfolio_by_id(self, authenticated_client: TestClient):
        """Test retrieving a specific portfolio."""
        auth_client = authenticated_client

        # Create portfolio
        portfolio_data = {"name": "Test Portfolio", "description": "For testing"}
        response = auth_client.post("/portfolios/", json=portfolio_data)
        portfolio_id = response.json()["id"]

        # Get portfolio
        response = auth_client.get(f"/portfolios/{portfolio_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == portfolio_id
        assert data["name"] == "Test Portfolio"
        assert data["description"] == "For testing"
        assert data["holdings"] == []

    def test_get_other_user_portfolio_is_not_visible(self, client: TestClient):
        """Test that one user cannot access another user's portfolio."""
        user1_data = {"email": "user1@portfolio.example.com", "password": "password123"}
        user2_data = {"email": "user2@portfolio.example.com", "password": "password123"}

        client.post("/auth/register", json=user1_data)
        response1 = client.post(
            "/auth/login",
            data={"username": user1_data["email"], "password": user1_data["password"]},
        )
        token1 = response1.json()["access_token"]

        response = client.post(
            "/portfolios/",
            json={"name": "User 1 Portfolio"},
            headers={"Authorization": f"Bearer {token1}"},
        )
        portfolio_id = response.json()["id"]

        client.post("/auth/register", json=user2_data)
        response2 = client.post(
            "/auth/login",
            data={"username": user2_data["email"], "password": user2_data["password"]},
        )
        token2 = response2.json()["access_token"]

        response = client.get(
            f"/portfolios/{portfolio_id}",
            headers={"Authorization": f"Bearer {token2}"},
        )

        assert response.status_code == 404

    def test_get_nonexistent_portfolio(self, authenticated_client: TestClient):
        """Test retrieving non-existent portfolio."""
        response = authenticated_client.get("/portfolios/99999")

        assert response.status_code == 404
        assert "Portfolio not found" in response.json()["detail"]

    def test_list_portfolios_pagination(self, authenticated_client: TestClient):
        """Test portfolio listing with pagination."""
        auth_client = authenticated_client

        # Create 5 portfolios
        for i in range(5):
            portfolio_data = {"name": f"Portfolio {i}"}
            auth_client.post("/portfolios/", json=portfolio_data)

        # Get with limit
        response = auth_client.get("/portfolios/?limit=2")
        assert len(response.json()) == 2

        # Get with skip
        response = auth_client.get("/portfolios/?skip=3")
        assert len(response.json()) == 2


class TestPortfolioUpdate:
    """Test portfolio updates."""

    def test_update_portfolio_name(self, authenticated_client: TestClient):
        """Test updating portfolio name."""
        auth_client = authenticated_client

        # Create portfolio
        portfolio_data = {"name": "Old Name"}
        response = auth_client.post("/portfolios/", json=portfolio_data)
        portfolio_id = response.json()["id"]

        # Update portfolio
        update_data = {"name": "New Name"}
        response = auth_client.put(f"/portfolios/{portfolio_id}", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "New Name"

        # Verify update persisted
        response = auth_client.get(f"/portfolios/{portfolio_id}")
        assert response.json()["name"] == "New Name"

    def test_update_portfolio_description(self, authenticated_client: TestClient):
        """Test updating portfolio description."""
        auth_client = authenticated_client

        # Create portfolio
        portfolio_data = {"name": "Test Portfolio"}
        response = auth_client.post("/portfolios/", json=portfolio_data)
        portfolio_id = response.json()["id"]

        # Update description
        update_data = {"description": "Updated description"}
        response = auth_client.put(f"/portfolios/{portfolio_id}", json=update_data)

        assert response.status_code == 200
        assert response.json()["description"] == "Updated description"

    def test_update_nonexistent_portfolio(self, authenticated_client: TestClient):
        """Test updating non-existent portfolio."""
        update_data = {"name": "New Name"}
        response = authenticated_client.put(
            "/portfolios/99999", json=update_data
        )

        assert response.status_code == 404

    def test_update_portfolio_partial(self, authenticated_client: TestClient):
        """Test partial portfolio update."""
        auth_client = authenticated_client

        # Create portfolio
        portfolio_data = {
            "name": "Original Name",
            "description": "Original Description",
        }
        response = auth_client.post("/portfolios/", json=portfolio_data)
        portfolio_id = response.json()["id"]

        # Update only name
        update_data = {"name": "Updated Name"}
        response = auth_client.put(f"/portfolios/{portfolio_id}", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["description"] == "Original Description"


class TestPortfolioDelete:
    """Test portfolio deletion."""

    def test_delete_portfolio_success(self, authenticated_client: TestClient):
        """Test successful portfolio deletion."""
        auth_client = authenticated_client

        # Create portfolio
        portfolio_data = {"name": "To Delete"}
        response = auth_client.post("/portfolios/", json=portfolio_data)
        portfolio_id = response.json()["id"]

        # Delete portfolio
        response = auth_client.delete(f"/portfolios/{portfolio_id}")

        assert response.status_code == 200
        assert response.json()["id"] == portfolio_id

        # Verify deletion
        response = auth_client.get(f"/portfolios/{portfolio_id}")
        assert response.status_code == 404

    def test_delete_portfolio_cascade_holdings(
        self, authenticated_client: TestClient
    ):
        """Test that deleting portfolio cascades to holdings."""
        auth_client = authenticated_client

        # Create portfolio
        portfolio_response = auth_client.post(
            "/portfolios/", json={"name": "To Delete"}
        )
        portfolio_id = portfolio_response.json()["id"]

        # Create asset
        asset_response = auth_client.post(
            "/assets/",
            json={"symbol": "TEST", "name": "Test Asset"},
        )
        asset_id = asset_response.json()["id"]

        # Create holding
        holding_response = auth_client.post(
            f"/portfolios/{portfolio_id}/holdings/",
            json={"asset_id": asset_id, "quantity": 10},
        )
        holding_id = holding_response.json()["id"]

        # Delete portfolio
        auth_client.delete(f"/portfolios/{portfolio_id}")

        # Verify portfolio is deleted
        response = auth_client.get(f"/portfolios/{portfolio_id}")
        assert response.status_code == 404

    def test_delete_nonexistent_portfolio(self, authenticated_client: TestClient):
        """Test deleting non-existent portfolio."""
        response = authenticated_client.delete("/portfolios/99999")

        assert response.status_code == 404


class TestPortfolioUserIsolation:
    """Test user isolation for portfolios."""

    def test_portfolio_isolation_between_users(self, client: TestClient):
        """Test that users cannot see each other's portfolios."""
        # Create and login user 1
        user1_data = {
            "email": "user1@test.com",
            "password": "password123",
        }
        client.post("/auth/register", json=user1_data)
        response1 = client.post(
            "/auth/login",
            data={"username": user1_data["email"], "password": user1_data["password"]},
        )
        token1 = response1.json()["access_token"]

        # Create and login user 2
        user2_data = {
            "email": "user2@test.com",
            "password": "password123",
        }
        client.post("/auth/register", json=user2_data)
        response2 = client.post(
            "/auth/login",
            data={"username": user2_data["email"], "password": user2_data["password"]},
        )
        token2 = response2.json()["access_token"]

        # User 1 creates portfolio
        headers1 = {"Authorization": f"Bearer {token1}"}
        response = client.post(
            "/portfolios/",
            json={"name": "User1 Portfolio"},
            headers=headers1,
        )
        portfolio_id = response.json()["id"]

        # User 1 can see their portfolio
        response = client.get(f"/portfolios/{portfolio_id}", headers=headers1)
        assert response.status_code == 200

        # User 2 cannot see user 1's portfolio
        headers2 = {"Authorization": f"Bearer {token2}"}
        response = client.get(f"/portfolios/{portfolio_id}", headers=headers2)
        assert response.status_code == 404

    def test_user_cannot_modify_other_users_portfolio(self, client: TestClient):
        """Test that users cannot modify other users' portfolios."""
        # Create user 1 and portfolio
        user1_data = {
            "email": "user1@test.com",
            "password": "password123",
        }
        client.post("/auth/register", json=user1_data)
        response1 = client.post(
            "/auth/login",
            data={"username": user1_data["email"], "password": user1_data["password"]},
        )
        token1 = response1.json()["access_token"]

        headers1 = {"Authorization": f"Bearer {token1}"}
        response = client.post(
            "/portfolios/",
            json={"name": "User1 Portfolio"},
            headers=headers1,
        )
        portfolio_id = response.json()["id"]

        # Create user 2
        user2_data = {
            "email": "user2@test.com",
            "password": "password123",
        }
        client.post("/auth/register", json=user2_data)
        response2 = client.post(
            "/auth/login",
            data={"username": user2_data["email"], "password": user2_data["password"]},
        )
        token2 = response2.json()["access_token"]

        # User 2 tries to update user 1's portfolio
        headers2 = {"Authorization": f"Bearer {token2}"}
        response = client.put(
            f"/portfolios/{portfolio_id}",
            json={"name": "Hacked Portfolio"},
            headers=headers2,
        )

        assert response.status_code == 404
