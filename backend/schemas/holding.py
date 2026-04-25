from datetime import datetime
from decimal import Decimal
from typing import Optional, List

from pydantic import BaseModel, Field, ConfigDict


class HoldingCreate(BaseModel):
    asset_id: int
    quantity: Decimal = Field(..., ge=0)
    avg_cost: Optional[Decimal] = Field(None, ge=0)


class HoldingUpdate(BaseModel):
    quantity: Optional[Decimal] = Field(None, ge=0)
    avg_cost: Optional[Decimal] = Field(None, ge=0)


class HoldingRead(BaseModel):
    id: int
    portfolio_id: int
    asset_id: int
    quantity: Decimal
    avg_cost: Optional[Decimal]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HoldingDetailRead(HoldingRead):
    transactions: List["TransactionRead"] = []
