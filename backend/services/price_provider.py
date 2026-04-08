from decimal import Decimal
import requests
from typing import Optional

from ..core.config import settings


class PriceProviderError(Exception):
    pass


class InvalidSymbolError(PriceProviderError):
    pass


def _fetch_alpha_vantage(symbol: str, api_key: str, timeout: int = 5) -> Decimal:
    url = "https://www.alphavantage.co/query"
    params = {"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": api_key}
    try:
        resp = requests.get(url, params=params, timeout=timeout)
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as exc:
        raise PriceProviderError(f"AlphaVantage request failed: {exc}") from exc

    # Alpha Vantage can return keys like 'Note', 'Error Message' or 'Information'
    # when the service is unavailable, rate-limited, or the request is malformed.
    # Treat these as provider failures rather than an invalid symbol.
    if isinstance(data, dict) and any(k in data for k in ("Note", "Error Message", "Information")):
        msg = data.get("Note") or data.get("Error Message") or data.get("Information")
        raise PriceProviderError(f"AlphaVantage error: {msg}")

    quote = data.get("Global Quote")
    # If the provider returns an empty quote object, treat as invalid symbol
    if not quote or not isinstance(quote, dict) or not any(quote.values()):
        raise InvalidSymbolError(f"No quote returned for symbol: {symbol}")

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
