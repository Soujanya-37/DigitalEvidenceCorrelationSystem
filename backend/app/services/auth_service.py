"""
Auth service layer.

Contains the business logic for registering and authenticating users.
Deliberately framework-agnostic (no FastAPI imports, no HTTPException) so
it stays testable and reusable outside of the API layer — the endpoint
layer (app/api/endpoints/auth.py) is responsible for translating these
results/exceptions into HTTP responses.
"""

import uuid
from typing import Optional

from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserCreate


class EmailAlreadyRegisteredError(Exception):
    """Raised when attempting to register an email that's already in use."""


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Fetch a user by email, or None if no such user exists."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
    """Fetch a user by primary key id, or None if no such user exists."""
    return db.query(User).filter(User.id == user_id).first()


def register_user(db: Session, user_in: UserCreate) -> User:
    """
    Create a new user account with a bcrypt-hashed password.

    Raises:
        EmailAlreadyRegisteredError: if the email is already registered.
    """
    if get_user_by_email(db, user_in.email) is not None:
        raise EmailAlreadyRegisteredError(user_in.email)

    user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Verify login credentials.

    Returns the User if email+password are correct, otherwise None.
    Returns None (rather than raising) on any failure reason so the caller
    can give a single generic "incorrect email or password" response,
    without leaking whether the email exists.
    """
    user = get_user_by_email(db, email)
    if user is None:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user