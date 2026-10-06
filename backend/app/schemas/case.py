from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from app.models.case import CaseStatus
class CaseCreate(BaseModel):
    title: str = Field(min_length=2,max_length=255)
    suspect_name: str = Field(min_length=2,max_length=150)
    description: Optional[str]=None
    priority: str='High'
    claimed_alibi_text: Optional[str]=None
    claimed_alibi_location: Optional[str]=None
    claimed_alibi_lat: Optional[float]=None
    claimed_alibi_lng: Optional[float]=None
    claimed_alibi_start: Optional[datetime]=None
    claimed_alibi_end: Optional[datetime]=None
class CaseUpdate(BaseModel):
    title: Optional[str]=None; suspect_name: Optional[str]=None; description: Optional[str]=None; priority: Optional[str]=None
    claimed_alibi_text: Optional[str]=None; claimed_alibi_location: Optional[str]=None; claimed_alibi_lat: Optional[float]=None; claimed_alibi_lng: Optional[float]=None; claimed_alibi_start: Optional[datetime]=None; claimed_alibi_end: Optional[datetime]=None; status: Optional[CaseStatus]=None
class CaseResponse(BaseModel):
    id: UUID; case_number: str; title: str; suspect_name: str; description: Optional[str]; priority: str
    claimed_alibi_text: Optional[str]; claimed_alibi_location: Optional[str]; claimed_alibi_lat: Optional[float]; claimed_alibi_lng: Optional[float]; claimed_alibi_start: Optional[datetime]; claimed_alibi_end: Optional[datetime]; status: CaseStatus; created_at: datetime
    class Config: from_attributes=True
