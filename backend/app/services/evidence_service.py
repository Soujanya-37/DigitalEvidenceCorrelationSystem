from __future__ import annotations

import csv
import hashlib
import json
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.models.case import Case
from app.models.evidence import Evidence, EvidenceType, UploadStatus
from app.models.timeline_event import TimelineEvent
from app.models.verification_result import AlibiVerificationResult
from app.services.media_service import process_image_with_ocr, process_video, create_media_event

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def _hash_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _parse_dt(value):
    if value is None:
        return None
    s = str(value).strip()
    if not s:
        return None
    s = s.replace("Z", "+00:00")
    for candidate in (s, s.replace("/", "-")):
        try:
            dt = datetime.fromisoformat(candidate)
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        except ValueError:
            pass
    for fmt in (
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%d/%m/%Y %H:%M:%S",
        "%d/%m/%Y %H:%M",
        "%m/%d/%Y %H:%M:%S",
        "%m/%d/%Y %H:%M",
    ):
        try:
            return datetime.strptime(s, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            pass
    return None


def _pick(row, *names):
    lowered = {str(k).strip().lower(): v for k, v in row.items()}
    for name in names:
        if name in lowered:
            return lowered[name]
    return None


def _row_to_event(db, case, evidence, row, fallback_description):
    ts = _parse_dt(_pick(row, "timestamp", "datetime", "date_time", "time", "event_timestamp", "date"))
    if not ts:
        return 0

    lat = _pick(row, "latitude", "lat", "location_lat")
    lng = _pick(row, "longitude", "lng", "lon", "location_lng")
    label = _pick(row, "location", "location_label", "place", "venue", "address")
    description = _pick(row, "description", "event", "activity", "details", "message") or fallback_description

    try:
        lat = float(lat) if lat not in (None, "") else None
    except (TypeError, ValueError):
        lat = None
    try:
        lng = float(lng) if lng not in (None, "") else None
    except (TypeError, ValueError):
        lng = None

    db.add(
        TimelineEvent(
            case_id=case.id,
            evidence_id=evidence.id,
            source_type=evidence.evidence_type,
            event_timestamp=ts,
            location_lat=lat,
            location_lng=lng,
            location_label=str(label).strip() if label not in (None, "") else None,
            description=str(description).strip() if description else fallback_description,
            raw_data=row,
        )
    )
    return 1


def _parse_structured_file(db, case, evidence, path: Path) -> int:
    """Parse CSV/JSON evidence using common normalized fields.

    Supported columns include timestamp, location, latitude, longitude,
    description/event/activity/details. This makes GPS, CCTV, transaction,
    phone-log and social-media datasets usable by the same correlation engine.
    """
    created = 0
    suffix = path.suffix.lower()

    if suffix == ".csv":
        with open(path, "r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                created += _row_to_event(
                    db, case, evidence, dict(row),
                    f"{evidence.evidence_type.value.upper()} event extracted from CSV",
                )
        return created

    if suffix == ".json":
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict):
            data = data.get("events") or data.get("records") or [data]
        if not isinstance(data, list):
            return 0
        for row in data:
            if isinstance(row, dict):
                created += _row_to_event(
                    db, case, evidence, row,
                    f"{evidence.evidence_type.value.upper()} event extracted from JSON",
                )
        return created

    # Microsoft GeoLife trajectory format (.plt): six header lines followed
    # by latitude,longitude,unused,altitude,date,date_decimal,time.
    # Supporting this format lets investigators ingest an actual GPS research
    # trajectory without first converting it manually.
    if suffix == ".plt":
        # Microsoft GeoLife .plt format:
        # latitude,longitude,unused,altitude,date_decimal,date,time
        # Be deliberately tolerant: some exports contain blank/extra fields,
        # CRLF, BOMs, or whitespace. We locate the final YYYY-MM-DD + HH:MM:SS
        # pair instead of relying on a brittle fixed column position.
        with open(path, "r", encoding="utf-8-sig", errors="replace") as f:
            for line in f:
                line = line.strip().lstrip("\ufeff")
                if not line or line.lower().startswith("geolife"):
                    continue
                parts = [p.strip() for p in line.split(",")]
                if len(parts) < 7:
                    continue
                try:
                    lat = float(parts[0])
                    lng = float(parts[1])
                    alt = float(parts[3])
                except (TypeError, ValueError):
                    continue

                # Prefer the standard date/time columns, with a regex fallback.
                ts = _parse_dt(f"{parts[5]} {parts[6]}")
                if not ts:
                    m = re.search(r"(\d{4}-\d{2}-\d{2})[ ,T]+(\d{2}:\d{2}:\d{2})", line)
                    if m:
                        ts = _parse_dt(f"{m.group(1)} {m.group(2)}")
                if not ts:
                    continue

                db.add(TimelineEvent(
                    case_id=case.id, evidence_id=evidence.id, source_type=evidence.evidence_type,
                    event_timestamp=ts, location_lat=lat, location_lng=lng,
                    location_label="GeoLife GPS trajectory",
                    description=f"GPS trajectory point from {evidence.original_filename}",
                    raw_data={"latitude": lat, "longitude": lng, "altitude": alt, "source_format": "GeoLife .plt"},
                ))
                created += 1
        return created

    return 0


def _parse_description_event(db, case, evidence) -> int:
    """Create one event from a human-entered description when possible.

    Recommended format:
      2026-08-31 18:30 | City Central Mall | CCTV detected suspect at entrance
    """
    text = (evidence.description or "").strip()
    if not text:
        return 0

    parts = [part.strip() for part in text.split("|", 2)]
    ts = _parse_dt(parts[0])
    if not ts:
        # Also accept a timestamp embedded in free text.
        match = re.search(r"\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?", text)
        if match:
            ts = _parse_dt(match.group(0))
    if not ts:
        return 0

    location = parts[1] if len(parts) >= 3 else None
    description = parts[2] if len(parts) >= 3 else text

    db.add(
        TimelineEvent(
            case_id=case.id,
            evidence_id=evidence.id,
            source_type=evidence.evidence_type,
            event_timestamp=ts,
            location_label=location or None,
            description=description,
            raw_data={"description": text},
        )
    )
    return 1


def process_evidence(db: Session, evidence: Evidence, explicit_timestamp=None, explicit_location=None):
    # Idempotent processing.
    if db.query(TimelineEvent).filter(TimelineEvent.evidence_id == evidence.id).count():
        evidence.upload_status = UploadStatus.PROCESSED
        db.commit()
        return

    case = evidence.case
    path = Path(evidence.storage_path)
    created = _parse_structured_file(db, case, evidence, path)
    media_meta = {}
    if created == 0 and path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}:
        media_meta = process_image_with_ocr(path)
        created = create_media_event(db, case, evidence, media_meta, explicit_timestamp, explicit_location)
    elif created == 0 and path.suffix.lower() in {".mp4", ".avi", ".mov", ".mkv", ".webm", ".m4v"}:
        media_meta = process_video(path)
        created = create_media_event(db, case, evidence, media_meta, explicit_timestamp, explicit_location)

    if created == 0:
        created = _parse_description_event(db, case, evidence)

    # For an unstructured file with no timestamp metadata, we deliberately do
    # not invent the alibi location or time. The evidence remains in the
    # inventory but cannot falsely support the alibi.
    evidence.upload_status = UploadStatus.PROCESSED
    evidence.processed_at = datetime.now(timezone.utc)
    evidence.file_metadata = {
        **(evidence.file_metadata or {}),
        "timeline_events_created": created,
        "parser": "GeoLife .plt / CSV / JSON / image EXIF+OCR / video metadata+OCR / explicit timestamp-location",
        "processing": "structured CSV/JSON parsing, GeoLife .plt parsing, media metadata/OCR, or explicit timestamp/location",
        "media": media_meta or None,
    }

    # New evidence invalidates the previous analysis so the investigator must
    # explicitly rerun correlation with the complete evidence set.
    db.query(AlibiVerificationResult).filter(
        AlibiVerificationResult.case_id == evidence.case_id
    ).delete(synchronize_session=False)
    db.commit()


def upload_evidence(
    db: Session,
    case_id,
    current_user,
    file: UploadFile,
    evidence_type: str,
    description: str = "",
    event_timestamp=None,
    event_location: str | None = None,
    provenance: str = "Investigator upload",
    acquisition_method: str = "Digital file upload",
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    try:
        evidence_enum = EvidenceType(evidence_type.lower())
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported evidence type: {evidence_type}",
        )

    safe_name = Path(file.filename or "evidence.bin").name
    path = UPLOAD_DIR / f"{uuid.uuid4()}{Path(safe_name).suffix.lower()}"
    with open(path, "wb") as out:
        out.write(file.file.read())

    evidence = Evidence(
        case_id=case_id,
        evidence_type=evidence_enum,
        original_filename=safe_name,
        storage_path=str(path),
        uploaded_by=current_user.id,
        description=description.strip() or None,
        mime_type=file.content_type,
        file_size=os.path.getsize(path),
        sha256_hash=_hash_file(path),
        file_metadata={"original_filename": safe_name, "provenance": provenance or "Investigator upload", "acquisition_method": acquisition_method or "Digital file upload"},
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    process_evidence(db, evidence, event_timestamp, event_location)
    return evidence
