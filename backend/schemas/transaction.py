from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator, ConfigDict


ALLOWED_TRANSACTION_TYPES = {"buy", "sell"}


class TransactionCreate(BaseModel):
    type: str
    quantity: Decimal = Field(..., gt=0)
    price: Decimal = Field(..., gt=0)
    fees: Optional[Decimal] = Field(Decimal("0"), ge=0)
    executed_at: Optional[datetime] = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v_lower = v.strip().lower()
        if v_lower not in ALLOWED_TRANSACTION_TYPES:
            raise ValueError(f"type must be one of {ALLOWED_TRANSACTION_TYPES}")
        return v_lower


class TransactionUpdate(BaseModel):
    type: Optional[str] = None
    quantity: Optional[Decimal] = Field(None, gt=0)
    price: Optional[Decimal] = Field(None, gt=0)
    fees: Optional[Decimal] = Field(None, ge=0)
    executed_at: Optional[datetime] = None

    @field_validator("type", mode="before")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v_lower = v.strip().lower()
        if v_lower not in ALLOWED_TRANSACTION_TYPES:
            raise ValueError(f"type must be one of {ALLOWED_TRANSACTION_TYPES}")
        return v_lower


class TransactionRead(BaseModel):
    id: int
    holding_id: int
    type: str
    quantity: Decimal
    price: Decimal
    fees: Optional[Decimal]
    executed_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
