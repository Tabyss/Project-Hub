from typing import List, Union, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.database import get_db
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    PublicProjectResponse,
    DevProjectResponse,
)
from app.services import project_service
from app.models.technology import ProjectTechnology
from app.models.project import Project
from app.api.deps import get_current_admin, get_optional_admin

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()


# 1. GET FILTER OPTIONS (Diletakkan paling atas agar tidak dianggap sebagai {slug})
@router.get("/filters/options", summary="Get dynamic filter options")
async def get_filter_options(db: AsyncSession = Depends(get_db)):
    tools_res = await db.execute(select(ProjectTechnology.tech_name).distinct())
    tools = [t for t in tools_res.scalars().all() if t]

    projects_res = await db.execute(select(Project.category, Project.role))
    categories = set()
    roles = set()

    for cat_list, role in projects_res.all():
        if cat_list:
            for c in cat_list:
                categories.add(c)
        if role:
            roles.add(role)

    return {
        "categories": sorted(list(categories)),
        "tools": sorted(list(tools)),
        "roles": sorted(list(roles)),
    }


# 2. CREATE PROJECT (ADMIN ONLY)
@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_new_project(
    project_in: ProjectCreate, 
    db: AsyncSession = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    existing_project = await project_service.get_by_slug(
        db, slug=project_in.slug
    )
    if existing_project:
        raise HTTPException(
            status_code=400, detail="Project with this slug already exists."
        )

    return await project_service.create_project(db, project_in)


# 3. GET PROJECTS LIST (PUBLIK: Portfolio | ADMIN: Portfolio / DevDocs)
@router.get(
    "/",
    response_model=List[Union[PublicProjectResponse, DevProjectResponse]],
    summary="Get Projects List (Dual Mode & Filter)"
)
@limiter.limit("60/minute")
async def get_projects_list(
    request: Request,
    mode: str = Query("portfolio", description="portfolio atau devdocs"),
    category: Optional[str] = None,
    tool: Optional[str] = None,
    visibility: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    admin_payload: Optional[dict] = Depends(get_optional_admin)
):
    is_admin = admin_payload is not None
    effective_mode = mode if is_admin else "portfolio"
    effective_visibility = visibility if is_admin else "Public"

    projects = await project_service.get_projects(
        db, 
        skip=skip, 
        limit=limit,
        visibility=effective_visibility,
        is_favorite=is_favorite,
        category=category,
        tool=tool
    )

    if effective_mode == "portfolio":
        return [PublicProjectResponse.model_validate(p) for p in projects]
    return [DevProjectResponse.model_validate(p) for p in projects]


# 4. GET PROJECT BY ID
@router.get("/id/{project_id}", response_model=ProjectResponse)
async def read_project_by_id(project_id: str, db: AsyncSession = Depends(get_db)):
    project = await project_service.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# 5. GET PROJECT BY SLUG
@router.get(
    "/{slug}",
    response_model=Union[PublicProjectResponse, DevProjectResponse],
    summary="Get Project Detail by Slug",
)
@limiter.limit("60/minute")
async def get_project_by_slug(
    request: Request,
    slug: str,
    mode: str = Query("portfolio"),
    db: AsyncSession = Depends(get_db),
    admin_payload: Optional[dict] = Depends(get_optional_admin)
):
    project = await project_service.get_by_slug(db, slug)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_admin = admin_payload is not None

    if not is_admin:
        if project.visibility == "Private":
            raise HTTPException(status_code=403, detail="Access denied")
        return PublicProjectResponse.model_validate(project)

    if mode == "portfolio":
        return PublicProjectResponse.model_validate(project)

    return DevProjectResponse.model_validate(project)


# 6. EDIT PROJECT (ADMIN ONLY)
@router.patch("/{project_id}", response_model=ProjectResponse)
async def edit_project(
    project_id: str, 
    project_in: ProjectUpdate, 
    db: AsyncSession = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    updated_project = await project_service.update_project(db, project_id, project_in)
    if not updated_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated_project


# 7. DELETE PROJECT (ADMIN ONLY)
@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_project(
    project_id: str, 
    db: AsyncSession = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    success = await project_service.delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return None