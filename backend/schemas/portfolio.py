from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field
from decimal import Decimal


class PortfolioCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class PortfolioUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class PortfolioRead(BaseModel):
    id: int
    name: str
    description: Optional[str]
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class PortfolioDetailRead(PortfolioRead):
    holdings: List["HoldingRead"] = []


class ValuationAsset(BaseModel):
    asset_id: int
    symbol: Optional[str]
    name: Optional[str]
    quantity: Decimal
    price: Optional[Decimal]
    value: Optional[Decimal]
    missing_price: bool = False


class PortfolioValuationRead(BaseModel):
    portfolio_id: int
    total_value: Decimal
    assets: List[ValuationAsset]

    class Config:
        orm_mode = False


class RefreshAssetStatus(BaseModel):
    asset_id: int
    symbol: Optional[str]
    status: str  # success, failed, missing_symbol, provider_error
    price: Optional[Decimal] = None
    timestamp: Optional[datetime] = None
    message: Optional[str] = None


class PortfolioRefreshResponse(BaseModel):
    portfolio_id: int
    results: List[RefreshAssetStatus]

    class Config:
        orm_mode = False
