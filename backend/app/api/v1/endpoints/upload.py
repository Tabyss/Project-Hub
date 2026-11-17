import os
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


@router.post("/")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nama file tidak valid.")

    allowed_extensions = {"jpg", "jpeg", "png", "webp", "gif"}
    ext = file.filename.split(".")[-1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Tipe file tidak didukung.")

    unique_filename = f"{current_user.id}_{uuid.uuid4()}.{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_url = f"{settings.BASE_URL}/{settings.UPLOAD_DIR}/{unique_filename}"
    return JSONResponse(content={"url": file_url})