"""
Database session management.

Defines the SessionLocal factory (bound to the engine from database.py)
and the get_db() FastAPI dependency, which yields one Session per request
and guarantees it is closed afterwards, even if the request raises an error.

No models or CRUD logic live here — this file only manages the lifecycle
of database sessions.
"""

from typing import Generator

from sqlalchemy.orm import Session, sessionmaker

from app.db.database import engine

# Session factory: every call to SessionLocal() creates a new Session bound
# to our engine. autocommit/autoflush are left off so we control commits
# explicitly in the service layer (added in later modules).
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session for the duration
    of a single request.

    Usage (in future routers/services):
        def endpoint(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()