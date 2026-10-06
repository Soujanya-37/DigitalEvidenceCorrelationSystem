from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict, List, Optional

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


if TYPE_CHECKING:
    from app.models.case import Case
    from app.models.timeline_event import TimelineEvent
    from app.models.user import User


class EvidenceType(str, enum.Enum):
    CCTV = "cctv"
    GPS = "gps"
    BANK = "bank"
    PHONE_LOG = "phone_log"
    CALL_RECORD = "call_record"
    SMS = "sms"
    EMAIL = "email"
    SOCIAL_MEDIA = "social_media"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"
    DEVICE = "device"
    TRANSACTION = "transaction"
    OTHER = "other"


class UploadStatus(str, enum.Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    PROCESSED = "processed"
    FAILED = "failed"


class Evidence(Base):
    __tablename__ = "evidence"

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

    evidence_type: Mapped[EvidenceType] = mapped_column(
        Enum(EvidenceType, name="evidence_type"),
        nullable=False,
    )

    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    storage_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    mime_type: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )

    file_size: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    sha256_hash: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True,
        index=True,
    )

    # SQLAlchemy reserves the attribute name "metadata",
    # therefore Python uses file_metadata while the database
    # column remains named "metadata".
    file_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        "metadata",
        JSONB,
        nullable=True,
    )

    upload_status: Mapped[UploadStatus] = mapped_column(
        Enum(UploadStatus, name="upload_status"),
        nullable=False,
        default=UploadStatus.UPLOADED,
    )

    uploaded_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    processed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------

    case: Mapped["Case"] = relationship(
        "app.models.case.Case",
        back_populates="evidence_items",
    )

    uploader: Mapped["User"] = relationship(
        "app.models.user.User",
        back_populates="evidence_uploaded",
        foreign_keys=[uploaded_by],
    )

    timeline_events: Mapped[List["TimelineEvent"]] = relationship(
        "app.models.timeline_event.TimelineEvent",
        back_populates="evidence",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<Evidence id={self.id} "
            f"filename={self.original_filename!r} "
            f"type={self.evidence_type}>"
        )