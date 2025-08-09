"""Add is_locked column to users table

Revision ID: 001
Revises: 
Create Date: 2025-08-05 01:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add is_locked column to users table."""
    # Add the is_locked column with default value False
    op.add_column('users', sa.Column('is_locked', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    """Remove is_locked column from users table."""
    op.drop_column('users', 'is_locked')
