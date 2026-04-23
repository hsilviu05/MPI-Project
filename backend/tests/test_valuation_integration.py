"""Integration tests for portfolio valuation flows."""

import pytest
from decimal import Decimal
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import insert

from backend.models.price_snapshot import PriceSnapshot


@pytest.fixture
def test_portfolio(authenticated_client: TestClient):
    """Create a test portfolio and return its ID."""
    response = authenticated_client.post(
        "/portfolios/", json={"name": "Valuation Test Portfolio"}
    )
    return response.json()["id"]


@pytest.fixture
def test_assets(authenticated_client: TestClient):
    """Create multiple test assets and return their IDs."""
    assets = []
    for i in range(3):
        response = authenticated_client.post(
            "/assets/",
            json={
                "symbol": f"TEST{i}",
                "name": f"Test Asset {i}",
                "asset_type": "stock",
            },
        )
        assets.append(response.json()["id"])
    return assets


def add_price_snapshot(db: Session, asset_id: int, price: Decimal):
    """Helper to add a price snapshot for an asset."""
    snapshot = PriceSnapshot(
        asset_id=asset_id,
        timestamp=datetime.utcnow(),
        price=price,
        source="test",
    )
    db.add(snapshot)
    db.commit()
    return snapshot


class TestPortfolioValuationEmpty:
    """Test valuation for empty portfolios."""

    def test_valuation_empty_portfolio(
        self, authenticated_client: TestClient, test_portfolio: int
    ):
        """Test valuation of portfolio with no holdings."""
        response = authenticated_client.get(f"/portfolios/{test_portfolio}/valuation")

        assert response.status_code == 200
        data = response.json()
        assert data["portfolio_id"] == test_portfolio
        assert data["total_value"] == Decimal("0")
        assert data["assets"] == []

    def test_valuation_missing_prices(
        self,
        authenticated_client: TestClient,
        test_portfolio: int,
        test_assets: list,
    ):
        """Test valuation when asset prices are missing."""
        auth_client = authenticated_client

        # Create holdings without price snapshots
        asset_id = test_assets[0]
        holding_data = {"asset_id": asset_id, "quantity": Decimal("10")}
        response = auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )
        holding_id = response.json()["id"]

        # Get valuation
        response = auth_client.get(f"/portfolios/{test_portfolio}/valuation")

        assert response.status_code == 200
        data = response.json()
        assert data["total_value"] == Decimal("0")
        assert len(data["assets"]) == 1

        asset = data["assets"][0]
        assert asset["asset_id"] == asset_id
        assert asset["quantity"] == Decimal("10")
        assert asset["missing_price"] is True
        assert asset["price"] is None
        assert asset["value"] is None


class TestPortfolioValuationSingleAsset:
    """Test valuation with single asset."""

    def test_valuation_single_asset_with_price(
        self,
        authenticated_client: TestClient,
        test_portfolio: int,
        test_assets: list,
        db: Session,
    ):
        """Test valuation of portfolio with single asset and price."""
        auth_client = authenticated_client
        asset_id = test_assets[0]

        # Create holding
        holding_data = {"asset_id": asset_id, "quantity": Decimal("10.5")}
        response = auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )

        # Add price snapshot
        add_price_snapshot(db, asset_id, Decimal("100.50"))

        # Get valuation
        response = auth_client.get(f"/portfolios/{test_portfolio}/valuation")

        assert response.status_code == 200
        data = response.json()
        
        # Expected value: 10.5 * 100.50 = 1055.25
        assert data["total_value"] == Decimal("1055.25")
        assert len(data["assets"]) == 1

        asset = data["assets"][0]
        assert asset["asset_id"] == asset_id
        assert asset["quantity"] == Decimal("10.5")
        assert asset["price"] == Decimal("100.50")
        assert asset["value"] == Decimal("1055.25")
        assert asset["missing_price"] is False

    def test_valuation_fractional_quantities(
        self,
        authenticated_client: TestClient,
        test_portfolio: int,
        test_assets: list,
        db: Session,
    ):
        """Test valuation with fractional quantities."""
        auth_client = authenticated_client
        asset_id = test_assets[0]

        # Create holding with fractional quantity
        holding_data = {"asset_id": asset_id, "quantity": Decimal("0.001234")}
        response = auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )

        # Add price snapshot
        add_price_snapshot(db, asset_id, Decimal("50000"))

        # Get valuation
        response = auth_client.get(f"/portfolios/{test_portfolio}/valuation")

        assert response.status_code == 200
        data = response.json()
        
        # Expected value: 0.001234 * 50000 = 61.7
        assert data["total_value"] == Decimal("61.7")


class TestPortfolioValuationMultipleAssets:
    """Test valuation with multiple assets."""

    def test_valuation_multiple_assets(
        self,
        authenticated_client: TestClient,
        test_portfolio: int,
        test_assets: list,
        db: Session,
    ):
        """Test valuation with multiple assets."""
        auth_client = authenticated_client

        # Create holdings for first two assets
        asset1_id = test_assets[0]
        asset2_id = test_assets[1]

        holding1_data = {"asset_id": asset1_id, "quantity": Decimal("10")}
        auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding1_data
        )

        holding2_data = {"asset_id": asset2_id, "quantity": Decimal("20")}
        auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding2_data
        )

        # Add price snapshots
        add_price_snapshot(db, asset1_id, Decimal("100"))
        add_price_snapshot(db, asset2_id, Decimal("50"))

        # Get valuation
        response = auth_client.get(f"/portfolios/{test_portfolio}/valuation")

        assert response.status_code == 200
        data = response.json()
        
        # Expected: (10 * 100) + (20 * 50) = 1000 + 1000 = 2000
        assert data["total_value"] == Decimal("2000")
        assert len(data["assets"]) == 2

    def test_valuation_mixed_with_missing_prices(
        self,
        authenticated_client: TestClient,
        test_portfolio: int,
        test_assets: list,
        db: Session,
    ):
        """Test valuation with some assets having prices and others missing."""
        auth_client = authenticated_client

        # Create holdings for all three assets
        for asset_id in test_assets:
            holding_data = {"asset_id": asset_id, "quantity": Decimal("10")}
            auth_client.post(
                f"/portfolios/{test_portfolio}/holdings/", json=holding_data
            )

        # Add price snapshots for only first two assets
        add_price_snapshot(db, test_assets[0], Decimal("100"))
        add_price_snapshot(db, test_assets[1], Decimal("50"))
        # test_assets[2] has no price

        # Get valuation
        response = auth_client.get(f"/portfolios/{test_portfolio}/valuation")

        assert response.status_code == 200
        data = response.json()
        
        # Expected: (10 * 100) + (10 * 50) + 0 = 1500
        assert data["total_value"] == Decimal("1500")
        assert len(data["assets"]) == 3

        # Check that missing price is correctly flagged
        assets_by_id = {a["asset_id"]: a for a in data["assets"]}
        assert assets_by_id[test_assets[0]]["missing_price"] is False
        assert assets_by_id[test_assets[1]]["missing_price"] is False
        assert assets_by_id[test_assets[2]]["missing_price"] is True


class TestPortfolioValuationPriceUpdates:
    """Test valuation with price updates."""

    def test_valuation_uses_latest_price(
        self,
        authenticated_client: TestClient,
        test_portfolio: int,
        test_assets: list,
        db: Session,
    ):
        """Test that valuation uses the latest price snapshot."""
        auth_client = authenticated_client
        asset_id = test_assets[0]

        # Create holding
        holding_data = {"asset_id": asset_id, "quantity": Decimal("10")}
        auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )

        # Add first price snapshot
        add_price_snapshot(db, asset_id, Decimal("100"))

        # Get initial valuation
        response = auth_client.get(f"/portfolios/{test_portfolio}/valuation")
        initial_value = response.json()["total_value"]
        assert initial_value == Decimal("1000")

        # Add newer price snapshot
        add_price_snapshot(db, asset_id, Decimal("150"))

        # Get updated valuation
        response = auth_client.get(f"/portfolios/{test_portfolio}/valuation")
        updated_value = response.json()["total_value"]
        assert updated_value == Decimal("1500")

    def test_valuation_with_price_increase(
        self,
        authenticated_client: TestClient,
        test_portfolio: int,
        test_assets: list,
        db: Session,
    ):
        """Test valuation reflects price increases."""
        auth_client = authenticated_client
        asset_id = test_assets[0]

        # Create holding
        holding_data = {"asset_id": asset_id, "quantity": Decimal("100")}
        auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )

        # Initial price: $10
        add_price_snapshot(db, asset_id, Decimal("10"))
        response = auth_client.get(f"/portfolios/{test_portfolio}/valuation")
        assert response.json()["total_value"] == Decimal("1000")

        # Price increases to $50
        add_price_snapshot(db, asset_id, Decimal("50"))
        response = auth_client.get(f"/portfolios/{test_portfolio}/valuation")
        assert response.json()["total_value"] == Decimal("5000")

    def test_valuation_with_price_decrease(
        self,
        authenticated_client: TestClient,
        test_portfolio: int,
        test_assets: list,
        db: Session,
    ):
        """Test valuation reflects price decreases."""
        auth_client = authenticated_client
        asset_id = test_assets[0]

        # Create holding
        holding_data = {"asset_id": asset_id, "quantity": Decimal("50")}
        auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )

        # Initial price: $200
        add_price_snapshot(db, asset_id, Decimal("200"))
        response = auth_client.get(f"/portfolios/{test_portfolio}/valuation")
        assert response.json()["total_value"] == Decimal("10000")

        # Price decreases to $100
        add_price_snapshot(db, asset_id, Decimal("100"))
        response = auth_client.get(f"/portfolios/{test_portfolio}/valuation")
        assert response.json()["total_value"] == Decimal("5000")


class TestPortfolioValuationAssetData:
    """Test that valuation includes correct asset data."""

    def test_valuation_includes_asset_symbol_and_name(
        self,
        authenticated_client: TestClient,
        test_portfolio: int,
        test_assets: list,
        db: Session,
    ):
        """Test that valuation includes asset symbol and name."""
        auth_client = authenticated_client
        asset_id = test_assets[0]

        # Create holding
        holding_data = {"asset_id": asset_id, "quantity": Decimal("10")}
        auth_client.post(
            f"/portfolios/{test_portfolio}/holdings/", json=holding_data
        )

        # Add price
        add_price_snapshot(db, asset_id, Decimal("100"))

        # Get valuation
        response = auth_client.get(f"/portfolios/{test_portfolio}/valuation")
        data = response.json()

        asset = data["assets"][0]
        assert asset["asset_id"] == asset_id
        assert asset["symbol"] == "TEST0"
        assert asset["name"] == "Test Asset 0"


class TestPortfolioValuationUserIsolation:
    """Test user isolation for valuations."""

    def test_valuation_user_isolation(self, client: TestClient, db: Session):
        """Test that users cannot access other users' portfolio valuations."""
        # Create user 1
        user1_data = {"email": "user1@test.com", "password": "password123"}
        client.post("/auth/register", json=user1_data)
        response1 = client.post(
            "/auth/login",
            data={"username": user1_data["email"], "password": user1_data["password"]},
        )
        token1 = response1.json()["access_token"]

        headers1 = {"Authorization": f"Bearer {token1}"}

        # User 1 creates portfolio and asset
        response = client.post(
            "/portfolios/", json={"name": "User1 Portfolio"}, headers=headers1
        )
        portfolio_id = response.json()["id"]

        response = client.post(
            "/assets/",
            json={"symbol": "TEST", "name": "Test Asset"},
            headers=headers1,
        )
        asset_id = response.json()["id"]

        # Create holding
        client.post(
            f"/portfolios/{portfolio_id}/holdings/",
            json={"asset_id": asset_id, "quantity": Decimal("10")},
            headers=headers1,
        )

        # Add price snapshot
        add_price_snapshot(db, asset_id, Decimal("100"))

        # Create user 2
        user2_data = {"email": "user2@test.com", "password": "password123"}
        client.post("/auth/register", json=user2_data)
        response2 = client.post(
            "/auth/login",
            data={"username": user2_data["email"], "password": user2_data["password"]},
        )
        token2 = response2.json()["access_token"]

        headers2 = {"Authorization": f"Bearer {token2}"}

        # User 2 tries to get valuation
        response = client.get(
            f"/portfolios/{portfolio_id}/valuation", headers=headers2
        )

        assert response.status_code == 404
