import uuid
from sqlalchemy.orm import Session
from app.models.case import Case
from app.schemas.case import CaseCreate

def get_all_cases(db: Session): return db.query(Case).order_by(Case.created_at.desc()).all()
def get_case_by_id(db: Session, case_id): return db.query(Case).filter(Case.id==case_id).first()
def generate_case_number(): return f"CASE-{uuid.uuid4().hex[:8].upper()}"
def create_case(db: Session, case: CaseCreate, user_id):
    obj=Case(case_number=generate_case_number(),title=case.title.strip(),suspect_name=case.suspect_name.strip(),description=case.description,priority=case.priority,claimed_alibi_text=case.claimed_alibi_text,claimed_alibi_location=case.claimed_alibi_location,claimed_alibi_lat=case.claimed_alibi_lat,claimed_alibi_lng=case.claimed_alibi_lng,claimed_alibi_start=case.claimed_alibi_start,claimed_alibi_end=case.claimed_alibi_end,created_by=user_id)
    db.add(obj); db.commit(); db.refresh(obj); return obj
