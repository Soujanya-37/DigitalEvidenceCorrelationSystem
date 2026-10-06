from uuid import UUID
from pathlib import Path
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.api.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.evidence import Evidence
from app.services.evidence_service import upload_evidence, process_evidence

router = APIRouter()

def _serialize(e):
    meta = e.file_metadata or {}
    return {
        'id': str(e.id), 'case_id': str(e.case_id), 'evidence_type': e.evidence_type.value,
        'original_filename': e.original_filename, 'description': e.description, 'mime_type': e.mime_type,
        'file_size': e.file_size, 'sha256_hash': e.sha256_hash, 'upload_status': e.upload_status.value,
        'uploaded_at': e.uploaded_at, 'processed_at': e.processed_at,
        'provenance': meta.get('provenance', 'Investigator upload'),
        'acquisition_method': meta.get('acquisition_method', 'Digital file upload'),
        'metadata': meta.get('media') or {},
        'timeline_events_created': meta.get('timeline_events_created', 0),
    }

@router.post('/upload')
async def upload_evidence_file(
    case_id: UUID = Form(...), evidence_type: str = Form(...), description: str = Form(''),
    event_timestamp: str = Form(''), event_location: str = Form(''),
    provenance: str = Form('Investigator upload'), acquisition_method: str = Form('Digital file upload'),
    file: UploadFile = File(...), db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.services.evidence_service import _parse_dt
    parsed_timestamp = _parse_dt(event_timestamp) if event_timestamp.strip() else None
    e = upload_evidence(db, case_id, current_user, file, evidence_type, description, parsed_timestamp, event_location.strip() or None, provenance.strip(), acquisition_method.strip())
    return {**_serialize(e), 'message': 'Evidence uploaded and processed successfully', 'evidence_id': str(e.id), 'storage_path': e.storage_path}

@router.get('/case/{case_id}')
def list_case_evidence(case_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.case import Case
    if not db.query(Case).filter_by(id=case_id).first(): raise HTTPException(404, 'Case not found')
    return [_serialize(e) for e in db.query(Evidence).filter(Evidence.case_id == case_id).order_by(Evidence.uploaded_at.desc()).all()]

@router.get('/{evidence_id}/file')
def get_evidence_file(evidence_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    e = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not e: raise HTTPException(404, 'Evidence not found')
    path = Path(e.storage_path)
    if not path.exists(): raise HTTPException(404, 'Stored evidence file not found')
    media_type = e.mime_type or 'application/octet-stream'
    return FileResponse(path, media_type=media_type, filename=e.original_filename, content_disposition_type='inline')

@router.post('/{evidence_id}/process')
def process_evidence_file(evidence_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    e = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not e: raise HTTPException(404, 'Evidence not found')
    process_evidence(db, e); return _serialize(e)
