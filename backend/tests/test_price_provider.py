import pytest
from decimal import Decimal
from unittest.mock import MagicMock

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


# --- yfinance provider tests ---

def _make_ticker_mock(last_price):
    ticker = MagicMock()
    ticker.fast_info.last_price = last_price
    return ticker


def test_yfinance_returns_stock_price(monkeypatch):
    monkeypatch.setattr(settings, "price_provider", "yfinance")

    def fake_ticker(sym):
        assert sym == "AAPL"
        return _make_ticker_mock(182.50)

    monkeypatch.setattr("backend.services.price_provider.yf.Ticker", fake_ticker)

    price = get_latest_price("AAPL")
    assert price == Decimal("182.5")


def test_yfinance_falls_back_to_crypto_suffix(monkeypatch):
    monkeypatch.setattr(settings, "price_provider", "yfinance")
    call_order = []

    def fake_ticker(sym):
        call_order.append(sym)
        # Plain "BTC" returns no price; "BTC-USD" returns a real price.
        return _make_ticker_mock(None if sym == "BTC" else 67000.0)

    monkeypatch.setattr("backend.services.price_provider.yf.Ticker", fake_ticker)

    price = get_latest_price("BTC")
    assert price == Decimal("67000.0")
    assert call_order == ["BTC", "BTC-USD"]


def test_yfinance_raises_invalid_symbol_when_both_lookups_fail(monkeypatch):
    monkeypatch.setattr(settings, "price_provider", "yfinance")

    monkeypatch.setattr(
        "backend.services.price_provider.yf.Ticker",
        lambda sym: _make_ticker_mock(None),
    )

    with pytest.raises(InvalidSymbolError, match="Symbol not found"):
        get_latest_price("NOTREAL")
