from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship

from .base import Base


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(64), nullable=False, index=True)
    name = Column(String(255), nullable=True)
    asset_type = Column(String(50), nullable=True)
    currency = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    holdings = relationship("Holding", back_populates="asset")
    price_snapshots = relationship("PriceSnapshot", back_populates="asset", cascade="all, delete-orphan")
