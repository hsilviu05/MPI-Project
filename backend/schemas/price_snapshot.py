from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict, ConfigDict


class PriceSnapshotCreate(BaseModel):
    asset_id: int
    timestamp: datetime
    price: Decimal = Field(..., gt=0)
    source: Optional[str] = Field(None, max_length=255)


class PriceSnapshotUpdate(BaseModel):
    timestamp: Optional[datetime] = None
    price: Optional[Decimal] = Field(None, gt=0)
    source: Optional[str] = Field(None, max_length=255)


class PriceSnapshotRead(BaseModel):
    id: int
    asset_id: int
    timestamp: datetime
    price: Decimal
    source: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
