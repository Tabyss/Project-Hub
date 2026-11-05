import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.note import (
    NoteCreate,
    NoteUpdate,
    NoteResponse,
    FolderCreate,
    FolderUpdate,
    FolderResponse,
)
from app.services.note_service import NoteService
from app.api.deps import get_current_admin

router = APIRouter()

# =====================================================================
# FOLDER ENDPOINTS
# =====================================================================

@router.get("/folders", response_model=List[FolderResponse], summary="List all folders")
async def list_folders(db: AsyncSession = Depends(get_db)):
    return await NoteService.get_folders(db)


@router.post(
    "/folders",
    response_model=FolderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create folder (Admin Only)",
)
async def create_folder(
    folder_in: FolderCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    return await NoteService.create_folder(db, folder_in)


@router.patch(
    "/folders/{folder_id}",
    response_model=FolderResponse,
    summary="Update folder (Admin Only)",
)
async def update_folder(
    folder_id: uuid.UUID,
    folder_in: FolderUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    updated = await NoteService.update_folder(db, folder_id, folder_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Folder not found")
    return updated


@router.delete(
    "/folders/{folder_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete folder (Admin Only)",
)
async def delete_folder(
    folder_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    success = await NoteService.delete_folder(db, folder_id)
    if not success:
        raise HTTPException(status_code=404, detail="Folder not found")
    return None


# =====================================================================
# NOTE ENDPOINTS
# =====================================================================

@router.get("/", response_model=List[NoteResponse], summary="Get all notes (Pinned first)")
async def list_notes(
    folder_id: Optional[uuid.UUID] = Query(None, description="Filter berdasarkan Folder ID"),
    is_pinned: Optional[bool] = Query(None, description="Filter catatan yang di-pin"),
    search: Optional[str] = Query(None, description="Pencarian kata kunci konten"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await NoteService.get_notes(
        db, folder_id=folder_id, is_pinned=is_pinned, search=search, skip=skip, limit=limit
    )


@router.get("/{note_id}", response_model=NoteResponse, summary="Get single note detail")
async def get_note_detail(note_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    note = await NoteService.get_note_by_id(db, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.post(
    "/",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create note (Admin Only)",
)
async def create_note(
    note_in: NoteCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    return await NoteService.create_note(db, note_in)


@router.patch(
    "/{note_id}",
    response_model=NoteResponse,
    summary="Update note / Auto-save (Admin Only)",
)
async def update_note(
    note_id: uuid.UUID,
    note_in: NoteUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    updated = await NoteService.update_note(db, note_id, note_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Note not found")
    return updated


@router.delete(
    "/{note_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete note (Admin Only)",
)
async def delete_note(
    note_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    success = await NoteService.delete_note(db, note_id)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")
    return None