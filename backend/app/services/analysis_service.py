from __future__ import annotations
import math, re
from sqlalchemy.orm import Session
from app.models.case import Case
from app.models.timeline_event import TimelineEvent
from app.models.verification_result import AlibiVerificationResult, Verdict
from app.ai.model_service import predict_support_probability, load_model

SOURCE_WEIGHTS={
    'gps':1.0,'cctv':1.0,'video':0.9,'image':0.9,'device':0.85,
    'transaction':0.8,'bank':0.8,'phone_log':0.75,'call_record':0.7,
    'sms':0.65,'email':0.6,'social_media':0.5,'audio':0.5,'document':0.5,'other':0.5,
}
GPS_TOLERANCE_M=150.0

def _norm(value):
    if not value:return ''
    return re.sub(r'\s+',' ',re.sub(r'[^a-z0-9]+',' ',str(value).lower())).strip()

def _location_matches(claimed,observed):
    a,b=_norm(claimed),_norm(observed)
    return bool(a and b and (a==b or a in b or b in a))

def _distance_m(lat1,lon1,lat2,lon2):
    r=6371000.0
    p1,p2=math.radians(lat1),math.radians(lat2)
    dp=math.radians(lat2-lat1); dl=math.radians(lon2-lon1)
    h=math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*r*math.asin(math.sqrt(min(1,h)))

def run_analysis(db:Session,case:Case,user_id):
    events=db.query(TimelineEvent).filter(TimelineEvent.case_id==case.id).order_by(TimelineEvent.event_timestamp.asc()).all()
    start,end=case.claimed_alibi_start,case.claimed_alibi_end
    matched=conflicting=neutral=0; weighted_match=weighted_conflict=0.0
    sources={}; event_results=[]; evidence_sources=set()
    for event in events:
        source=event.source_type.value; weight=SOURCE_WEIGHTS.get(source,0.5); evidence_sources.add(source)
        bucket=sources.setdefault(source,{'matched':0,'conflicting':0,'neutral':0,'total':0,'weight':weight})
        bucket['total']+=1
        in_window=bool(start and end and start<=event.event_timestamp<=end)
        status='neutral'; reason='Outside the claimed alibi time window.'; distance_m=None
        if in_window:
            if event.location_lat is not None and event.location_lng is not None and case.claimed_alibi_lat is not None and case.claimed_alibi_lng is not None:
                distance_m=_distance_m(case.claimed_alibi_lat,case.claimed_alibi_lng,event.location_lat,event.location_lng)
                if distance_m<=GPS_TOLERANCE_M:
                    status='matched'; reason=f'GPS position is {distance_m:.1f} m from the claimed location (tolerance {GPS_TOLERANCE_M:.0f} m).'
                else:
                    status='conflicting'; reason=f'GPS position is {distance_m:.1f} m from the claimed location, beyond the {GPS_TOLERANCE_M:.0f} m tolerance.'
            elif case.claimed_alibi_location and event.location_label:
                if _location_matches(case.claimed_alibi_location,event.location_label):
                    status='matched'; reason='Observed evidence location matches the claimed alibi location.'
                else:
                    status='conflicting'; reason='Observed evidence location differs from the claimed alibi location.'
            elif not case.claimed_alibi_location and not case.claimed_alibi_lat:
                status='neutral'; reason='Alibi location was not specified, so location correlation cannot be performed.'
            else:
                status='neutral'; reason='Evidence has a timestamp but no usable location information.'
        if status=='matched': matched+=1; bucket['matched']+=1; weighted_match+=weight
        elif status=='conflicting': conflicting+=1; bucket['conflicting']+=1; weighted_conflict+=weight
        else: neutral+=1; bucket['neutral']+=1
        location_match = 1 if status == 'matched' else 0
        ml_probability = predict_support_probability({'source_type':source,'in_window':1 if in_window else 0,'has_location':1 if event.location_label else 0,'location_match':location_match,'has_coordinates':1 if event.location_lat is not None and event.location_lng is not None else 0,'distance_m':distance_m})
        event_results.append({'event_id':str(event.id),'timestamp':event.event_timestamp.isoformat(),'source':source,'location':event.location_label,'latitude':event.location_lat,'longitude':event.location_lng,'distance_m':round(distance_m,1) if distance_m is not None else None,'status':status,'reason':reason,'ml_support_probability':ml_probability})
    relevant=matched+conflicting; weighted_relevant=weighted_match+weighted_conflict
    score = (
    round((weighted_match / weighted_relevant) * 100, 1)
    if weighted_relevant
    else None
)
    if relevant == 0:
        verdict = Verdict.INCONCLUSIVE
    elif score >= 80:
        verdict = Verdict.SUPPORTED
    elif score <= 40:
        verdict = Verdict.CONTRADICTED
    else:
        verdict = Verdict.INCONCLUSIVE
    distinct_relevant_sources=len({e['source'] for e in event_results if e['status'] in ('matched','conflicting')})
    corroboration=min(100.0,round(distinct_relevant_sources/3*100,1)) if distinct_relevant_sources else 0.0
    result=db.query(AlibiVerificationResult).filter_by(case_id=case.id).first()
    if not result:
        result=AlibiVerificationResult(case_id=case.id,generated_by=user_id); db.add(result)
    result.confidence_score=score; result.verdict=verdict; result.matched_events_count=matched; result.conflicting_events_count=conflicting
    result.analysis_summary={'sources':sources,'neutral_events':neutral,'relevant_events':relevant,'weighted_match':round(weighted_match,3),'weighted_conflict':round(weighted_conflict,3),'corroboration_score':corroboration,'distinct_relevant_sources':distinct_relevant_sources,'gps_tolerance_m':GPS_TOLERANCE_M,'model_available':load_model() is not None,'method':'weighted multi-source time-window + location correlation. GPS coordinates use a 150 m tolerance; named locations use normalized text matching. Unusable/out-of-window evidence is neutral.','event_results':event_results,'limitations':['A photo/video without a trustworthy timestamp or location cannot by itself establish presence.','OCR-derived timestamps are treated as extracted metadata, not ground truth.','The confidence score is an explainable correlation score, not a legal conclusion.']}
    case.status='under_review' if events else 'open'; db.commit(); db.refresh(result); return result
