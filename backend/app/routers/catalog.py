# catalog.py - produtos e stories dos vendedores.

from datetime import timedelta
from math import isfinite

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import (
    ALLOWED_IMAGE_EXTENSIONS,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_STORY_EXTENSIONS,
    ALLOWED_STORY_TYPES,
    MAX_IMAGE_SIZE,
    MAX_PRODUCTS_PER_VENDOR,
    MAX_VIDEO_SIZE,
    PREMIUM_PRODUCTS_DETAIL,
)
from ..database import get_db
from ..premium import verify_premium
from ..security import get_current_vendor, get_current_vendor_optional
from ..storage import (
    PRODUCT_PHOTO_DIR,
    STORY_DIR,
    delete_file,
    upload_file,
    validate_upload,
)
from ..utils import utcnow

router = APIRouter()

MAX_PRODUCT_NAME = 100
MAX_PRODUCT_PRICE = 10000


def _clean_product(name: str, price: float) -> tuple[str, float]:
    """Valida o nome e o preço de um produto antes de o gravar.

    Sem isto aceitava-se um nome só com espaços e qualquer preço — negativo,
    infinito ou NaN — que depois aparecia assim no cartão do mapa.
    """
    name = name.strip()
    if not name or len(name) > MAX_PRODUCT_NAME:
        raise HTTPException(
            status_code=400,
            detail=f"Indica um nome de produto com até {MAX_PRODUCT_NAME} caracteres.",
        )
    if not isfinite(price) or price < 0 or price > MAX_PRODUCT_PRICE:
        raise HTTPException(
            status_code=400,
            detail=f"Indica um preço entre 0 e {MAX_PRODUCT_PRICE} €.",
        )
    return name, round(price, 2)

@router.post("/vendors/{vendor_id}/stories", response_model=schemas.StoryOut)
async def create_story(
    vendor_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    max_size = MAX_VIDEO_SIZE if file.content_type and "video" in file.content_type else MAX_IMAGE_SIZE
    validate_upload(file, ALLOWED_STORY_TYPES, ALLOWED_STORY_EXTENSIONS, "story", max_size)
    media_url = upload_file(file, STORY_DIR, max_size)
    created = utcnow()
    story = models.Story(
        vendor_id=vendor_id,
        media_path=media_url,
        created_at=created,
        expires_at=created + timedelta(hours=2),
    )
    db.add(story)
    db.commit()
    db.refresh(story)
    return {
        "id": story.id,
        "media_url": story.media_path,
        "created_at": story.created_at.isoformat(),
    }


@router.get("/vendors/{vendor_id}/stories", response_model=list[schemas.StoryOut])
def list_stories(vendor_id: int, db: Session = Depends(get_db)):
    now = utcnow()

    expired = (
        db.query(models.Story)
        .filter(models.Story.vendor_id == vendor_id, models.Story.expires_at <= now)
        .all()
    )
    for s in expired:
        delete_file(s.media_path)
        db.delete(s)
    if expired:
        db.commit()

    stories = (
        db.query(models.Story)
        .filter(models.Story.vendor_id == vendor_id, models.Story.expires_at > now)
        .order_by(models.Story.created_at.desc())
        .all()
    )
    return [
        {
            "id": s.id,
            "media_url": s.media_path,
            "created_at": s.created_at.isoformat(),
        }
        for s in stories
    ]


# --------------------------
# Produtos do vendedor
# --------------------------
@router.post("/vendors/{vendor_id}/products", response_model=schemas.ProductOut)
async def create_product(
    vendor_id: int,
    name: str = Form(...),
    price: float = Form(...),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    # Os produtos são uma vantagem Premium: sem ele não aparecem no mapa, por
    # isso nem se criam.
    verify_premium(current_vendor, db, PREMIUM_PRODUCTS_DETAIL)
    name, price = _clean_product(name, price)

    existing_count = db.query(models.Product).filter(models.Product.vendor_id == vendor_id).count()
    if existing_count >= MAX_PRODUCTS_PER_VENDOR:
        raise HTTPException(
            status_code=400,
            detail=f"Limite de {MAX_PRODUCTS_PER_VENDOR} produtos por vendedor atingido",
        )

    photo_path = None
    if photo:
        validate_upload(photo, ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_EXTENSIONS, "foto do produto")
        photo_path = upload_file(photo, PRODUCT_PHOTO_DIR)

    product = models.Product(
        vendor_id=vendor_id,
        name=name,
        price=price,
        photo=photo_path,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/vendors/{vendor_id}/products", response_model=list[schemas.ProductOut])
def list_products(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_vendor: models.Vendor | None = Depends(get_current_vendor_optional),
):
    """Produtos de um vendedor.

    Em público só os de quem tem Premium: sem ele os produtos ficam guardados
    mas não se mostram no cartão do mapa. O próprio vendedor vê sempre os seus
    (é assim que a app os lista para ele os poder apagar).
    """
    is_owner = current_vendor is not None and current_vendor.id == vendor_id
    if not is_owner:
        vendor = (
            db.query(models.Vendor)
            .filter(models.Vendor.id == vendor_id, models.Vendor.deleted_at == None)
            .first()
        )
        if not vendor or not vendor.is_premium:
            return []
    return (
        db.query(models.Product)
        .filter(models.Product.vendor_id == vendor_id)
        .order_by(models.Product.created_at.desc())
        .all()
    )


@router.put("/vendors/{vendor_id}/products/{product_id}", response_model=schemas.ProductOut)
async def update_product(
    vendor_id: int,
    product_id: int,
    name: str = Form(...),
    price: float = Form(...),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    product = (
        db.query(models.Product)
        .filter(models.Product.id == product_id, models.Product.vendor_id == vendor_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    verify_premium(current_vendor, db, PREMIUM_PRODUCTS_DETAIL)
    name, price = _clean_product(name, price)

    if photo:
        validate_upload(photo, ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_EXTENSIONS, "foto do produto")
        new_photo_path = upload_file(photo, PRODUCT_PHOTO_DIR)
        if product.photo:
            delete_file(product.photo)
        product.photo = new_photo_path

    product.name = name
    product.price = price
    db.commit()
    db.refresh(product)
    return product


@router.delete("/vendors/{vendor_id}/products/{product_id}")
def delete_product(
    vendor_id: int,
    product_id: int,
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    product = (
        db.query(models.Product)
        .filter(models.Product.id == product_id, models.Product.vendor_id == vendor_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if product.photo:
        delete_file(product.photo)
    db.delete(product)
    db.commit()
    return {"ok": True}
