from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.case import Case
from app.models.verification_result import AlibiVerificationResult
from app.services.analysis_service import run_analysis
router=APIRouter()
def _out(r): return {'id':str(r.id),'case_id':str(r.case_id),'confidence_score':r.confidence_score,'verdict':r.verdict.value,'matched_events_count':r.matched_events_count,'conflicting_events_count':r.conflicting_events_count,'analysis_summary':r.analysis_summary,'generated_at':r.generated_at}
@router.post('/{case_id}/run')
def run(case_id:UUID,db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    c=db.query(Case).filter(Case.id==case_id).first()
    if not c: raise HTTPException(404,'Case not found')
    return _out(run_analysis(db,c,current_user.id))
@router.get('/{case_id}')
def get(case_id:UUID,db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    r=db.query(AlibiVerificationResult).filter_by(case_id=case_id).first()
    if not r: return None
    return _out(r)
