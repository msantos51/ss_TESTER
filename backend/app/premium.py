# premium.py - regras do Premium, a única compra da plataforma.

from datetime import timedelta

from fastapi import HTTPException
from sqlalchemy.orm import Session

from . import models
from .config import (
    FREE_REACH_RADIUS_M,
    PREMIUM_PLAN,
    PREMIUM_PLAN_ID,
    PREMIUM_REACH_RADIUS_M,
)
from .utils import haversine, utcnow


def refresh_premium_status(vendor: models.Vendor, db: Session) -> models.Vendor:
    """Desliga a flag do Premium quando a validade já passou."""
    if (
        vendor.premium_active
        and vendor.premium_valid_until
        and vendor.premium_valid_until <= utcnow()
    ):
        vendor.premium_active = False
        db.commit()
        db.refresh(vendor)
    return vendor


def apply_premium_payment(vendor: models.Vendor, db: Session) -> models.PaidWeek:
    """Credita 30 dias de Premium e regista o pagamento.

    Comprar com o Premium ainda em vigor acumula o período novo no fim do
    atual em vez de o deitar fora.
    """
    now = utcnow()
    starts_at = (
        vendor.premium_valid_until
        if (
            vendor.premium_active
            and vendor.premium_valid_until
            and vendor.premium_valid_until > now
        )
        else now
    )
    ends_at = starts_at + timedelta(days=PREMIUM_PLAN["days"])

    vendor.premium_active = True
    vendor.premium_valid_until = ends_at
    paid = models.PaidWeek(
        vendor_id=vendor.id,
        start_date=starts_at,
        end_date=ends_at,
        plan=PREMIUM_PLAN_ID,
    )
    db.add(paid)
    return paid


def reach_radius_m(vendor: models.Vendor) -> int:
    """Distância a que este vendedor é encontrado no mapa do banhista."""
    return PREMIUM_REACH_RADIUS_M if vendor.is_premium else FREE_REACH_RADIUS_M


def within_reach(vendor: models.Vendor, lat: float, lng: float) -> bool:
    """O banhista em (lat, lng) está dentro do alcance deste vendedor?

    Um vendedor sem posição no mapa (partilha desligada) continua na lista —
    quem o filtra é o cliente, que já trata os pins sem coordenadas.
    """
    if vendor.current_lat is None or vendor.current_lng is None:
        return True
    distance = haversine(lat, lng, vendor.current_lat, vendor.current_lng)
    return distance <= reach_radius_m(vendor)


def verify_premium(vendor: models.Vendor, db: Session, detail: str):
    """Exige Premium em vigor, com a mensagem certa para o ecrã que chamou."""
    refresh_premium_status(vendor, db)
    if not vendor.is_premium:
        raise HTTPException(status_code=403, detail=detail)
