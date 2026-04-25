"""Integration tests for holdings management flows."""

import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


@pytest.fixture
def test_portfolio(authenticated_client: TestClient):
    """Create a test portfolio and return its ID."""
    response = authenticated_client.post(
        "/portfolios/", json={"name": "Test Portfolio"}
    )
    return response.json()["id"]


@pytest.fixture
def test_asset(authenticated_client: TestClient):
    """Create a test asset and return its ID."""
    response = authenticated_client.post(
        "/assets/",
        json={"symbol": "TEST", "name": "Test Asset", "asset_type": "stock"},
    )
    return response.json()["id"]


@pytest.fixture
def another_asset(authenticated_client: TestClient):
    """Create another test asset and return its ID."""
    response = authenticated_client.post(
        "/assets/",
        json={"symbol": "TEST2", "name": "Test Asset 2", "asset_type": "stock"},
    )
    return response.json()["id"]


class TestHoldingCreation:
    """Test holding creation."""

    def test_create_holding_success(
        self, authenticated_client: TestClient, test_portfolio: int, test_asset: int
    ):
        """Test successful holding creation."""
        holding_data = {
            "asset_id": test_asset,
            "quantity": "10.5",
            "avg_cost": "100.00",
        }
        response = authenticated_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )

        assert response.status_code == 201
        data = response.json()
        assert data["asset_id"] == test_asset
        assert data["portfolio_id"] == test_portfolio
        assert Decimal(data["quantity"]) == Decimal("10.5")
        assert Decimal(data["avg_cost"]) == Decimal("100.00")
        assert "id" in data
        assert "created_at" in data

    def test_create_holding_without_avg_cost(
        self, authenticated_client: TestClient, test_portfolio: int, test_asset: int
    ):
        """Test holding creation without average cost."""
        holding_data = {
            "asset_id": test_asset,
            "quantity": "10",
        }
        response = authenticated_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )

        assert response.status_code == 201
        data = response.json()
        assert Decimal(data["quantity"]) == Decimal("10")
        assert data["avg_cost"] is None

    def test_create_holding_zero_quantity(
        self, authenticated_client: TestClient, test_portfolio: int, test_asset: int
    ):
        """Test holding creation with zero quantity."""
        holding_data = {
            "asset_id": test_asset,
            "quantity": "0",
        }
        response = authenticated_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )

        assert response.status_code == 201
        data = response.json()
        assert Decimal(data["quantity"]) == Decimal("0")

    def test_create_holding_negative_quantity_fails(
        self, authenticated_client: TestClient, test_portfolio: int, test_asset: int
    ):
        """Test that negative quantity fails."""
        holding_data = {
            "asset_id": test_asset,
            "quantity": "-10",
        }
        response = authenticated_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )

        assert response.status_code == 422

    def test_create_holding_nonexistent_portfolio(
        self, authenticated_client: TestClient, test_asset: int
    ):
        """Test holding creation fails with non-existent portfolio."""
        holding_data = {
            "asset_id": test_asset,
            "quantity": "10",
        }
        response = authenticated_client.post(
            "/portfolios/99999/holdings/", json=holding_data
        )

        assert response.status_code == 404
        assert "Portfolio not found" in response.json()["detail"]

    def test_create_holding_nonexistent_asset(
        self, authenticated_client: TestClient, test_portfolio: int
    ):
        """Test holding creation fails with non-existent asset."""
        holding_data = {
            "asset_id": 99999,
            "quantity": "10",
        }
        response = authenticated_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )

        assert response.status_code == 404
        assert "Asset not found" in response.json()["detail"]

    def test_create_holding_without_auth(self, client: TestClient):
        """Test holding creation fails without authentication."""
        holding_data = {
            "asset_id": 1,
            "quantity": "10",
        }
        response = client.post("/portfolios/1/holdings/", json=holding_data)

        assert response.status_code == 401


class TestHoldingRetrieval:
    """Test holding retrieval."""

    def test_list_empty_holdings(
        self, authenticated_client: TestClient, test_portfolio: int
    ):
        """Test listing holdings when none exist."""
        response = authenticated_client.get(f"/portfolios/{test_portfolio}/holdings/")

        assert response.status_code == 200
        assert response.json() == []

    def test_list_holdings(
        self,
        authenticated_client: TestClient,
        test_portfolio: int,
        test_asset: int,
        another_asset: int,
    ):
        """Test listing multiple holdings."""
        auth_client = authenticated_client

        # Create first holding
        holding1_data = {"asset_id": test_asset, "quantity": "10"}
        response1 = auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding1_data
        )
        holding1_id = response1.json()["id"]

        # Create second holding
        holding2_data = {"asset_id": another_asset, "quantity": "20"}
        response2 = auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding2_data
        )
        holding2_id = response2.json()["id"]

        # List holdings
        response = auth_client.get(f"/portfolios/{test_portfolio}/holdings/")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        ids = [h["id"] for h in data]
        assert holding1_id in ids
        assert holding2_id in ids

    def test_list_holdings_nonexistent_portfolio(
        self, authenticated_client: TestClient
    ):
        """Test listing holdings for non-existent portfolio."""
        response = authenticated_client.get("/portfolios/99999/holdings/")

        assert response.status_code == 404


class TestHoldingUpdate:
    """Test holding updates."""

    def test_update_holding_quantity(
        self, authenticated_client: TestClient, test_portfolio: int, test_asset: int
    ):
        """Test updating holding quantity."""
        auth_client = authenticated_client

        # Create holding
        holding_data = {"asset_id": test_asset, "quantity": "10"}
        response = auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )
        holding_id = response.json()["id"]

        # Update holding
        update_data = {"quantity": "15"}
        response = auth_client.put(
            f"/portfolios/{test_portfolio}/holdings/{holding_id}",
            json=update_data,
        )

        assert response.status_code == 200
        assert Decimal(response.json()["quantity"]) == Decimal("15")

    def test_update_holding_avg_cost(
        self, authenticated_client: TestClient, test_portfolio: int, test_asset: int
    ):
        """Test updating holding average cost."""
        auth_client = authenticated_client

        # Create holding
        holding_data = {
            "asset_id": test_asset,
            "quantity": "10",
            "avg_cost": "100",
        }
        response = auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )
        holding_id = response.json()["id"]

        # Update average cost
        update_data = {"avg_cost": "150"}
        response = auth_client.put(
            f"/portfolios/{test_portfolio}/holdings/{holding_id}",
            json=update_data,
        )

        assert response.status_code == 200
        assert Decimal(response.json()["avg_cost"]) == Decimal("150")

    def test_update_holding_partial(
        self, authenticated_client: TestClient, test_portfolio: int, test_asset: int
    ):
        """Test partial holding update."""
        auth_client = authenticated_client

        # Create holding
        holding_data = {
            "asset_id": test_asset,
            "quantity": "10",
            "avg_cost": "100",
        }
        response = auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )
        holding_id = response.json()["id"]

        # Update only quantity
        update_data = {"quantity": "20"}
        response = auth_client.put(
            f"/portfolios/{test_portfolio}/holdings/{holding_id}",
            json=update_data,
        )

        assert response.status_code == 200
        data = response.json()
        assert Decimal(data["quantity"]) == Decimal("20")
        assert Decimal(data["avg_cost"]) == Decimal("100")

    def test_update_nonexistent_holding(
        self, authenticated_client: TestClient, test_portfolio: int
    ):
        """Test updating non-existent holding."""
        update_data = {"quantity": "15"}
        response = authenticated_client.put(
            f"/portfolios/{test_portfolio}/holdings/99999",
            json=update_data,
        )

        assert response.status_code == 404


class TestHoldingDelete:
    """Test holding deletion."""

    def test_delete_holding_success(
        self, authenticated_client: TestClient, test_portfolio: int, test_asset: int
    ):
        """Test successful holding deletion."""
        auth_client = authenticated_client

        # Create holding
        holding_data = {"asset_id": test_asset, "quantity": "10"}
        response = auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )
        holding_id = response.json()["id"]

        # Delete holding
        response = auth_client.delete(
            f"/portfolios/{test_portfolio}/holdings/{holding_id}"
        )

        assert response.status_code == 200
        assert response.json()["id"] == holding_id

        # Verify deletion
        response = auth_client.get(f"/portfolios/{test_portfolio}/holdings/")
        assert len(response.json()) == 0

    def test_delete_nonexistent_holding(
        self, authenticated_client: TestClient, test_portfolio: int
    ):
        """Test deleting non-existent holding."""
        response = authenticated_client.delete(
            f"/portfolios/{test_portfolio}/holdings/99999"
        )

        assert response.status_code == 404


class TestHoldingWithTransactions:
    """Test holdings with transactions."""

    def test_holding_quantity_updated_on_buy_transaction(
        self, authenticated_client: TestClient, test_portfolio: int, test_asset: int
    ):
        """Test that holding quantity updates when buy transaction is created."""
        auth_client = authenticated_client
        from datetime import datetime

        # Create holding
        holding_data = {
            "asset_id": test_asset,
            "quantity": "10",
            "avg_cost": "100",
        }
        response = auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )
        holding_id = response.json()["id"]

        # Create buy transaction
        transaction_data = {
            "type": "buy",
            "quantity": "5",
            "price": "110",
            "fees": "10",
        }
        response = auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/{holding_id}/transactions/",
            json=transaction_data,
        )

        assert response.status_code == 201

        # Verify holding was updated
        response = auth_client.get(
            f"/portfolios/{test_portfolio}/holdings/"
        )
        holdings = response.json()
        holding = [h for h in holdings if h["id"] == holding_id][0]

        # quantity: 10 + 5 = 15
        # cost: (100*10 + 110*5 + 10) / 15 = 1210 / 15 ≈ 80.67
        assert Decimal(holding["quantity"]) == Decimal("15")

    def test_holding_quantity_updated_on_sell_transaction(
        self, authenticated_client: TestClient, test_portfolio: int, test_asset: int
    ):
        """Test that holding quantity updates when sell transaction is created."""
        auth_client = authenticated_client

        # Create holding with 20 units
        holding_data = {
            "asset_id": test_asset,
            "quantity": "20",
            "avg_cost": "100",
        }
        response = auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )
        holding_id = response.json()["id"]

        # Create sell transaction
        transaction_data = {
            "type": "sell",
            "quantity": "5",
            "price": "150",
        }
        response = auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/{holding_id}/transactions/",
            json=transaction_data,
        )

        assert response.status_code == 201

        # Verify holding was updated
        response = auth_client.get(
            f"/portfolios/{test_portfolio}/holdings/"
        )
        holdings = response.json()
        holding = [h for h in holdings if h["id"] == holding_id][0]

        # quantity: 20 - 5 = 15
        assert Decimal(holding["quantity"]) == Decimal("15")

    def test_sell_more_than_holding_fails(
        self, authenticated_client: TestClient, test_portfolio: int, test_asset: int
    ):
        """Test that selling more than available fails."""
        auth_client = authenticated_client

        # Create holding with 10 units
        holding_data = {
            "asset_id": test_asset,
            "quantity": "10",
        }
        response = auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )
        holding_id = response.json()["id"]

        # Try to sell 20 units
        transaction_data = {
            "type": "sell",
            "quantity": "20",
            "price": "150",
        }
        response = auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/{holding_id}/transactions/",
            json=transaction_data,
        )

        assert response.status_code == 400
        assert "Insufficient holdings" in response.json()["detail"]


class TestHoldingUserIsolation:
    """Test user isolation for holdings."""

    def test_user_cannot_access_other_users_holdings(self, client: TestClient):
        """Test that users cannot see each other's holdings."""
        # Create user 1 and portfolio/holding
        user1_data = {"email": "user1@test.com", "password": "password123"}
        client.post("/auth/register", json=user1_data)
        response1 = client.post(
            "/auth/login",
            data={"username": user1_data["email"], "password": user1_data["password"]},
        )
        token1 = response1.json()["access_token"]

        headers1 = {"Authorization": f"Bearer {token1}"}

        # Create portfolio
        response = client.post(
            "/portfolios/", json={"name": "User1 Portfolio"}, headers=headers1
        )
        portfolio_id = response.json()["id"]

        # Create asset
        response = client.post(
            "/assets/",
            json={"symbol": "TEST", "name": "Test Asset"},
            headers=headers1,
        )
        asset_id = response.json()["id"]

        # Create holding
        response = client.post(
            f"/portfolios/{portfolio_id}/holdings/",
            json={"asset_id": asset_id, "quantity": "10"},
            headers=headers1,
        )
        holding_id = response.json()["id"]

        # Create user 2
        user2_data = {"email": "user2@test.com", "password": "password123"}
        client.post("/auth/register", json=user2_data)
        response2 = client.post(
            "/auth/login",
            data={"username": user2_data["email"], "password": user2_data["password"]},
        )
        token2 = response2.json()["access_token"]

        headers2 = {"Authorization": f"Bearer {token2}"}

        # User 2 tries to list holdings
        response = client.get(
            f"/portfolios/{portfolio_id}/holdings/", headers=headers2
        )
        assert response.status_code == 404
