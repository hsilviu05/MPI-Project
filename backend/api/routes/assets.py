from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...api import deps
from ...db import get_db
from ...models.asset import Asset
from ...schemas.asset import AssetCreate, AssetRead
from ...services.price_provider import get_latest_price, PriceProviderError, InvalidSymbolError
from ...models.price_snapshot import PriceSnapshot
from ...core.config import settings
from datetime import datetime, timezone

router = APIRouter()

@router.post("/", response_model=AssetRead, status_code=status.HTTP_201_CREATED)
def create_asset(
    asset_in: AssetCreate,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Add a new asset (e.g., stock or crypto)
    """
    existing_asset = db.query(Asset).filter(Asset.symbol == asset_in.symbol).first()
    if existing_asset:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Asset with this symbol already exists"
        )
    
    asset = Asset(**asset_in.dict())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


@router.get("/", response_model=List[AssetRead])
def list_assets(
    symbol: Optional[str] = Query(None, description="Filter by asset symbol"),
    asset_type: Optional[str] = Query(None, description="Filter by asset type (e.g., stock or crypto)"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    List and filter supported assets
    """
    query = db.query(Asset)
    
    if symbol:
        query = query.filter(Asset.symbol.ilike(f"%{symbol}%"))
    if asset_type:
        query = query.filter(Asset.asset_type.ilike(f"%{asset_type}%"))
        
    assets = query.offset(skip).limit(limit).all()
    return assets


@router.get("/price/{symbol}")
def get_price(
    symbol: str,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user),
):
    """Fetch latest market price for a symbol from configured provider.

    If an `Asset` with the given symbol exists in the DB, persist a
    `PriceSnapshot` record on successful fetch. Do not persist on errors.
    """
    try:
        price = get_latest_price(symbol)
    except InvalidSymbolError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid or unknown symbol")
    except PriceProviderError:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Price provider unavailable")

    # Persist snapshot only when asset exists locally
    asset = db.query(Asset).filter(Asset.symbol.ilike(symbol)).first()
    if asset:
        snapshot = PriceSnapshot(
            asset_id=asset.id,
            timestamp=datetime.now(timezone.utc),
            price=price,
            source=(settings.price_provider or None),
        )
        db.add(snapshot)
        db.commit()
        db.refresh(snapshot)

    return {"symbol": symbol.upper(), "price": str(price)}
