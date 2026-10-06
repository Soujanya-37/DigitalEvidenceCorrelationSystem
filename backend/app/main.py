"""
Application entrypoint.

Run with:
    uvicorn app.main:app --reload

This module only wires up the FastAPI app, CORS, and the health-check route.
Routers for auth/cases/evidence/timeline/scoring/reports are added in later
modules and will be included here via app.include_router(...).
"""

from fastapi import Depends, FastAPI, HTTPException
import app.models.user
import app.models.case
import app.models.evidence
import app.models.timeline_event
import app.models.verification_result
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.api.router import api_router
from app.core.config import settings
from app.db.session import get_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0",
    description="Backend API for the Digital Evidence Correlation System "
    "for Alibi Verification.",
    
)
print("CORS ORIGINS:", settings.CORS_ORIGINS)

# CORS: allows the React frontend (Vite dev server) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["Health"])
def health_check():
    """
    Basic liveness check. Used to verify the server is up and reachable
    before wiring in the database, auth, or any business logic.
    """
    return {
        "status": "ok",
        "message": "Digital Evidence Correlation System Backend Running",
    }


@app.get("/db-test", tags=["Health"])
def db_connection_test(db: Session = Depends(get_db)):
    """
    Verifies the app can actually reach PostgreSQL using the configured
    DATABASE_URL. Runs a trivial `SELECT 1` through the get_db() session
    dependency (app/db/session.py) — this exercises the full chain:
    config.py -> database.py (engine) -> session.py (session) -> Postgres.

    No models or tables are touched; this is purely a connectivity check.
    """
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "ok",
            "message": "Database connection successful",
        }
    except OperationalError as exc:
        # Raised when Postgres is unreachable / credentials are wrong /
        # the database does not exist yet.
        raise HTTPException(
            status_code=503,
            detail=f"Database connection failed: {exc.__class__.__name__}",
        ) from exc