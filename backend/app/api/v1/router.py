from fastapi import APIRouter
from app.api.v1.endpoints import auth, projects, plans, logs, upload, notes

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])

api_router.include_router(plans.router, prefix="/plans", tags=["Roadmap Plans"])

api_router.include_router(logs.router, prefix="/logs", tags=["Changelog / Logs"])

api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])

api_router.include_router(notes.router, prefix="/notes", tags=["notes"])