from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...db import get_db
from ...models.holding import Holding
from ...models.portfolio import Portfolio
from ...models.asset import Asset
from ...models.user import User
from ...schemas.holding import HoldingCreate, HoldingRead, HoldingUpdate
from ..deps import get_current_user

router = APIRouter()


@router.post("/", response_model=HoldingRead, status_code=status.HTTP_201_CREATED)
def create_holding(
    *,
    portfolio_id: int,
    holding_in: HoldingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new holding under a portfolio owned by the current user.
    """
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id, Portfolio.owner_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    asset = db.query(Asset).filter(Asset.id == holding_in.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    holding = Holding(
        portfolio_id=portfolio_id,
        asset_id=holding_in.asset_id,
        quantity=holding_in.quantity,
        avg_cost=holding_in.avg_cost,
    )
    db.add(holding)
    db.commit()
    db.refresh(holding)
    return holding


@router.get("/", response_model=List[HoldingRead])
def list_holdings(
    *,
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    List holdings for a given portfolio (owner only).
    """
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id, Portfolio.owner_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio_id).all()
    return holdings


@router.put("/{holding_id}", response_model=HoldingRead)
def update_holding(
    *,
    portfolio_id: int,
    holding_id: int,
    holding_in: HoldingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a holding. Only portfolio owner may update.
    """
    holding = db.query(Holding).filter(Holding.id == holding_id, Holding.portfolio_id == portfolio_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")

    if holding.portfolio.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this holding")

    update_data = holding_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(holding, field, value)

    db.add(holding)
    db.commit()
    db.refresh(holding)
    return holding


@router.delete("/{holding_id}", response_model=HoldingRead)
def delete_holding(
    *,
    portfolio_id: int,
    holding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a holding. Only portfolio owner may delete.
    """
    holding = db.query(Holding).filter(Holding.id == holding_id, Holding.portfolio_id == portfolio_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")

    if holding.portfolio.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this holding")

    db.delete(holding)
    db.commit()
    return holding
