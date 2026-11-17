import os
import re
import uuid
from typing import Sequence, Optional, List, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.note import Note, Folder
from app.schemas.note import NoteCreate, NoteUpdate, FolderCreate, FolderUpdate


class NoteService:
    @staticmethod
    def _delete_attached_images(content: str):
        image_urls = re.findall(r'!\[.*?\]\((.*?)\)', content)
        for url in image_urls:
            if "/uploads/" in url:
                filename = url.split("/uploads/")[-1]
                file_path = os.path.join("uploads", filename)
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except Exception as e:
                        print(f"Gagal menghapus file gambar {file_path}: {e}")

    # ==================== FOLDER OPERATIONS ====================

    @staticmethod
    async def get_folders(db: AsyncSession, user_id: uuid.UUID) -> List[Dict[str, Any]]:
        stmt = (
            select(Folder, func.count(Note.id).label("notes_count"))
            .outerjoin(
                Note,
                and_(Folder.id == Note.folder_id, Note.user_id == user_id),
            )
            .where(Folder.user_id == user_id)
            .group_by(Folder.id)
            .order_by(Folder.name.asc())
        )
        result = await db.execute(stmt)

        folders_with_count = []
        for folder, count in result.all():
            folders_with_count.append(
                {
                    "id": folder.id,
                    "name": folder.name,
                    "color": folder.color,
                    "created_at": folder.created_at,
                    "updated_at": folder.updated_at,
                    "notes_count": count,
                }
            )

        return folders_with_count

    @staticmethod
    async def get_folder_by_id(
        db: AsyncSession, folder_id: uuid.UUID, user_id: uuid.UUID
    ) -> Optional[Folder]:
        stmt = select(Folder).where(
            Folder.id == folder_id, Folder.user_id == user_id
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def create_folder(
        db: AsyncSession, folder_in: FolderCreate, user_id: uuid.UUID
    ) -> Folder:
        db_folder = Folder(**folder_in.model_dump(), user_id=user_id)
        db.add(db_folder)
        await db.commit()
        await db.refresh(db_folder)
        return db_folder

    @staticmethod
    async def update_folder(
        db: AsyncSession,
        folder_id: uuid.UUID,
        folder_in: FolderUpdate,
        user_id: uuid.UUID,
    ) -> Optional[Folder]:
        db_folder = await NoteService.get_folder_by_id(db, folder_id, user_id)
        if not db_folder:
            return None

        update_data = folder_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_folder, key, value)

        await db.commit()
        await db.refresh(db_folder)
        return db_folder

    @staticmethod
    async def delete_folder(
        db: AsyncSession, folder_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        db_folder = await NoteService.get_folder_by_id(db, folder_id, user_id)
        if not db_folder:
            return False

        await db.delete(db_folder)
        await db.commit()
        return True

    # ==================== NOTE OPERATIONS ====================

    @staticmethod
    async def get_notes(
        db: AsyncSession,
        user_id: uuid.UUID,
        folder_id: Optional[uuid.UUID] = None,
        is_pinned: Optional[bool] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Sequence[Note]:
        stmt = (
            select(Note)
            .options(joinedload(Note.folder))
            .where(Note.user_id == user_id)
            .order_by(Note.is_pinned.desc(), Note.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        if folder_id is not None:
            stmt = stmt.where(Note.folder_id == folder_id)
        if is_pinned is not None:
            stmt = stmt.where(Note.is_pinned == is_pinned)
        if search:
            stmt = stmt.where(
                (Note.content.ilike(f"%{search}%")) | (Note.title.ilike(f"%{search}%"))
            )

        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_note_by_id(
        db: AsyncSession, note_id: uuid.UUID, user_id: uuid.UUID
    ) -> Optional[Note]:
        stmt = (
            select(Note)
            .options(joinedload(Note.folder))
            .where(Note.id == note_id, Note.user_id == user_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def create_note(
        db: AsyncSession, note_in: NoteCreate, user_id: uuid.UUID
    ) -> Note:
        # Pastikan folder_id (jika dipilih) benar-benar milik user yang bersangkutan
        if note_in.folder_id is not None:
            folder = await NoteService.get_folder_by_id(db, note_in.folder_id, user_id)
            if not folder:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Folder tidak ditemukan atau bukan milik Anda.",
                )

        db_note = Note(**note_in.model_dump(), user_id=user_id)
        db.add(db_note)
        await db.commit()
        return await NoteService.get_note_by_id(db, db_note.id, user_id)  # type: ignore

    @staticmethod
    async def update_note(
        db: AsyncSession,
        note_id: uuid.UUID,
        note_in: NoteUpdate,
        user_id: uuid.UUID,
    ) -> Optional[Note]:
        db_note = await NoteService.get_note_by_id(db, note_id, user_id)
        if not db_note:
            return None

        update_data = note_in.model_dump(exclude_unset=True)
        if "folder_id" in update_data and update_data["folder_id"] is not None:
            folder = await NoteService.get_folder_by_id(
                db, update_data["folder_id"], user_id
            )
            if not folder:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Folder tujuan tidak ditemukan atau bukan milik Anda.",
                )

        for key, value in update_data.items():
            setattr(db_note, key, value)

        await db.commit()
        return await NoteService.get_note_by_id(db, note_id, user_id)

    @staticmethod
    async def delete_note(
        db: AsyncSession, note_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        db_note = await NoteService.get_note_by_id(db, note_id, user_id)
        if not db_note:
            return False

        if db_note.content:
            NoteService._delete_attached_images(db_note.content)

        await db.delete(db_note)
        await db.commit()
        return True