"""Integration tests for asset management and price lookup."""

from decimal import Decimal

import pytest
from fastapi.testclient import TestClient

from backend.api.routes.assets import InvalidSymbolError, PriceProviderError


class TestAssetManagement:
    """Test asset creation and listing."""

    def test_create_asset_success(self, authenticated_client: TestClient):
        asset_data = {
            "symbol": "TESTSYM",
            "name": "Test Symbol Asset",
            "asset_type": "stock",
        }
        response = authenticated_client.post("/assets/", json=asset_data)

        assert response.status_code == 201
        data = response.json()
        assert data["symbol"] == "TESTSYM"
        assert data["name"] == "Test Symbol Asset"
        assert data["asset_type"] == "stock"
        assert "id" in data

    def test_create_asset_duplicate_symbol(self, authenticated_client: TestClient):
        asset_data = {
            "symbol": "DUPSYM",
            "name": "Duplicate Symbol Asset",
            "asset_type": "stock",
        }
        response = authenticated_client.post("/assets/", json=asset_data)
        assert response.status_code == 201

        duplicate_response = authenticated_client.post("/assets/", json=asset_data)
        assert duplicate_response.status_code == 400
        assert "already exists" in duplicate_response.json()["detail"]

    def test_list_assets_filters_by_symbol(self, authenticated_client: TestClient):
        assets = [
            {"symbol": "FOO", "name": "Foo Asset", "asset_type": "stock"},
            {"symbol": "BAR", "name": "Bar Asset", "asset_type": "crypto"},
        ]
        for asset in assets:
            authenticated_client.post("/assets/", json=asset)

        response = authenticated_client.get("/assets/?symbol=FOO")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["symbol"] == "FOO"

    def test_get_assets_without_auth(self, client: TestClient):
        response = client.get("/assets/")
        assert response.status_code == 401


class TestAssetPriceLookup:
    """Test asset price endpoint behavior."""

    def test_get_price_valid_symbol(self, authenticated_client: TestClient, monkeypatch):
        def fake_get_latest_price(symbol: str) -> Decimal:
            assert symbol == "AAPL"
            return Decimal("123.45")

        monkeypatch.setattr(
            "backend.api.routes.assets.get_latest_price",
            fake_get_latest_price,
        )

        response = authenticated_client.get("/assets/price/AAPL")
        assert response.status_code == 200
        assert response.json() == {"symbol": "AAPL", "price": "123.45"}

    def test_get_price_invalid_symbol(self, authenticated_client: TestClient, monkeypatch):
        def fake_get_latest_price(symbol: str):
            raise InvalidSymbolError("No quote returned for symbol")

        monkeypatch.setattr(
            "backend.api.routes.assets.get_latest_price",
            fake_get_latest_price,
        )

        response = authenticated_client.get("/assets/price/INVALID")
        assert response.status_code == 404
        assert response.json()["detail"] == "Invalid or unknown symbol"

    def test_get_price_provider_unavailable(self, authenticated_client: TestClient, monkeypatch):
        def fake_get_latest_price(symbol: str):
            raise PriceProviderError("Provider unavailable")

        monkeypatch.setattr(
            "backend.api.routes.assets.get_latest_price",
            fake_get_latest_price,
        )

        response = authenticated_client.get("/assets/price/AAPL")
        assert response.status_code == 503
        assert response.json()["detail"] == "Price provider unavailable"

    def test_get_price_without_auth(self, client: TestClient):
        response = client.get("/assets/price/AAPL")
        assert response.status_code == 401
