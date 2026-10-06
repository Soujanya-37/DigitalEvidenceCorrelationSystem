from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.case import CaseCreate, CaseResponse
from app.services.case_service import (
    create_case,
    get_all_cases,
    get_case_by_id,
)

router = APIRouter()


# ---------------------------------------------------------
# CREATE CASE
# ---------------------------------------------------------
@router.post(
    "/",
    response_model=CaseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_case(
    case: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new investigation case.

    Requires an authenticated user.
    The logged-in user's ID is stored as created_by.
    """
    return create_case(
        db=db,
        case=case,
        user_id=current_user.id,
    )


# ---------------------------------------------------------
# GET ALL CASES
# ---------------------------------------------------------
@router.get(
    "/",
    response_model=list[CaseResponse],
)
def get_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return all investigation cases.

    Requires an authenticated user.
    """
    return get_all_cases(db)


# ---------------------------------------------------------
# GET SINGLE CASE
# ---------------------------------------------------------
@router.get(
    "/{case_id}",
    response_model=CaseResponse,
)
def get_case(
    case_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return a single case by UUID.
    """
    case = get_case_by_id(db, case_id)

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found",
        )

    return case


# ---------------------------------------------------------
# DELETE CASE
# ---------------------------------------------------------
@router.delete(
    "/{case_id}",
)
def delete_case(
    case_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete an investigation case.

    Because the Case model uses cascade="all, delete-orphan",
    associated evidence, timeline events, and verification
    result records will also be removed.
    """

    case = get_case_by_id(db, case_id)

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found",
        )

    db.delete(case)
    db.commit()

    return {
        "message": "Case deleted successfully",
        "case_id": str(case_id),
    }