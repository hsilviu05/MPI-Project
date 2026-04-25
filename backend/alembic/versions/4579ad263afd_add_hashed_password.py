"""Add hashed_password

Revision ID: 4579ad263afd
Revises: 373d648251a9
Create Date: 2026-04-02 14:47:36.909243

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4579ad263afd'
down_revision: Union[str, Sequence[str], None] = '373d648251a9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
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
    """Downgrade schema."""
    op.drop_column("users", "hashed_password")
