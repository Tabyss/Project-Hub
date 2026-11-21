import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.bookmark import (
    Bookmark,
    BookmarkCategory,
    BookmarkCheckpoint,
    BookmarkTypeEnum,
)
from app.schemas.bookmark import (
    BookmarkCategoryCreate,
    BookmarkCategoryUpdate,
    BookmarkCategoryResponse,
    BookmarkCreate,
    BookmarkUpdate,
    BookmarkResponse,
    CheckpointCreate,
    CheckpointResponse,
)

router = APIRouter()


# ==================== CATEGORY CRUD ====================

@router.get("/categories", response_model=List[BookmarkCategoryResponse])
async def list_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = (
        select(BookmarkCategory, func.count(Bookmark.id).label("bookmarks_count"))
        .outerjoin(
            Bookmark,
            and_(
                BookmarkCategory.id == Bookmark.category_id,
                Bookmark.user_id == current_user.id,
            ),
        )
        .where(BookmarkCategory.user_id == current_user.id)
        .group_by(BookmarkCategory.id)
        .order_by(BookmarkCategory.name.asc())
    )
    res = await db.execute(stmt)
    return [
        {
            "id": cat.id,
            "name": cat.name,
            "color": cat.color,
            "created_at": cat.created_at,
            "bookmarks_count": count,
        }
        for cat, count in res.all()
    ]


@router.post("/categories", response_model=BookmarkCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    cat_in: BookmarkCategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cat = BookmarkCategory(**cat_in.model_dump(), user_id=current_user.id)
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return {
        "id": cat.id,
        "name": cat.name,
        "color": cat.color,
        "created_at": cat.created_at,
        "bookmarks_count": 0,
    }


@router.patch("/categories/{category_id}", response_model=BookmarkCategoryResponse)
async def update_category(
    category_id: uuid.UUID,
    cat_in: BookmarkCategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(BookmarkCategory).where(
        BookmarkCategory.id == category_id,
        BookmarkCategory.user_id == current_user.id,
    )
    cat = (await db.execute(stmt)).scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")

    for k, v in cat_in.model_dump(exclude_unset=True).items():
        setattr(cat, k, v)
    await db.commit()
    await db.refresh(cat)
    return {
        "id": cat.id,
        "name": cat.name,
        "color": cat.color,
        "created_at": cat.created_at,
        "bookmarks_count": 0,
    }


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(BookmarkCategory).where(
        BookmarkCategory.id == category_id,
        BookmarkCategory.user_id == current_user.id,
    )
    cat = (await db.execute(stmt)).scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
    await db.delete(cat)
    await db.commit()


# ==================== BOOKMARK CRUD ====================

@router.get("/", response_model=List[BookmarkResponse])
async def list_bookmarks(
    category_id: Optional[uuid.UUID] = None,
    bookmark_type: Optional[BookmarkTypeEnum] = None,
    search: Optional[str] = None,
    sort_by: str = Query("updated_at", description="updated_at atau created_at"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = (
        select(Bookmark)
        .options(
            selectinload(Bookmark.category),
            selectinload(Bookmark.checkpoints),
        )
        .where(Bookmark.user_id == current_user.id)
    )

    if category_id:
        stmt = stmt.where(Bookmark.category_id == category_id)
    if bookmark_type:
        stmt = stmt.where(Bookmark.bookmark_type == bookmark_type)
    if search:
        stmt = stmt.where(
            (Bookmark.title.ilike(f"%{search}%"))
            | (Bookmark.text.ilike(f"%{search}%"))
            | (Bookmark.url.ilike(f"%{search}%"))
        )

    order_col = Bookmark.created_at.desc() if sort_by == "created_at" else Bookmark.updated_at.desc()
    stmt = stmt.order_by(order_col)

    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/", response_model=BookmarkResponse, status_code=status.HTTP_201_CREATED)
async def create_bookmark(
    bm_in: BookmarkCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = bm_in.model_dump(exclude={"initial_page"})
    bm = Bookmark(**data, user_id=current_user.id)
    db.add(bm)
    await db.flush()

    # Jika tipe buku dan halaman awal diisi, langsung buat titik timeline pertama
    if bm_in.bookmark_type == BookmarkTypeEnum.book and bm_in.initial_page:
        first_cp = BookmarkCheckpoint(
            bookmark_id=bm.id,
            page_number=bm_in.initial_page,
            page_url=f"{bm.url}#page={bm_in.initial_page}",
            note="Mulai membaca",
        )
        db.add(first_cp)

    await db.commit()

    stmt = (
        select(Bookmark)
        .options(selectinload(Bookmark.category), selectinload(Bookmark.checkpoints))
        .where(Bookmark.id == bm.id)
    )
    return (await db.execute(stmt)).scalar_one()


@router.patch("/{bookmark_id}", response_model=BookmarkResponse)
async def update_bookmark(
    bookmark_id: uuid.UUID,
    bm_in: BookmarkUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = (
        select(Bookmark)
        .options(selectinload(Bookmark.category), selectinload(Bookmark.checkpoints))
        .where(Bookmark.id == bookmark_id, Bookmark.user_id == current_user.id)
    )
    bm = (await db.execute(stmt)).scalar_one_or_none()
    if not bm:
        raise HTTPException(status_code=404, detail="Bookmark tidak ditemukan")

    for k, v in bm_in.model_dump(exclude_unset=True).items():
        setattr(bm, k, v)

    await db.commit()
    await db.refresh(bm)
    return bm


@router.delete("/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bookmark(
    bookmark_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Bookmark).where(
        Bookmark.id == bookmark_id, Bookmark.user_id == current_user.id
    )
    bm = (await db.execute(stmt)).scalar_one_or_none()
    if not bm:
        raise HTTPException(status_code=404, detail="Bookmark tidak ditemukan")
    await db.delete(bm)
    await db.commit()


# ==================== BOOK PROGRESS TIMELINE ====================

@router.post("/{bookmark_id}/checkpoints", response_model=CheckpointResponse, status_code=status.HTTP_201_CREATED)
async def add_checkpoint(
    bookmark_id: uuid.UUID,
    cp_in: CheckpointCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Bookmark).where(
        Bookmark.id == bookmark_id, Bookmark.user_id == current_user.id
    )
    bm = (await db.execute(stmt)).scalar_one_or_none()
    if not bm:
        raise HTTPException(status_code=404, detail="Bookmark tidak ditemukan")

    resolved_url = cp_in.page_url or f"{bm.url}#page={cp_in.page_number}"
    cp = BookmarkCheckpoint(
        bookmark_id=bm.id,
        page_number=cp_in.page_number,
        page_url=resolved_url,
        note=cp_in.note,
    )
    db.add(cp)
    await db.commit()
    await db.refresh(cp)
    return cp


@router.delete("/{bookmark_id}/checkpoints/{checkpoint_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_checkpoint(
    bookmark_id: uuid.UUID,
    checkpoint_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = (
        select(BookmarkCheckpoint)
        .join(Bookmark, BookmarkCheckpoint.bookmark_id == Bookmark.id)
        .where(
            BookmarkCheckpoint.id == checkpoint_id,
            Bookmark.id == bookmark_id,
            Bookmark.user_id == current_user.id,
        )
    )
    cp = (await db.execute(stmt)).scalar_one_or_none()
    if not cp:
        raise HTTPException(status_code=404, detail="Checkpoint tidak ditemukan")
    await db.delete(cp)
    await db.commit()