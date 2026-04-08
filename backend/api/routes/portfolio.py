from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from decimal import Decimal

from ...db import get_db
from ...models.user import User
from ...models.portfolio import Portfolio
from ...models.price_snapshot import PriceSnapshot
from ...schemas.portfolio import (
    PortfolioCreate,
    PortfolioRead,
    PortfolioUpdate,
    PortfolioDetailRead,
    PortfolioValuationRead,
)
from ..deps import get_current_user

router = APIRouter()

@router.post("/", response_model=PortfolioRead, status_code=status.HTTP_201_CREATED)
def create_portfolio(
    *,
    db: Session = Depends(get_db),
    portfolio_in: PortfolioCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new portfolio.
    """
    portfolio = Portfolio(
        name=portfolio_in.name,
        description=portfolio_in.description,
        owner_id=current_user.id
    )
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio

@router.get("/", response_model=List[PortfolioRead])
def read_portfolios(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve portfolios for the current user.
    """
    portfolios = db.query(Portfolio).filter(Portfolio.owner_id == current_user.id).offset(skip).limit(limit).all()
    return portfolios

@router.get("/{portfolio_id}", response_model=PortfolioDetailRead)
def read_portfolio(
    *,
    db: Session = Depends(get_db),
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get portfolio by ID.
    """
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id, Portfolio.owner_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio

@router.put("/{portfolio_id}", response_model=PortfolioRead)
def update_portfolio(
    *,
    db: Session = Depends(get_db),
    portfolio_id: int,
    portfolio_in: PortfolioUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a portfolio.
    """
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id, Portfolio.owner_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    update_data = portfolio_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(portfolio, field, value)
        
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio

@router.delete("/{portfolio_id}", response_model=PortfolioRead)
def delete_portfolio(
    *,
    db: Session = Depends(get_db),
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a portfolio.
    """
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id, Portfolio.owner_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    db.delete(portfolio)
    db.commit()
    return portfolio


@router.get("/{portfolio_id}/valuation", response_model=PortfolioValuationRead)
def portfolio_valuation(
    *,
    db: Session = Depends(get_db),
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Return portfolio valuation: total and per-asset breakdown.
    Missing prices are reported with `missing_price=True` and `price`/`value` as null.
    """
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id, Portfolio.owner_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    total_value = Decimal("0")
    assets: List[Dict[str, Any]] = []

    for holding in portfolio.holdings:
        qty: Decimal = holding.quantity

        # get latest price snapshot for the asset
        latest = (
            db.query(PriceSnapshot)
            .filter(PriceSnapshot.asset_id == holding.asset_id)
            .order_by(PriceSnapshot.timestamp.desc())
            .first()
        )

        if latest is None:
            assets.append(
                {
                    "asset_id": holding.asset_id,
                    "symbol": getattr(holding.asset, "symbol", None),
                    "name": getattr(holding.asset, "name", None),
                    "quantity": qty,
                    "price": None,
                    "value": None,
                    "missing_price": True,
                }
            )
            continue

        price: Decimal = latest.price
        value = price * qty
        total_value += value

        assets.append(
            {
                "asset_id": holding.asset_id,
                "symbol": getattr(holding.asset, "symbol", None),
                "name": getattr(holding.asset, "name", None),
                "quantity": qty,
                "price": price,
                "value": value,
                "missing_price": False,
            }
        )

    return {"portfolio_id": portfolio.id, "total_value": total_value, "assets": assets}
