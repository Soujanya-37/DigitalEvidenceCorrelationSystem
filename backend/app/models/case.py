from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


if TYPE_CHECKING:
    from app.models.evidence import Evidence
    from app.models.timeline_event import TimelineEvent
    from app.models.user import User
    from app.models.verification_result import AlibiVerificationResult


class CaseStatus(str, enum.Enum):
    OPEN = "open"
    UNDER_REVIEW = "under_review"
    CLOSED = "closed"


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    case_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    suspect_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    priority: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="High",
        server_default="High",
    )

    claimed_alibi_text: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    claimed_alibi_start: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    claimed_alibi_end: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    claimed_alibi_location: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    claimed_alibi_lat: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    claimed_alibi_lng: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    status: Mapped[CaseStatus] = mapped_column(
        Enum(CaseStatus, name="case_status"),
        nullable=False,
        default=CaseStatus.OPEN,
    )

    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------

    creator: Mapped["User"] = relationship(
        "app.models.user.User",
        back_populates="cases_created",
        foreign_keys=[created_by],
    )

    evidence_items: Mapped[List["Evidence"]] = relationship(
        "app.models.evidence.Evidence",
        back_populates="case",
        cascade="all, delete-orphan",
    )

    timeline_events: Mapped[List["TimelineEvent"]] = relationship(
        "app.models.timeline_event.TimelineEvent",
        back_populates="case",
        cascade="all, delete-orphan",
    )

    verification_result: Mapped[Optional["AlibiVerificationResult"]] = relationship(
        "app.models.verification_result.AlibiVerificationResult",
        back_populates="case",
        uselist=False,
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<Case id={self.id} "
            f"case_number={self.case_number!r} "
            f"title={self.title!r}>"
        )