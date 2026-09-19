# payments.py - checkout do Premium no Stripe, webhook e histórico de faturas.

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import (
    CANCEL_URL,
    PREMIUM_PLAN,
    PREMIUM_PLAN_ID,
    STRIPE_WEBHOOK_SECRET,
    SUCCESS_URL,
    limiter,
    security_logger,
)
from ..database import get_db
from ..premium import apply_premium_payment
from ..security import get_current_vendor

router = APIRouter()

@router.get("/vendors/{vendor_id}/paid-weeks", response_model=list[schemas.PaidWeekOut])
def list_paid_weeks(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    weeks = (
        db.query(models.PaidWeek)
        .filter(models.PaidWeek.vendor_id == vendor_id)
        .order_by(models.PaidWeek.start_date.desc())
        .all()
    )
    return weeks


# --------------------------
# Criar sessão de pagamento no Stripe
# --------------------------
@router.post("/vendors/{vendor_id}/create-checkout-session")
def create_checkout_session(
    vendor_id: int,
    plan: str = PREMIUM_PLAN_ID,
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    """Abre o checkout do Premium — a única compra da plataforma.

    O parâmetro `plan` sobrevive para que clientes antigos não recebam um erro
    de assinatura, mas só aceita "premium": os planos de visibilidade
    deixaram de existir e aparecer no mapa é gratuito.
    """
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if plan != PREMIUM_PLAN_ID:
        raise HTTPException(status_code=400, detail="Invalid plan")
    plan_cfg = PREMIUM_PLAN
    try:
        # Pagamento único (sem renovação automática). O preço é definido em
        # linha (price_data), pelo que não depende de price IDs pré-criados.
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[
                {
                    "price_data": {
                        "currency": "eur",
                        "product_data": {"name": f"Sunny Sales — {plan_cfg['label']}"},
                        "unit_amount": plan_cfg["amount_cents"],
                    },
                    "quantity": 1,
                }
            ],
            success_url=SUCCESS_URL,
            cancel_url=CANCEL_URL,
            customer_email=vendor.email,
            metadata={"vendor_id": vendor_id, "plan": plan},
            client_reference_id=str(vendor_id),
        )
        return {"checkout_url": session.url}
    except Exception as exc:
        # Não expor a mensagem de erro interna do Stripe ao cliente.
        security_logger.error(f"Stripe checkout error for vendor {vendor_id}: {exc}")
        raise HTTPException(status_code=502, detail="Erro ao criar sessão de pagamento")


def _extract_receipt_url(session: dict) -> str | None:
    """Obtém o URL do recibo a partir de uma sessão de checkout Stripe.

    Suporta os dois modos:
    - ``payment`` (atual): o recibo vem da cobrança associada ao payment_intent;
    - ``subscription``/faturas (compat): o recibo é a fatura alojada.
    Devolve ``None`` se não for possível obter (nunca levanta exceção).
    """
    invoice_id = session.get("invoice")
    if invoice_id:
        try:
            invoice = stripe.Invoice.retrieve(invoice_id)
            return invoice.get("hosted_invoice_url") or invoice.get("invoice_pdf")
        except Exception as exc:
            security_logger.warning(f"Error retrieving invoice: {exc}")
            return None

    payment_intent_id = session.get("payment_intent")
    if payment_intent_id:
        try:
            pi = stripe.PaymentIntent.retrieve(payment_intent_id, expand=["latest_charge"])
            charge = pi.get("latest_charge")
            if isinstance(charge, dict):
                return charge.get("receipt_url")
        except Exception as exc:
            security_logger.warning(f"Error retrieving payment intent receipt: {exc}")
            return None

    return None


# --------------------------
# Webhook do Stripe
# --------------------------
@router.post("/stripe/webhook")
@limiter.limit("100/minute")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    if not STRIPE_WEBHOOK_SECRET:
        # Sem segredo configurado não é possível verificar a autenticidade do
        # pedido; rejeitar em vez de confiar em JSON não assinado.
        security_logger.error("STRIPE_WEBHOOK_SECRET not configured")
        raise HTTPException(status_code=500, detail="Webhook not configured")

    payload = await request.body()
    sig = request.headers.get("stripe-signature")

    if not sig:
        security_logger.warning(f"Webhook without signature from {request.client.host}")
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")

    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except Exception as exc:
        security_logger.warning(f"Invalid webhook signature from {request.client.host}: {exc}")
        raise HTTPException(status_code=400, detail="Invalid webhook")

    if event.get("type") == "checkout.session.completed":
        session = event["data"]["object"]
        if session.get("payment_status") != "paid":
            return {"status": "ignored"}

        # Idempotência: o Stripe pode reenviar o mesmo evento. Se já creditámos
        # esta sessão de checkout, não voltamos a creditar o período.
        session_id = session.get("id")
        if session_id:
            already = (
                db.query(models.PaidWeek)
                .filter(models.PaidWeek.stripe_session_id == session_id)
                .first()
            )
            if already:
                security_logger.info(f"Webhook duplicado ignorado para a sessão {session_id}")
                return {"status": "already_processed"}

        metadata = session.get("metadata", {}) or {}
        try:
            vendor_id = int(session.get("client_reference_id") or metadata.get("vendor_id") or 0)
        except (ValueError, TypeError):
            security_logger.warning(f"Invalid vendor_id in webhook from {request.client.host}")
            return {"status": "ignored"}

        plan = metadata.get("plan", PREMIUM_PLAN_ID)
        if plan != PREMIUM_PLAN_ID:
            security_logger.warning(f"Invalid plan in webhook: {plan}")
            return {"status": "ignored"}

        vendor = (
            db.query(models.Vendor)
            .filter(models.Vendor.id == vendor_id, models.Vendor.deleted_at == None)
            .first()
        )
        if vendor:
            try:
                paid = apply_premium_payment(vendor, db)
                paid.stripe_session_id = session_id
                paid.receipt_url = _extract_receipt_url(session)
                db.commit()
                security_logger.info(f"Premium activated for vendor {vendor_id}")
            except Exception as exc:
                security_logger.error(f"Error processing webhook for vendor {vendor_id}: {exc}")
                db.rollback()
        else:
            security_logger.warning(f"Vendor not found in webhook: {vendor_id}")

    return {"status": "success"}
