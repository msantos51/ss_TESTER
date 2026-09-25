# storage.py - armazenamento dos ficheiros enviados pelos vendedores.
#
# Em produção os ficheiros vão para os buckets do Supabase; sem Supabase
# configurado (desenvolvimento e testes) ficam em pastas locais servidas
# estaticamente pelo FastAPI.

import os
import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from supabase import create_client

from .config import MAX_IMAGE_SIZE, security_logger

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY else None

PROFILE_PHOTO_BUCKET = "profile-photos"
STORY_BUCKET = "stories"
PRODUCT_PHOTO_BUCKET = "product-photos"

PROFILE_PHOTO_DIR = "profile_photos"
STORY_DIR = "stories"
PRODUCT_PHOTO_DIR = "product_photos"
if not supabase:
    os.makedirs(PROFILE_PHOTO_DIR, exist_ok=True)
    os.makedirs(STORY_DIR, exist_ok=True)
    os.makedirs(PRODUCT_PHOTO_DIR, exist_ok=True)

BUCKET_MAP = {
    PROFILE_PHOTO_DIR: PROFILE_PHOTO_BUCKET,
    STORY_DIR: STORY_BUCKET,
    PRODUCT_PHOTO_DIR: PRODUCT_PHOTO_BUCKET,
}


def validate_upload(file: UploadFile, allowed_types: set, allowed_exts: set, label: str = "ficheiro", max_size: int = MAX_IMAGE_SIZE):
    if not file.filename:
        raise HTTPException(status_code=400, detail=f"Nome de {label} requerido")

    filename = Path(file.filename).name
    if filename != file.filename:
        raise HTTPException(status_code=400, detail="Path traversal não permitido")

    ext = os.path.splitext(filename)[1].lower()
    if ext not in allowed_exts or (file.content_type and file.content_type not in allowed_types):
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de {label} inválido. Permitidos: {', '.join(sorted(allowed_exts))}",
        )

    if file.size and file.size > max_size:
        raise HTTPException(
            status_code=413,
            detail=f"Ficheiro demasiado grande. Máximo: {max_size // 1024 // 1024}MB",
        )


def upload_file(upload_file: UploadFile, folder: str, max_size: int = MAX_IMAGE_SIZE) -> str:
    ext = os.path.splitext(upload_file.filename or "")[1].lower()
    file_name = f"{uuid4().hex}{ext}"

    if supabase:
        bucket = BUCKET_MAP.get(folder, folder)
        try:
            content = upload_file.file.read(max_size + 1)
            if len(content) > max_size:
                raise HTTPException(status_code=413, detail="Ficheiro demasiado grande")
            supabase.storage.from_(bucket).upload(
                file_name,
                content,
                {"content-type": upload_file.content_type or "application/octet-stream"},
            )
        except HTTPException:
            raise
        except Exception as exc:
            security_logger.error(f"Error uploading to Supabase: {exc}")
            raise HTTPException(
                status_code=502,
                detail="Erro ao enviar ficheiro para armazenamento",
            )
        return supabase.storage.from_(bucket).get_public_url(file_name)

    safe_folder = Path(folder).resolve()
    file_path = safe_folder / file_name

    if not file_path.resolve().is_relative_to(safe_folder.resolve()):
        raise HTTPException(status_code=403, detail="Invalid file path")

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer, length=8192)
    except Exception as exc:
        security_logger.error(f"Error uploading file: {exc}")
        raise HTTPException(status_code=500, detail="Erro ao enviar ficheiro")

    return f"{folder}/{file_name}"


def delete_file(path_or_url: str) -> None:
    if supabase and path_or_url.startswith("http"):
        for folder, bucket in BUCKET_MAP.items():
            marker = f"/object/public/{bucket}/"
            if marker in path_or_url:
                file_name = path_or_url.split(marker)[-1]
                try:
                    supabase.storage.from_(bucket).remove([file_name])
                except Exception:
                    pass
                return
    try:
        os.remove(path_or_url)
    except OSError:
        pass
