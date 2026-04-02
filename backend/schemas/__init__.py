from .user import UserCreate, UserUpdate, UserRead
from .token import Token, TokenPayload
from .portfolio import PortfolioCreate, PortfolioUpdate, PortfolioRead, PortfolioDetailRead
from .asset import AssetCreate, AssetUpdate, AssetRead
from .holding import HoldingCreate, HoldingUpdate, HoldingRead, HoldingDetailRead
from .transaction import TransactionCreate, TransactionUpdate, TransactionRead
from .price_snapshot import PriceSnapshotCreate, PriceSnapshotUpdate, PriceSnapshotRead

# Resolve forward references for nested schemas
PortfolioDetailRead.update_forward_refs(HoldingRead=HoldingRead)
HoldingDetailRead.update_forward_refs(TransactionRead=TransactionRead)

__all__ = [
    # User
    "UserCreate",
    "UserUpdate",
    "UserRead",
    # Portfolio
    "PortfolioCreate",
    "PortfolioUpdate",
    "PortfolioRead",
    "PortfolioDetailRead",
    # Asset
    "AssetCreate",
    "AssetUpdate",
    "AssetRead",
    # Holding
    "HoldingCreate",
    "HoldingUpdate",
    "HoldingRead",
    "HoldingDetailRead",
    # Transaction
    "TransactionCreate",
    "TransactionUpdate",
    "TransactionRead",
    # PriceSnapshot
    "PriceSnapshotCreate",
    "PriceSnapshotUpdate",
    "PriceSnapshotRead",
    # Token
    "Token",
    "TokenPayload",
]
