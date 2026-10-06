from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict, Optional

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.evidence import EvidenceType


if TYPE_CHECKING:
    from app.models.case import Case
    from app.models.evidence import Evidence


class TimelineEvent(Base):
    """
    A single normalized event extracted from digital evidence.

    Examples:
    - GPS location ping
    - CCTV observation
    - Bank transaction
    - Phone activity
    - Social media activity
    """

    __tablename__ = "timeline_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("cases.id"),
        nullable=False,
        index=True,
    )

    evidence_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("evidence.id"),
        nullable=False,
        index=True,
    )

    source_type: Mapped[EvidenceType] = mapped_column(
        Enum(EvidenceType, name="evidence_type"),
        nullable=False,
    )

    event_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    location_lat: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    location_lng: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    location_label: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # Original source information preserved for traceability/audit.
    raw_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------

    case: Mapped["Case"] = relationship(
        "app.models.case.Case",
        back_populates="timeline_events",
    )

    evidence: Mapped["Evidence"] = relationship(
        "app.models.evidence.Evidence",
        back_populates="timeline_events",
    )

    def __repr__(self) -> str:
        return (
            f"<TimelineEvent id={self.id} "
            f"source={self.source_type} "
            f"at={self.event_timestamp}>"
        )