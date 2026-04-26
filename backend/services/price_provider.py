from decimal import Decimal
import requests
from typing import Optional

from ..core.config import settings


class PriceProviderError(Exception):
    pass


class InvalidSymbolError(PriceProviderError):
    pass


def _check_alpha_vantage_errors(data: dict, symbol: str) -> None:
    """Raise PriceProviderError for rate-limit / service-error responses."""
    if any(k in data for k in ("Note", "Error Message", "Information")):
        msg = data.get("Note") or data.get("Error Message") or data.get("Information")
        raise PriceProviderError(f"AlphaVantage error for {symbol}: {msg}")


def _fetch_alpha_vantage_crypto(symbol: str, api_key: str, timeout: int = 5) -> Decimal:
    """Fetch price via CURRENCY_EXCHANGE_RATE — used as fallback for crypto tickers."""
    url = "https://www.alphavantage.co/query"
    params = {
        "function": "CURRENCY_EXCHANGE_RATE",
        "from_currency": symbol,
        "to_currency": "USD",
        "apikey": api_key,
    }
    try:
        resp = requests.get(url, params=params, timeout=timeout)
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as exc:
        raise PriceProviderError(f"AlphaVantage request failed: {exc}") from exc

    _check_alpha_vantage_errors(data, symbol)

    rate_data = data.get("Realtime Currency Exchange Rate")
    if not rate_data or not isinstance(rate_data, dict):
        raise InvalidSymbolError(f"No exchange rate returned for symbol: {symbol}")

    price_str = rate_data.get("5. Exchange Rate")
    if not price_str:
        raise InvalidSymbolError(f"No exchange rate field for symbol: {symbol}")

    try:
        return Decimal(price_str)
    except Exception as exc:
        raise PriceProviderError(f"Unable to parse price for symbol {symbol}: {exc}") from exc


def _fetch_alpha_vantage(symbol: str, api_key: str, timeout: int = 5) -> Decimal:
    url = "https://www.alphavantage.co/query"
    params = {"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": api_key}
    try:
        resp = requests.get(url, params=params, timeout=timeout)
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as exc:
        raise PriceProviderError(f"AlphaVantage request failed: {exc}") from exc

    # Rate-limit / service error keys — raise before trying crypto fallback.
    _check_alpha_vantage_errors(data, symbol)

    quote = data.get("Global Quote")
    # Empty quote means the symbol isn't a stock/ETF — try the crypto endpoint.
    if not quote or not isinstance(quote, dict) or not any(quote.values()):
        return _fetch_alpha_vantage_crypto(symbol, api_key, timeout)

    price_str = quote.get("05. price")
    if not price_str:
        raise InvalidSymbolError(f"No price field for symbol: {symbol}")

    try:
        return Decimal(price_str)
    except Exception as exc:
        raise PriceProviderError(f"Unable to parse price for symbol {symbol}: {exc}") from exc


def get_latest_price(symbol: str, provider: Optional[str] = None) -> Decimal:
    """Get the latest market price for `symbol` from configured provider.

    Raises:
        InvalidSymbolError: when the symbol is invalid or not found
        PriceProviderError: when the provider request fails or parsing fails
    """
    provider = provider or settings.price_provider
    api_key = settings.price_provider_api_key

    if not provider:
        raise PriceProviderError("No price provider configured (PRICE_PROVIDER)")

    provider = provider.lower()
    if provider == "alpha_vantage":
        if not api_key:
            raise PriceProviderError("Missing API key for Alpha Vantage (PRICE_PROVIDER_API_KEY)")
        return _fetch_alpha_vantage(symbol, api_key)

    raise PriceProviderError(f"Unsupported price provider: {provider}")
