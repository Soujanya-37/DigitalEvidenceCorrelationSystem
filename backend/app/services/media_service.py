from __future__ import annotations

import re
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


from app.models.timeline_event import TimelineEvent


# ============================================================
# DATE / TIME PARSING
# ============================================================

def _dt(value: str | None):
    """
    Parse timestamps from common EXIF, OCR, filename and
    application formats.

    EXIF cameras commonly use:
        2012:10:24 09:13:00

    Other sources may use:
        2012-10-24 09:13:00
        2012/10/24 09:13
        24-10-2012 09:13:00
    """

    if value is None:
        return None

    s = str(value).strip()

    if not s:
        return None

    # Normalize separators used between date/time.
    s = s.replace("/", "-").replace("T", " ")

    # EXIF standard DateTime format:
    # YYYY:MM:DD HH:MM:SS
    exif_formats = (
        "%Y:%m:%d %H:%M:%S",
        "%Y:%m:%d %H:%M",
    )

    for fmt in exif_formats:
        try:
            return datetime.strptime(s, fmt).replace(
                tzinfo=timezone.utc
            )
        except ValueError:
            pass

    # Normal application formats.
    formats = (
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%d-%m-%Y %H:%M:%S",
        "%d-%m-%Y %H:%M",
        "%m-%d-%Y %H:%M:%S",
        "%m-%d-%Y %H:%M",
    )

    for fmt in formats:
        try:
            return datetime.strptime(s, fmt).replace(
                tzinfo=timezone.utc
            )
        except ValueError:
            pass

    # ISO 8601 fallback.
    try:
        normalized = s.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(normalized)

        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)

        return parsed

    except ValueError:
        return None


def _timestamp_from_text(text: str):
    """
    Extract timestamp from OCR text or filename.
    """

    if not text:
        return None

    patterns = [
        r"\b\d{4}[-/]\d{2}[-/]\d{2}[ T]\d{2}:\d{2}(?::\d{2})?\b",
        r"\b\d{4}:\d{2}:\d{2}[ T]\d{2}:\d{2}(?::\d{2})?\b",
        r"\b\d{2}[-/]\d{2}[-/]\d{4}[ T]\d{2}:\d{2}(?::\d{2})?\b",
    ]

    for pattern in patterns:
        match = re.search(pattern, text)

        if match:
            timestamp = _dt(match.group(0))

            if timestamp:
                return timestamp

    return None


# ============================================================
# EXIF GPS
# ============================================================

def _gps_from_exif(exif):
    """
    Extract latitude and longitude from EXIF GPS metadata.

    Supports both older and newer Pillow EXIF handling.
    """

    try:
        from PIL.ExifTags import GPSTAGS

        # Modern Pillow:
        # GPS information may need get_ifd().
        gps = None

        try:
            gps = exif.get_ifd(34853)
        except Exception:
            gps = exif.get(34853)

        if not gps:
            return None, None

        def rational_to_float(value):
            """
            Pillow may return:
              - IFDRational
              - tuple(numerator, denominator)
              - int / float
            """

            try:
                return float(value)
            except (TypeError, ValueError):
                pass

            try:
                numerator = float(value[0])
                denominator = float(value[1])

                if denominator == 0:
                    return None

                return numerator / denominator

            except (TypeError, ValueError, IndexError, ZeroDivisionError):
                return None

        def dms_to_decimal(values):
            if not values or len(values) < 3:
                return None

            degrees = rational_to_float(values[0])
            minutes = rational_to_float(values[1])
            seconds = rational_to_float(values[2])

            if degrees is None or minutes is None or seconds is None:
                return None

            return degrees + (minutes / 60.0) + (seconds / 3600.0)

        lat_values = gps.get(2)
        lon_values = gps.get(4)

        latitude = dms_to_decimal(lat_values)
        longitude = dms_to_decimal(lon_values)

        if latitude is None or longitude is None:
            return None, None

        lat_ref = gps.get(1)
        lon_ref = gps.get(3)

        # Pillow may return bytes such as b'N'.
        if isinstance(lat_ref, bytes):
            lat_ref = lat_ref.decode(errors="ignore")

        if isinstance(lon_ref, bytes):
            lon_ref = lon_ref.decode(errors="ignore")

        lat_ref = str(lat_ref).upper()
        lon_ref = str(lon_ref).upper()

        if lat_ref == "S":
            latitude = -latitude

        if lon_ref == "W":
            longitude = -longitude

        return latitude, longitude

    except Exception:
        return None, None


# ============================================================
# EXIF GPS TIMESTAMP
# ============================================================

def _gps_timestamp_from_exif(exif):
    """
    Extract GPSDateStamp + GPSTimeStamp.

    GPS timestamps are normally UTC.
    """

    try:
        gps = None

        try:
            gps = exif.get_ifd(34853)
        except Exception:
            gps = exif.get(34853)

        if not gps:
            return None

        date_value = gps.get(29)
        time_value = gps.get(7)

        if not date_value or not time_value:
            return None

        # Example:
        # GPSDateStamp = 2012:10:24
        # GPSTimeStamp = (15, 13, 0)

        if isinstance(date_value, bytes):
            date_value = date_value.decode(errors="ignore")

        date_value = str(date_value).strip()

        parts = []

        for item in time_value:
            try:
                parts.append(float(item))
            except Exception:
                try:
                    parts.append(float(item[0]) / float(item[1]))
                except Exception:
                    return None

        if len(parts) < 3:
            return None

        hour = int(parts[0])
        minute = int(parts[1])
        second = int(parts[2])

        # Convert EXIF date separator to normal format.
        date_value = date_value.replace("-", ":")

        parsed = datetime.strptime(
            f"{date_value} {hour:02d}:{minute:02d}:{second:02d}",
            "%Y:%m:%d %H:%M:%S",
        )

        return parsed.replace(tzinfo=timezone.utc)

    except Exception:
        return None


# ============================================================
# IMAGE PROCESSING
# ============================================================

def process_image(path: Path) -> dict[str, Any]:

    meta = {
        "media_kind": "image",
        "metadata_source": [],
    }

    try:
        from PIL import Image, ExifTags

        with Image.open(path) as image:

            meta.update(
                {
                    "width": image.width,
                    "height": image.height,
                    "format": image.format,
                }
            )

            exif = image.getexif()

            if exif:

                meta["metadata_source"].append("EXIF")

                # ------------------------------------------------
                # Standard EXIF fields
                # ------------------------------------------------

                for key, value in exif.items():

                    name = ExifTags.TAGS.get(
                        key,
                        str(key),
                    )

                    if name in (
                        "DateTimeOriginal",
                        "DateTime",
                        "DateTimeDigitized",
                        "Make",
                        "Model",
                        "Software",
                    ):
                        meta[name] = str(value)

                # ------------------------------------------------
                # GPS
                # ------------------------------------------------

                latitude, longitude = _gps_from_exif(exif)

                if latitude is not None and longitude is not None:

                    meta["gps_lat"] = latitude
                    meta["gps_lng"] = longitude

                # ------------------------------------------------
                # GPS timestamp
                # ------------------------------------------------

                gps_timestamp = _gps_timestamp_from_exif(exif)

                if gps_timestamp:

                    meta["gps_timestamp"] = (
                        gps_timestamp.isoformat()
                    )

    except Exception as error:

        meta["error"] = str(error)

    return meta


# ============================================================
# OCR
# ============================================================

def _ocr_text(path: Path) -> str:

    if not shutil.which("tesseract"):
        return ""

    try:

        import pytesseract
        from PIL import Image

        with Image.open(path) as image:

            return pytesseract.image_to_string(
                image
            )[:4000]

    except Exception:

        return ""


def process_image_with_ocr(path: Path) -> dict[str, Any]:

    meta = process_image(path)

    text = _ocr_text(path)

    if text:

        meta["ocr_text"] = text

        if "OCR" not in meta["metadata_source"]:
            meta["metadata_source"].append("OCR")

        timestamp = _timestamp_from_text(text)

        if timestamp:

            meta["ocr_timestamp"] = (
                timestamp.isoformat()
            )

        location_match = re.search(
            r"(?:location|place|venue)\s*[:=-]\s*([^\n]+)",
            text,
            re.IGNORECASE,
        )

        if location_match:

            meta["ocr_location"] = (
                location_match.group(1)
                .strip()[:255]
            )

    return meta


# ============================================================
# VIDEO PROCESSING
# ============================================================

def process_video(path: Path) -> dict[str, Any]:

    meta = {
        "media_kind": "video",
        "metadata_source": [],
    }

    try:

        import cv2

        cap = cv2.VideoCapture(str(path))

        if cap.isOpened():

            fps = cap.get(
                cv2.CAP_PROP_FPS
            ) or 0

            frames = cap.get(
                cv2.CAP_PROP_FRAME_COUNT
            ) or 0

            duration = (
                float(frames / fps)
                if fps
                else None
            )

            meta.update(
                {
                    "fps": round(
                        float(fps),
                        3,
                    ),
                    "frame_count": int(frames),
                    "duration_seconds": (
                        round(duration, 2)
                        if duration is not None
                        else None
                    ),
                }
            )

            meta["metadata_source"].append(
                "OpenCV"
            )

        cap.release()

    except Exception as error:

        meta["error"] = str(error)

    # Filename timestamp is only a candidate.
    timestamp = _timestamp_from_text(
        path.stem.replace("_", " ")
    )

    if timestamp:

        meta["filename_timestamp"] = (
            timestamp.isoformat()
        )

        meta["metadata_source"].append(
            "filename"
        )

    # ------------------------------------------------------------
    # OCR from selected video frames
    # ------------------------------------------------------------

    if shutil.which("tesseract"):

        try:

            import cv2
            import pytesseract

            cap = cv2.VideoCapture(
                str(path)
            )

            frame_count = int(
                cap.get(
                    cv2.CAP_PROP_FRAME_COUNT
                )
                or 0
            )

            positions = sorted(
                set(
                    [
                        0,
                        max(0, frame_count // 2),
                        max(0, frame_count - 1),
                    ]
                )
            )

            texts = []

            for position in positions:

                cap.set(
                    cv2.CAP_PROP_POS_FRAMES,
                    position,
                )

                ok, frame = cap.read()

                if ok:

                    text = pytesseract.image_to_string(
                        frame
                    )[:2000]

                    if text.strip():

                        texts.append(text)

            cap.release()

            if texts:

                text = "\n".join(texts)

                meta["ocr_text"] = text

                if "OCR" not in meta["metadata_source"]:
                    meta["metadata_source"].append(
                        "OCR"
                    )

                timestamp = _timestamp_from_text(
                    text
                )

                if timestamp:

                    meta["ocr_timestamp"] = (
                        timestamp.isoformat()
                    )

                location_match = re.search(
                    r"(?:location|place|venue)\s*[:=-]\s*([^\n]+)",
                    text,
                    re.IGNORECASE,
                )

                if location_match:

                    meta["ocr_location"] = (
                        location_match.group(1)
                        .strip()[:255]
                    )

        except Exception:
            pass

    return meta


# ============================================================
# CREATE TIMELINE EVENT
# ============================================================

def create_media_event(
    db,
    case,
    evidence,
    meta,
    explicit_timestamp=None,
    explicit_location=None,
):

    # ------------------------------------------------------------
    # 1. Explicit timestamp from investigator
    # ------------------------------------------------------------

    timestamp = None

    if explicit_timestamp:

        if isinstance(
            explicit_timestamp,
            datetime,
        ):

            timestamp = explicit_timestamp

            if timestamp.tzinfo is None:

                timestamp = timestamp.replace(
                    tzinfo=timezone.utc
                )

        else:

            timestamp = _dt(
                str(explicit_timestamp)
            )

    # ------------------------------------------------------------
    # 2. Metadata timestamps
    # ------------------------------------------------------------

    if not timestamp:

        timestamp_keys = (
            "DateTimeOriginal",
            "DateTime",
            "DateTimeDigitized",
            "gps_timestamp",
            "ocr_timestamp",
            "filename_timestamp",
        )

        for key in timestamp_keys:

            value = meta.get(key)

            if not value:
                continue

            if isinstance(
                value,
                datetime,
            ):

                timestamp = value

                if timestamp.tzinfo is None:

                    timestamp = timestamp.replace(
                        tzinfo=timezone.utc
                    )

            else:

                timestamp = _dt(
                    str(value)
                )

            if timestamp:
                break

    # ------------------------------------------------------------
    # No timestamp = cannot create a reliable event
    # ------------------------------------------------------------

    if not timestamp:
        return 0

    # ------------------------------------------------------------
    # Location
    # ------------------------------------------------------------

    location = (
        explicit_location
        or meta.get("ocr_location")
    )

    latitude = meta.get("gps_lat")
    longitude = meta.get("gps_lng")

    # ------------------------------------------------------------
    # Create timeline event
    # ------------------------------------------------------------

    db.add(
        TimelineEvent(
            case_id=case.id,
            evidence_id=evidence.id,
            source_type=evidence.evidence_type,
            event_timestamp=timestamp,
            location_lat=latitude,
            location_lng=longitude,
            location_label=location,
            description=(
                f"{evidence.evidence_type.value.upper()} "
                f"media event extracted from "
                f"{evidence.original_filename}"
            ),
            raw_data={
                "media_metadata": meta,
            },
        )
    )

    return 1