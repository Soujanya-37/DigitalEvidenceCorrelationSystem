"""
Database engine configuration.

This module is responsible for exactly one thing: creating the SQLAlchemy
Engine from DATABASE_URL (read from .env via app.core.config.settings).

It does NOT define the session factory (see app/db/session.py) and does NOT
define the declarative Base (see app/db/base.py) — kept separate so each
file has a single, clear responsibility.

Creating the engine does not open a connection immediately; SQLAlchemy
connects lazily on first use (e.g. the first query, or the /db-test
endpoint added in this module).
"""

from sqlalchemy import create_engine

from app.core.config import settings

# The Engine is the entry point to the database. pool_pre_ping=True makes
# SQLAlchemy test each connection before using it, so stale/dropped
# connections (e.g. after the DB restarts) are recycled automatically
# instead of raising errors on the next query.
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
)