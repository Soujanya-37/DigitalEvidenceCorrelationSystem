from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.api.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.case import Case
from app.models.evidence import Evidence
from app.models.timeline_event import TimelineEvent
from app.models.verification_result import AlibiVerificationResult


router = APIRouter()


@router.get("/{case_id}/summary", response_class=PlainTextResponse)
def report(
    case_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ---------------------------------------------------------
    # Fetch case
    # ---------------------------------------------------------
    case = (
        db.query(Case)
        .filter(Case.id == case_id)
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Case not found",
        )

    # ---------------------------------------------------------
    # Fetch evidence and analysis
    # ---------------------------------------------------------
    evidence = (
        db.query(Evidence)
        .filter(Evidence.case_id == case_id)
        .all()
    )

    events = (
        db.query(TimelineEvent)
        .filter(TimelineEvent.case_id == case_id)
        .order_by(TimelineEvent.event_timestamp)
        .all()
    )

    result = (
        db.query(AlibiVerificationResult)
        .filter(AlibiVerificationResult.case_id == case_id)
        .first()
    )

    # ---------------------------------------------------------
    # Analysis values
    # ---------------------------------------------------------
    if result:
        score = result.confidence_score

        verdict = (
            result.verdict.value.upper()
            if result.verdict
            else "INCONCLUSIVE"
        )

        matched = result.matched_events_count or 0
        conflicting = result.conflicting_events_count or 0

        analysis_summary = result.analysis_summary or {}

        neutral = analysis_summary.get(
            "neutral_events",
            max(0, len(events) - matched - conflicting),
        )

        relevant = analysis_summary.get(
            "relevant_events",
            matched + conflicting,
        )
    else:
        score = None
        verdict = "INCONCLUSIVE"
        matched = 0
        conflicting = 0
        neutral = len(events)
        relevant = 0

    # ---------------------------------------------------------
    # Professional score display
    # ---------------------------------------------------------
    if score is None or relevant == 0:
        score_display = "N/A"
        support_display = "N/A"
        contradiction_display = "N/A"
    else:
        score = float(score)

        score_display = f"{score:.1f}%"
        support_display = f"{score:.1f}% Supported"
        contradiction_display = f"{100.0 - score:.1f}% Contradicted"

    # ---------------------------------------------------------
    # Evidence source summary
    # ---------------------------------------------------------
    source_counts = {}

    for item in evidence:
        source = item.evidence_type.value.upper()

        source_counts[source] = (
            source_counts.get(source, 0) + 1
        )

    if source_counts:
        source_summary = ", ".join(
            f"{source} ({count})"
            for source, count in sorted(source_counts.items())
        )
    else:
        source_summary = "None"

    # ---------------------------------------------------------
    # Integrity status
    # ---------------------------------------------------------
    hashed_files = sum(
        1
        for item in evidence
        if item.sha256_hash
    )

    if evidence and hashed_files == len(evidence):
        integrity = "Verified"
    elif evidence:
        integrity = f"{hashed_files}/{len(evidence)} files hashed"
    else:
        integrity = "No evidence"

    # ---------------------------------------------------------
    # Verdict wording
    # ---------------------------------------------------------
    if verdict == "SUPPORTED":
        verdict_text = "SUPPORTED"
    elif verdict == "CONTRADICTED":
        verdict_text = "CONTRADICTED"
    else:
        verdict_text = "INCONCLUSIVE"

    # ---------------------------------------------------------
    # Build concise professional report
    # ---------------------------------------------------------
    lines = [
        "DIGITAL EVIDENCE CORRELATION REPORT",
        "=" * 42,
        "",
        "CASE",
        f"Case Number       : {case.case_number}",
        f"Title             : {case.title}",
        f"Suspect           : {case.suspect_name}",
        f"Priority          : {case.priority}",
        f"Status            : {case.status.value}",
        "",
        "ALIBI VERIFICATION",
        "-" * 42,
        f"Alibi Consistency : {score_display}",
        f"Supported         : {support_display}",
        f"Contradicted      : {contradiction_display}",
        f"Verdict           : {verdict_text}",
        "",
        "EVIDENCE SUMMARY",
        "-" * 42,
        f"Evidence Files    : {len(evidence)}",
        f"Timeline Events   : {len(events)}",
        f"Relevant Events   : {relevant}",
        f"Supporting Events : {matched}",
        f"Conflicting Events: {conflicting}",
        f"Neutral Events    : {neutral}",
        f"Evidence Sources  : {source_summary}",
        f"Integrity         : {integrity}",
        "",
        "ALIBI TARGET",
        "-" * 42,
        f"Claimed Location  : {case.claimed_alibi_location or 'Not provided'}",
        f"Alibi Start       : {case.claimed_alibi_start or 'Not provided'}",
        f"Alibi End         : {case.claimed_alibi_end or 'Not provided'}",
        "",
        "METHOD",
        "-" * 42,
        "Timestamp and location correlation was performed",
        "against the supplied digital evidence.",
        "GPS observations use geographic distance tolerance;",
        "named locations use normalized text matching.",
        "",
        "CONCLUSION",
        "-" * 42,
    ]

    # ---------------------------------------------------------
    # Dynamic conclusion
    # ---------------------------------------------------------
    if score is None or relevant == 0:
        lines.extend([
            "Insufficient relevant evidence was available",
            "to determine alibi consistency.",
        ])
    elif verdict == "SUPPORTED":
        lines.extend([
            f"The supplied evidence shows {score:.1f}% "
            "consistency with the claimed alibi.",
            "The alibi is classified as SUPPORTED by the",
            "configured correlation rules.",
        ])
    elif verdict == "CONTRADICTED":
        lines.extend([
            f"The supplied evidence shows {score:.1f}% "
            "consistency with the claimed alibi.",
            "The alibi is classified as CONTRADICTED by the",
            "configured correlation rules.",
        ])
    else:
        lines.extend([
            f"The supplied evidence shows {score:.1f}% "
            "consistency with the claimed alibi.",
            "The available evidence is INCONCLUSIVE under",
            "the configured correlation rules.",
        ])

    lines.extend([
        "",
        "SYSTEM NOTE",
        "-" * 42,
        "This is an automated evidence-correlation assessment.",
        "The consistency score is not a probability of",
        "innocence or guilt and is not a legal determination.",
        "",
        "END OF REPORT",
    ])

    return "\n".join(lines)