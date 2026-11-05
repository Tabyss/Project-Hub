import os
import re
import uuid
from typing import Sequence, Optional, List, Dict, Any
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.note import Note, Folder
from app.schemas.note import NoteCreate, NoteUpdate, FolderCreate, FolderUpdate


class NoteService:
    # Helper untuk menghapus file gambar fisik di server saat note dihapus
    @staticmethod
    def _delete_attached_images(content: str):
        # Cari semua pattern ![alt](/uploads/filename.ext) atau URL lokal
        image_urls = re.findall(r'!\[.*?\]\((.*?)\)', content)
        for url in image_urls:
            if "/uploads/" in url:
                # Ambil nama file saja
                filename = url.split("/uploads/")[-1]
                file_path = os.path.join("uploads", filename)
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except Exception as e:
                        print(f"Gagal menghapus file gambar {file_path}: {e}")

    # ==================== FOLDER OPERATIONS ====================

    @staticmethod
    async def get_folders(db: AsyncSession) -> List[Dict[str, Any]]:
        # Query folder gabungan dengan COUNT(notes.id)
        stmt = (
            select(Folder, func.count(Note.id).label("notes_count"))
            .outerjoin(Note, Folder.id == Note.folder_id)
            .group_by(Folder.id)
            .order_by(Folder.name.asc())
        )
        result = await db.execute(stmt)
        
        folders_with_count = []
        for folder, count in result.all():
            folder_dict = {
                "id": folder.id,
                "name": folder.name,
                "color": folder.color,
                "created_at": folder.created_at,
                "updated_at": folder.updated_at,
                "notes_count": count
            }
            folders_with_count.append(folder_dict)
            
        return folders_with_count

    @staticmethod
    async def get_folder_by_id(db: AsyncSession, folder_id: uuid.UUID) -> Optional[Folder]:
        stmt = select(Folder).where(Folder.id == folder_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def create_folder(db: AsyncSession, folder_in: FolderCreate) -> Folder:
        db_folder = Folder(**folder_in.model_dump())
        db.add(db_folder)
        await db.commit()
        await db.refresh(db_folder)
        return db_folder

    @staticmethod
    async def update_folder(
        db: AsyncSession, folder_id: uuid.UUID, folder_in: FolderUpdate
    ) -> Optional[Folder]:
        db_folder = await NoteService.get_folder_by_id(db, folder_id)
        if not db_folder:
            return None

        update_data = folder_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_folder, key, value)

        await db.commit()
        await db.refresh(db_folder)
        return db_folder

    @staticmethod
    async def delete_folder(db: AsyncSession, folder_id: uuid.UUID) -> bool:
        db_folder = await NoteService.get_folder_by_id(db, folder_id)
        if not db_folder:
            return False

        await db.delete(db_folder)
        await db.commit()
        return True

    # ==================== NOTE OPERATIONS ====================

    @staticmethod
    async def get_notes(
        db: AsyncSession,
        folder_id: Optional[uuid.UUID] = None,
        is_pinned: Optional[bool] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Sequence[Note]:
        stmt = (
            select(Note)
            .options(joinedload(Note.folder))
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
    async def get_note_by_id(db: AsyncSession, note_id: uuid.UUID) -> Optional[Note]:
        stmt = (
            select(Note)
            .options(joinedload(Note.folder))
            .where(Note.id == note_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def create_note(db: AsyncSession, note_in: NoteCreate) -> Note:
        db_note = Note(**note_in.model_dump())
        db.add(db_note)
        await db.commit()
        return await NoteService.get_note_by_id(db, db_note.id)  # type: ignore

    @staticmethod
    async def update_note(
        db: AsyncSession, note_id: uuid.UUID, note_in: NoteUpdate
    ) -> Optional[Note]:
        db_note = await NoteService.get_note_by_id(db, note_id)
        if not db_note:
            return None

        update_data = note_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_note, key, value)

        await db.commit()
        return await NoteService.get_note_by_id(db, note_id)

    @staticmethod
    async def delete_note(db: AsyncSession, note_id: uuid.UUID) -> bool:
        db_note = await NoteService.get_note_by_id(db, note_id)
        if not db_note:
            return False

        # 1. Hapus file gambar terkait di disk backend jika ada
        if db_note.content:
            NoteService._delete_attached_images(db_note.content)

        # 2. Hapus catatan dari DB
        await db.delete(db_note)
        await db.commit()
        return True