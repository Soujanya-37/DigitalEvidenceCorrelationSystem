from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.case import Case
from app.models.timeline_event import TimelineEvent
router=APIRouter()
@router.get('/{case_id}')
def get_timeline(case_id:UUID,db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    if not db.query(Case).filter(Case.id==case_id).first(): raise HTTPException(404,'Case not found')
    events=db.query(TimelineEvent).filter(TimelineEvent.case_id==case_id).order_by(TimelineEvent.event_timestamp.asc()).all()
    return [{'id':str(e.id),'case_id':str(e.case_id),'evidence_id':str(e.evidence_id),'source_type':e.source_type.value,'event_timestamp':e.event_timestamp,'location_lat':e.location_lat,'location_lng':e.location_lng,'location_label':e.location_label,'description':e.description} for e in events]
