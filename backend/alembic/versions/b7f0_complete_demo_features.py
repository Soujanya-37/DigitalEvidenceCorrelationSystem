"""add priority, evidence metadata/hash, and evidence enum values"""
from alembic import op
import sqlalchemy as sa
revision='b7f0complete'; down_revision='acd2d817751e'; branch_labels=None; depends_on=None

def upgrade():
    op.add_column('cases',sa.Column('priority',sa.String(length=20),server_default='High',nullable=False))
    op.add_column('evidence',sa.Column('sha256_hash',sa.String(length=64),nullable=True))
    op.create_index('ix_evidence_sha256_hash','evidence',['sha256_hash'],unique=False)
    op.add_column('evidence',sa.Column('metadata',sa.JSON(),nullable=True))
    for value in ['DEVICE','TRANSACTION','OTHER','IMAGE','VIDEO','AUDIO','DOCUMENT','PHONE_LOG','CALL_RECORD','SMS','EMAIL']:
        op.execute(sa.text(f"ALTER TYPE evidence_type ADD VALUE IF NOT EXISTS '{value}'"))

def downgrade():
    op.drop_index('ix_evidence_sha256_hash',table_name='evidence')
    op.drop_column('evidence','metadata'); op.drop_column('evidence','sha256_hash'); op.drop_column('cases','priority')
