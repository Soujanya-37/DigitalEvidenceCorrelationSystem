from fastapi import APIRouter
from app.api.endpoints import auth,cases,evidence,timeline,analysis,reports
api_router=APIRouter()
api_router.include_router(auth.router,prefix='/auth',tags=['Authentication'])
api_router.include_router(cases.router,prefix='/cases',tags=['Cases'])
api_router.include_router(evidence.router,prefix='/evidence',tags=['Evidence'])
api_router.include_router(timeline.router,prefix='/timeline',tags=['Timeline'])
api_router.include_router(analysis.router,prefix='/analysis',tags=['AI Analysis'])
api_router.include_router(reports.router,prefix='/reports',tags=['Reports'])
