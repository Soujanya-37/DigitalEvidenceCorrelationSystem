"""
AlibiVerificationResult ORM model.

Represents the output of the correlation scoring engine (Module 6) for a
case: the computed confidence score, verdict, and a breakdown of which
timeline events supported vs contradicted the claimed alibi. One-to-one
with Case — re-running scoring updates this row rather than creating a
new one.
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict, Optional

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.case import Case
    from app.models.user import User


class Verdict(str, enum.Enum):
    """Overall conclusion drawn from the confidence score."""

    SUPPORTED = "supported"
    CONTRADICTED = "contradicted"
    INCONCLUSIVE = "inconclusive"


class AlibiVerificationResult(Base):
    """The scoring engine's output for a single case's alibi claim."""

    __tablename__ = "alibi_verification_results"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("cases.id"),
        unique=True,
        nullable=False,
        index=True,
    )

    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    verdict: Mapped[Verdict] = mapped_column(
        Enum(Verdict, name="verdict"), nullable=False
    )
    matched_events_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    conflicting_events_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )

    # Per-source breakdown (weights, matched/conflicting counts per evidence
    # type, distances, etc.) produced by the scoring service.
    analysis_summary: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB, nullable=True
    )

    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    generated_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )

    # --- Relationships ---
    case: Mapped["Case"] = relationship("Case", back_populates="verification_result")
    generator: Mapped["User"] = relationship(
        "User",
        back_populates="verification_results_generated",
        foreign_keys=[generated_by],
    )

    def __repr__(self) -> str:
        return (
            f"<AlibiVerificationResult case_id={self.case_id} "
            f"score={self.confidence_score} verdict={self.verdict}>"
        )