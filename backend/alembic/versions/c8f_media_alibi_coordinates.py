"""add optional claimed alibi coordinates for GPS correlation"""
from alembic import op
import sqlalchemy as sa
revision = "c8f_media_coords"
down_revision = "b7f0complete"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("cases", sa.Column("claimed_alibi_lat", sa.Float(), nullable=True))
    op.add_column("cases", sa.Column("claimed_alibi_lng", sa.Float(), nullable=True))

def downgrade():
    op.drop_column("cases", "claimed_alibi_lng")
    op.drop_column("cases", "claimed_alibi_lat")
