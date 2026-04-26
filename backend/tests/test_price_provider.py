import pytest

from backend.services.price_provider import (
    get_latest_price,
    InvalidSymbolError,
    PriceProviderError,
)
from backend.core.config import settings


class DummyResponse:
    def __init__(self, payload):
        self._payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self._payload


def test_get_latest_price_raises_when_no_provider_configured(monkeypatch):
    monkeypatch.setattr(settings, "price_provider", None)
    monkeypatch.setattr(settings, "price_provider_api_key", None)

    with pytest.raises(PriceProviderError, match="No price provider configured"):
        get_latest_price("AAPL")


def test_get_latest_price_raises_on_alpha_vantage_invalid_symbol_response(monkeypatch):
    monkeypatch.setattr(settings, "price_provider", "alpha_vantage")
    monkeypatch.setattr(settings, "price_provider_api_key", "fake-key")

    def fake_get(*args, **kwargs):
        # GLOBAL_QUOTE returns empty → triggers crypto fallback.
        # CURRENCY_EXCHANGE_RATE also returns empty → InvalidSymbolError.
        params = kwargs.get("params", {})
        if params.get("function") == "CURRENCY_EXCHANGE_RATE":
            return DummyResponse({"Realtime Currency Exchange Rate": {}})
        return DummyResponse({"Global Quote": {}})

    monkeypatch.setattr("backend.services.price_provider.requests.get", fake_get)

    with pytest.raises(InvalidSymbolError, match="No exchange rate returned for symbol"):
        get_latest_price("INVALID")
