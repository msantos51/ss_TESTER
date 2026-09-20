# reviews.py - avaliações por QR code e imagem do QR pessoal do vendedor.

import io
import secrets
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import REVIEW_WEB_URL, limiter
from ..database import get_db
from ..ratings import rating_summary
from ..utils import utcnow

router = APIRouter()

# --------------------------
# Avaliar um vendedor (1 a 5 estrelas) — destino do QR code
# --------------------------
def _validate_and_consume_token(db: Session, vendor_id: int, token: str) -> None:
    """Valida e consome o token de uso único do QR code.

    Levanta 410 se o token não existir, já tiver sido usado ou estiver expirado.
    """
    now = utcnow()
    qr_token = (
        db.query(models.QRToken)
        .filter(
            models.QRToken.token == token,
            models.QRToken.vendor_id == vendor_id,
            models.QRToken.used == False,
            models.QRToken.expires_at > now,
        )
        .with_for_update()
        .first()
    )
    if not qr_token:
        raise HTTPException(
            status_code=410,
            detail="Este QR code já foi utilizado ou expirou. Lê o QR code novamente.",
        )
    qr_token.used = True


@router.post("/vendors/{vendor_id:int}/review-token", include_in_schema=False)
@limiter.limit("30/minute")
def create_review_token(vendor_id: int, request: Request, db: Session = Depends(get_db)):
    """Gera um token de avaliação de uso único (validade 20 min).

    Chamado automaticamente pela página de avaliação ao abrir o URL do QR code.
    O QR code impresso aponta para `/avaliar/{id}` (URL estático); a página
    pede aqui um token fresco a cada nova leitura do QR.
    """
    vendor = (
        db.query(models.Vendor)
        .filter(models.Vendor.id == vendor_id, models.Vendor.deleted_at == None)
        .first()
    )
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendedor não disponível para avaliação")

    now = utcnow()
    # Limpar tokens expirados para não acumular
    db.query(models.QRToken).filter(
        models.QRToken.vendor_id == vendor_id,
        models.QRToken.expires_at < now,
    ).delete()

    token = secrets.token_urlsafe(32)
    db.add(models.QRToken(
        vendor_id=vendor_id,
        token=token,
        expires_at=now + timedelta(minutes=20),
    ))
    db.commit()
    return {"token": token, "expires_in": 1200}


@router.post("/vendors/{vendor_id:int}/reviews", response_model=schemas.ReviewSummary)
@limiter.limit("20/minute")
def create_review(
    vendor_id: int,
    payload: schemas.ReviewCreate,
    t: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """Regista a avaliação de quem leu o QR code do vendedor.

    Exige o token `t` obtido via POST /review-token — gerado automaticamente
    pela página ao abrir o URL estático do QR code impresso.
    """
    vendor = (
        db.query(models.Vendor)
        .filter(models.Vendor.id == vendor_id, models.Vendor.deleted_at == None)
        .first()
    )
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendedor não encontrado")
    _validate_and_consume_token(db, vendor_id, t)
    db.add(models.Review(vendor_id=vendor_id, rating=payload.rating))
    db.commit()

    if not vendor.is_premium:
        # O voto ficou registado, mas a pontuação só se mostra com Premium.
        return schemas.ReviewSummary(average=None, count=0)
    average, count = rating_summary(db, vendor_id)
    return schemas.ReviewSummary(average=average, count=count)


@router.get("/vendors/{vendor_id:int}/reviews/summary", response_model=schemas.ReviewSummary)
def review_summary(vendor_id: int, db: Session = Depends(get_db)):
    """Média e número de avaliações de um vendedor Premium (público).

    Sem Premium o resumo vem vazio: as avaliações continuam a ser guardadas,
    o que o Premium desbloqueia é mostrá-las.
    """
    vendor = (
        db.query(models.Vendor)
        .filter(models.Vendor.id == vendor_id, models.Vendor.deleted_at == None)
        .first()
    )
    if not vendor or not vendor.is_premium:
        return schemas.ReviewSummary(average=None, count=0)
    average, count = rating_summary(db, vendor_id)
    return schemas.ReviewSummary(average=average, count=count)


# --------------------------
# QR code pessoal do vendedor
# --------------------------
@router.get("/vendors/{vendor_id:int}/qr.png", include_in_schema=False)
def vendor_qr(vendor_id: int, db: Session = Depends(get_db)):
    """Imagem PNG do QR code pessoal do vendedor.

    Todos os vendedores têm QR code e recolhem avaliações — o que o Premium
    acrescenta é poder mostrar a pontuação (média e número de estrelas) no
    cartão do mapa e no separador do QR.

    O URL embutido é estático: `/avaliar/{id}` — pode ser impresso e colocado
    na mala. Ao abrir esse URL, a página chama POST /review-token para gerar
    um token de uso único fresco a cada nova leitura do QR.
    """
    vendor = (
        db.query(models.Vendor)
        .filter(models.Vendor.id == vendor_id, models.Vendor.deleted_at == None)
        .first()
    )
    if not vendor:
        raise HTTPException(status_code=404, detail="QR code não disponível")

    try:
        import qrcode
    except ImportError:
        raise HTTPException(status_code=503, detail="Geração de QR indisponível")

    url = f"{REVIEW_WEB_URL}/avaliar/{vendor_id}"
    img = qrcode.make(url)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="image/png",
        headers={"Cache-Control": "public, max-age=86400"},
    )
