from datetime import datetime
from decimal import Decimal
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from backend.schemas.holding import HoldingRead


class PortfolioCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class PortfolioUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None

class RefreshResult(BaseModel):
    asset_id: int
    symbol: Optional[str]
    status: str  # "success", "failed", "missing_symbol", "provider_error"
    price: Optional[Decimal]
    timestamp: Optional[datetime]
    message: Optional[str]


class PortfolioRefreshResponse(BaseModel):
    portfolio_id: int
    results: List[RefreshResult]

class PortfolioRead(BaseModel):
    id: int
    name: str
    description: Optional[str]
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PortfolioDetailRead(PortfolioRead):
    holdings: List[HoldingRead] = []


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


class PortfolioRefreshResult(BaseModel):
    asset_id: int
    symbol: Optional[str]
    status: Literal["success", "failed", "missing_symbol", "provider_error"]
    price: Optional[Decimal]
    timestamp: Optional[datetime]
    message: Optional[str] = None


class PortfolioRefreshResponse(BaseModel):
    portfolio_id: int
    results: List[PortfolioRefreshResult]
