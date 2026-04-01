from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AssetCreate(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=64)
    name: Optional[str] = Field(None, max_length=255)
    asset_type: Optional[str] = Field(None, max_length=50)
    currency: Optional[str] = Field(None, max_length=10)


class AssetUpdate(BaseModel):
    symbol: Optional[str] = Field(None, min_length=1, max_length=64)
    name: Optional[str] = Field(None, max_length=255)
    asset_type: Optional[str] = Field(None, max_length=50)
    currency: Optional[str] = Field(None, max_length=10)


class AssetRead(BaseModel):
    id: int
    symbol: str
    name: Optional[str]
    asset_type: Optional[str]
    currency: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
