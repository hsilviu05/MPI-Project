"""Ensure users.hashed_password exists (repair empty 4579 upgrade)

Revision ID: eec4b8a12d3f
Revises: 4579ad263afd
Create Date: 2026-04-20

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision: str = "eec4b8a12d3f"
down_revision: Union[str, Sequence[str], None] = "4579ad263afd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [c["name"] for c in inspector.get_columns("users")]
    if "hashed_password" in columns:
        return
    op.add_column(
        "users",
        sa.Column(
            "hashed_password",
            sa.String(length=255),
            nullable=False,
            server_default="",
        ),
    )
    op.alter_column("users", "hashed_password", server_default=None)


def downgrade() -> None:
    pass
