"""
User ORM model.

Represents an investigator (or admin) account. Authentication logic
(password hashing, JWT issuing/verification) is added in a later module —
this file only defines the table structure and relationships.
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    # Import only for type checkers; avoids circular imports at runtime.
    from app.models.case import Case
    from app.models.evidence import Evidence
    from app.models.verification_result import AlibiVerificationResult


class UserRole(str, enum.Enum):
    """Roles a user account can have."""

    INVESTIGATOR = "investigator"
    ADMIN = "admin"


class User(Base):
    """An investigator or admin who can create cases and upload evidence."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"),
        nullable=False,
        default=UserRole.INVESTIGATOR,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # --- Relationships ---
    cases_created: Mapped[List["Case"]] = relationship(
    "Case",
    back_populates="creator"
    )
    evidence_uploaded: Mapped[List["Evidence"]] = relationship(
    "Evidence",
    back_populates="uploader"
    )
    verification_results_generated: Mapped[List["AlibiVerificationResult"]] = relationship(
    "AlibiVerificationResult",
    back_populates="generator"
    )
    

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role}>"