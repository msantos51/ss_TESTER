# admin.py - operações reservadas a administradores (X-Admin-Token).

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..premium import apply_premium_payment
from ..security import get_admin

router = APIRouter()

# --------------------------
# Endpoint para creditar Premium manualmente (ex.: pagamento por transferência)
# Apenas acessível por administradores - nunca pelo próprio vendedor.
# --------------------------
@router.post("/vendors/{vendor_id}/activate-premium")
def activate_premium_manual(
    vendor_id: int,
    db: Session = Depends(get_db),
    admin: bool = Depends(get_admin),
):
    vendor = (
        db.query(models.Vendor)
        .filter(models.Vendor.id == vendor_id, models.Vendor.deleted_at == None)
        .first()
    )
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    apply_premium_payment(vendor, db)
    db.commit()
    return {"status": "activated"}


# --------------------------
# Admin endpoints simples
# --------------------------
@router.get("/admin/vendors", response_model=list[schemas.VendorOut])
def admin_list_vendors(db: Session = Depends(get_db), admin: bool = Depends(get_admin)):
    vendors = db.query(models.Vendor).filter(models.Vendor.deleted_at == None).all()
    return vendors

# Revoga o Premium de um vendedor — o contrário de activate-premium, para
# devoluções e estornos. Não tira ninguém do mapa: aparecer é gratuito.
@router.post("/admin/vendors/{vendor_id}/revoke-premium")
def admin_revoke_premium(vendor_id: int, db: Session = Depends(get_db), admin: bool = Depends(get_admin)):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.premium_active = False
    vendor.premium_valid_until = None
    db.commit()
    return {"status": "revoked"}
