"""
Seed script: creates a demo user, assets, portfolios, holdings, transactions,
and injects realistic price snapshots directly into the DB.
Usage: python backend/seed_data.py [--base-url http://localhost:8000]
"""

import argparse
import sys
import os
import requests
from datetime import datetime, timezone

BASE_URL = "http://localhost:8000"

DEMO_USER = {
    "email": "demo@example.com",
    "password": "DemoPass123",
}

# Realistic reference prices (USD)
ASSET_PRICES = {
    "AAPL": "213.49",
    "MSFT": "415.30",
    "GOOGL": "175.82",
    "AMZN": "198.60",
    "NVDA": "875.40",
    "BTC":  "64200.00",
    "ETH":  "3450.00",
    "SPY":  "524.75",
    "QQQ":  "447.90",
    "TSLA": "248.50",
}

ASSETS = [
    {"symbol": "AAPL", "name": "Apple Inc.", "asset_type": "stock", "currency": "USD"},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "asset_type": "stock", "currency": "USD"},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "asset_type": "stock", "currency": "USD"},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "asset_type": "stock", "currency": "USD"},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "asset_type": "stock", "currency": "USD"},
    {"symbol": "BTC", "name": "Bitcoin", "asset_type": "crypto", "currency": "USD"},
    {"symbol": "ETH", "name": "Ethereum", "asset_type": "crypto", "currency": "USD"},
    {"symbol": "SPY", "name": "SPDR S&P 500 ETF", "asset_type": "etf", "currency": "USD"},
    {"symbol": "QQQ", "name": "Invesco QQQ Trust", "asset_type": "etf", "currency": "USD"},
    {"symbol": "TSLA", "name": "Tesla Inc.", "asset_type": "stock", "currency": "USD"},
]

PORTFOLIOS = [
    {
        "name": "Tech Growth",
        "description": "High-growth technology stocks and ETFs",
        "holdings": [
            {"symbol": "AAPL", "quantity": "25", "avg_cost": "172.50",
             "transactions": [
                 {"type": "buy", "quantity": "10", "price": "165.00", "fees": "1.50"},
                 {"type": "buy", "quantity": "15", "price": "178.00", "fees": "1.50"},
             ]},
            {"symbol": "MSFT", "quantity": "15", "avg_cost": "380.00",
             "transactions": [
                 {"type": "buy", "quantity": "15", "price": "380.00", "fees": "1.50"},
             ]},
            {"symbol": "NVDA", "quantity": "10", "avg_cost": "820.00",
             "transactions": [
                 {"type": "buy", "quantity": "12", "price": "790.00", "fees": "2.00"},
                 {"type": "sell", "quantity": "2", "price": "870.00", "fees": "2.00"},
             ]},
            {"symbol": "QQQ", "quantity": "20", "avg_cost": "430.00",
             "transactions": [
                 {"type": "buy", "quantity": "20", "price": "430.00", "fees": "1.00"},
             ]},
        ],
    },
    {
        "name": "Crypto Exposure",
        "description": "Cryptocurrency positions — higher risk, higher reward",
        "holdings": [
            {"symbol": "BTC", "quantity": "0.5", "avg_cost": "58000.00",
             "transactions": [
                 {"type": "buy", "quantity": "0.3", "price": "55000.00", "fees": "25.00"},
                 {"type": "buy", "quantity": "0.2", "price": "62500.00", "fees": "20.00"},
             ]},
            {"symbol": "ETH", "quantity": "4", "avg_cost": "3100.00",
             "transactions": [
                 {"type": "buy", "quantity": "5", "price": "3000.00", "fees": "10.00"},
                 {"type": "sell", "quantity": "1", "price": "3500.00", "fees": "10.00"},
             ]},
        ],
    },
    {
        "name": "Diversified Core",
        "description": "Balanced mix of large-cap stocks and ETFs",
        "holdings": [
            {"symbol": "SPY", "quantity": "30", "avg_cost": "510.00",
             "transactions": [
                 {"type": "buy", "quantity": "30", "price": "510.00", "fees": "1.00"},
             ]},
            {"symbol": "GOOGL", "quantity": "8", "avg_cost": "170.00",
             "transactions": [
                 {"type": "buy", "quantity": "8", "price": "170.00", "fees": "1.50"},
             ]},
            {"symbol": "AMZN", "quantity": "12", "avg_cost": "192.00",
             "transactions": [
                 {"type": "buy", "quantity": "12", "price": "192.00", "fees": "1.50"},
             ]},
            {"symbol": "TSLA", "quantity": "18", "avg_cost": "215.00",
             "transactions": [
                 {"type": "buy", "quantity": "20", "price": "205.00", "fees": "2.00"},
                 {"type": "sell", "quantity": "2", "price": "250.00", "fees": "2.00"},
             ]},
        ],
    },
]


def post(session, url, payload, desc):
    r = session.post(url, json=payload)
    if r.status_code not in (200, 201):
        print(f"  ERROR {desc}: {r.status_code} {r.text[:200]}")
        return None
    return r.json()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default=BASE_URL)
    args = parser.parse_args()
    base = args.base_url.rstrip("/")

    s = requests.Session()

    # ── Register / login ──────────────────────────────────────────────────────
    print("=== Auth ===")
    reg = s.post(f"{base}/auth/register", json=DEMO_USER)
    if reg.status_code == 400:
        print(f"  User already exists, logging in...")
    elif reg.status_code == 201:
        print(f"  Registered {DEMO_USER['email']}")
    else:
        print(f"  Register failed: {reg.status_code} {reg.text[:200]}")
        sys.exit(1)

    login = s.post(
        f"{base}/auth/login",
        data={"username": DEMO_USER["email"], "password": DEMO_USER["password"]},
    )
    if login.status_code != 200:
        print(f"  Login failed: {login.status_code} {login.text[:200]}")
        sys.exit(1)

    token = login.json()["access_token"]
    s.headers["Authorization"] = f"Bearer {token}"
    print(f"  Logged in OK\n")

    # ── Assets ────────────────────────────────────────────────────────────────
    print("=== Assets ===")
    symbol_to_id = {}

    # Fetch all existing assets first
    existing_r = s.get(f"{base}/assets/")
    if existing_r.status_code == 200:
        for a in existing_r.json():
            symbol_to_id[a["symbol"]] = a["id"]

    for a in ASSETS:
        if a["symbol"] in symbol_to_id:
            print(f"  Asset {a['symbol']} already exists (id={symbol_to_id[a['symbol']]})")
            continue
        result = post(s, f"{base}/assets/", a, f"asset {a['symbol']}")
        if result:
            symbol_to_id[a["symbol"]] = result["id"]
            print(f"  Created asset {a['symbol']} (id={result['id']})")

    # ── Portfolios + Holdings + Transactions ──────────────────────────────────
    print()
    for p in PORTFOLIOS:
        print(f"=== Portfolio: {p['name']} ===")
        portfolio = post(
            s,
            f"{base}/portfolios/",
            {"name": p["name"], "description": p["description"]},
            f"portfolio {p['name']}",
        )
        if not portfolio:
            continue
        pid = portfolio["id"]
        print(f"  Created portfolio id={pid}")

        for h in p["holdings"]:
            symbol = h["symbol"]
            asset_id = symbol_to_id.get(symbol)
            if not asset_id:
                print(f"  SKIP holding {symbol}: asset not found")
                continue

            holding = post(
                s,
                f"{base}/portfolios/{pid}/holdings/",
                {"asset_id": asset_id, "quantity": h["quantity"], "avg_cost": h["avg_cost"]},
                f"holding {symbol}",
            )
            if not holding:
                continue
            hid = holding["id"]
            print(f"  Holding {symbol} id={hid}")

            for tx in h.get("transactions", []):
                result = post(
                    s,
                    f"{base}/portfolios/{pid}/holdings/{hid}/transactions/",
                    {
                        "type": tx["type"],
                        "quantity": tx["quantity"],
                        "price": tx["price"],
                        "fees": tx.get("fees", "0"),
                    },
                    f"tx {tx['type']} {symbol}",
                )
                if result:
                    print(f"    tx {tx['type']} {tx['quantity']} @ {tx['price']}")
        print()

    print("Done! Seed data loaded.")

    # ── Price snapshots (direct DB insert) ────────────────────────────────────
    print("\n=== Price Snapshots ===")
    _seed_prices(symbol_to_id)


def _seed_prices(symbol_to_id: dict) -> None:
    """Insert price snapshots directly via SQLAlchemy (bypasses the API)."""
    # Add project root to sys.path so backend package is importable
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)

    import backend.db as _db
    from backend.models.price_snapshot import PriceSnapshot

    _db.init_db()
    if _db.SessionLocal is None:
        print("  ERROR: DB not available (DATABASE_URL not set?)")
        return

    db = _db.SessionLocal()
    now = datetime.now(timezone.utc)
    try:
        for symbol, price_str in ASSET_PRICES.items():
            asset_id = symbol_to_id.get(symbol)
            if not asset_id:
                print(f"  SKIP {symbol}: not in asset map")
                continue
            # Remove any existing snapshot for this asset so we get a clean latest
            existing = db.query(PriceSnapshot).filter(
                PriceSnapshot.asset_id == asset_id
            ).first()
            snap = PriceSnapshot(
                asset_id=asset_id,
                timestamp=now,
                price=price_str,
                source="seed",
            )
            db.add(snap)
            print(f"  {symbol}: ${price_str}")
        db.commit()
        print("  Price snapshots committed.")
    except Exception as exc:
        db.rollback()
        print(f"  ERROR inserting snapshots: {exc}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
