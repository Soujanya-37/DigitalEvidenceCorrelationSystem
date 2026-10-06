"""
Authentication API routes.

Endpoints:
    POST /register  - create a new investigator account
    POST /login     - authenticate and receive a JWT access token
    GET  /me        - return the currently authenticated user's profile

This module also defines get_current_user, the FastAPI dependency that
protects /me and future protected routes by resolving the
"Authorization: Bearer <token>" header into a User.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserLogin, UserResponse
from app.services import auth_service


router = APIRouter()


# -------------------------------------------------------------------
# HTTP Bearer Authentication
# -------------------------------------------------------------------
# Swagger will provide an "Authorize" button where we can paste the
# JWT token received from /login.
#
# Example header:
# Authorization: Bearer <JWT_TOKEN>
# -------------------------------------------------------------------

bearer_scheme = HTTPBearer()


# -------------------------------------------------------------------
# Get Current User
# -------------------------------------------------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Resolve the JWT bearer token into the currently authenticated User.

    Raises HTTP 401 if the token is missing, malformed, expired, or
    refers to a user that no longer exists.
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials

    try:
        print("\n========== AUTH DEBUG ==========")
        print("Received Token:", token)

        payload = decode_access_token(token)
        print("Decoded Payload:", payload)

        raw_subject = payload.get("sub")
        print("Subject (sub):", raw_subject)

        if raw_subject is None:
            print("ERROR: Subject is None")
            raise credentials_exception

        user_id = uuid.UUID(raw_subject)

        print("UUID:", user_id)

    except (JWTError, ValueError) as e:
        print("JWT ERROR:", e)
        raise credentials_exception

    user = auth_service.get_user_by_id(db, user_id)

    print("Database User:", user)
    print("================================\n")

    if user is None:
        print("ERROR: User not found in database")
        raise credentials_exception

    return user


# -------------------------------------------------------------------
# Register
# -------------------------------------------------------------------

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new investigator account",
)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> User:
    """
    Create a new investigator account with a bcrypt-hashed password.
    """

    try:
        return auth_service.register_user(db, user_in)

    except auth_service.EmailAlreadyRegisteredError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email is already registered.",
        )


# -------------------------------------------------------------------
# Login
# -------------------------------------------------------------------

@router.post(
    "/login",
    response_model=Token,
    summary="Log in and receive a JWT",
)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db),
) -> Token:
    """
    Authenticate with email + password and receive a JWT access token.
    """

    user = auth_service.authenticate_user(
        db,
        credentials.email,
        credentials.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        subject=str(user.id)
    )

    return Token(
        access_token=access_token
    )


# -------------------------------------------------------------------
# Current User
# -------------------------------------------------------------------

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the currently authenticated user's profile",
)
def read_current_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Protected route — requires a valid Bearer token.
    Returns the caller's own profile.
    """

    return current_user