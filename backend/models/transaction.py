from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, func
from sqlalchemy.orm import relationship

from .base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    holding_id = Column(Integer, ForeignKey("holdings.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(20), nullable=False)  # e.g., 'buy' or 'sell'
    quantity = Column(Numeric(20, 8), nullable=False)
    price = Column(Numeric(30, 12), nullable=False)
    fees = Column(Numeric(30, 12), nullable=True, default=0)
    executed_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    holding = relationship("Holding", back_populates="transactions")
