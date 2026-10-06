"""
Pydantic schemas for user registration, login, and API responses.

These are separate from the SQLAlchemy User model (app/models/user.py) so
the database schema and the public API contract can evolve independently
— most importantly, hashed_password is never part of a response schema.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole


class UserCreate(BaseModel):
    """Request body for POST /auth/register."""

    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(
        min_length=8,
        max_length=128,
        description="Minimum 8 characters.",
    )


class UserLogin(BaseModel):
    """Request body for POST /auth/login."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Public-facing user representation returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    email: EmailStr
    role: UserRole
    created_at: datetime


class Token(BaseModel):
    """Response body for a successful login."""

    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Shape of the decoded JWT payload (for internal/type-checking use)."""

    sub: Optional[str] = None
    exp: Optional[int] = None