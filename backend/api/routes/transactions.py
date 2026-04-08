from typing import Any, List
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...db import get_db
from ...models.user import User
from ...models.portfolio import Portfolio
from ...models.holding import Holding
from ...models.transaction import Transaction
from ...schemas.transaction import TransactionCreate, TransactionRead
from ..deps import get_current_user

router = APIRouter()


@router.post("/", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction(
    *,
    portfolio_id: int,
    holding_id: int,
    transaction_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a buy or sell transaction and update the holding accordingly.
    """
    # validate portfolio and ownership
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id, Portfolio.owner_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    holding = db.query(Holding).filter(Holding.id == holding_id, Holding.portfolio_id == portfolio_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")

    tx_type = transaction_in.type
    qty: Decimal = transaction_in.quantity
    price: Decimal = transaction_in.price
    fees: Decimal = transaction_in.fees or Decimal("0")

    if tx_type == "buy":
        # compute new average cost
        old_qty = holding.quantity or Decimal("0")
        old_avg = holding.avg_cost or Decimal("0")
        total_cost = old_avg * old_qty + price * qty + fees
        new_qty = old_qty + qty
        new_avg = (total_cost / new_qty) if new_qty != 0 else None

        holding.quantity = new_qty
        holding.avg_cost = new_avg

    elif tx_type == "sell":
        old_qty = holding.quantity or Decimal("0")
        if qty > old_qty:
            raise HTTPException(status_code=400, detail="Insufficient holdings to sell")

        new_qty = old_qty - qty
        holding.quantity = new_qty
        if new_qty == 0:
            holding.avg_cost = None

    else:
        raise HTTPException(status_code=400, detail="Invalid transaction type")

    tx = Transaction(
        holding_id=holding.id,
        type=tx_type,
        quantity=qty,
        price=price,
        fees=fees,
        executed_at=transaction_in.executed_at,
    )
    db.add(tx)
    db.add(holding)
    db.commit()
    db.refresh(tx)
    return tx


@router.get("/", response_model=List[TransactionRead])
def list_transactions(
    *,
    portfolio_id: int,
    holding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    List transactions for a holding (portfolio owner only).
    """
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id, Portfolio.owner_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    holding = db.query(Holding).filter(Holding.id == holding_id, Holding.portfolio_id == portfolio_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")

    transactions = db.query(Transaction).filter(Transaction.holding_id == holding_id).order_by(Transaction.executed_at.desc()).all()
    return transactions
