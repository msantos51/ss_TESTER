# auth.py - login, tokens, sessões, confirmação de email e palavra-passe.

import re
from datetime import timedelta
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Body, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import or_
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import limiter, security_logger
from ..database import get_db
from ..emails import send_password_reset_email
from ..security import (
    bearer_scheme,
    create_access_token,
    get_current_vendor,
    pwd_context,
    validate_password,
)
from ..templates import password_reset_form, status_page
from ..utils import utcnow

router = APIRouter()

# --------------------------
# Login do vendedor
# --------------------------
@router.post("/login", response_model=schemas.VendorOut)
@limiter.limit("5/minute")
def login(request: Request, credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Autentica um vendedor a partir do email ou username."""

    identifier = credentials.email or credentials.username
    if not identifier or not credentials.password:
        security_logger.warning(f"Login attempt with missing credentials from {request.client.host}")
        raise HTTPException(status_code=400, detail="Email and password required")

    vendor = (
        db.query(models.Vendor)
        .filter(
            or_(
                models.Vendor.email == identifier,
                models.Vendor.name == identifier,
            ),
            models.Vendor.deleted_at == None,
        )
        .first()
    )
    if not vendor or not pwd_context.verify(credentials.password, vendor.hashed_password):
        security_logger.warning(f"Failed login attempt for {identifier} from {request.client.host}")
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not vendor.email_confirmed:
        raise HTTPException(status_code=403, detail="Email not confirmed")
    security_logger.info(f"Successful login for vendor {vendor.id}")
    return vendor


# --------------------------
# Endpoint para obter JWT
# --------------------------
@router.post("/token")
@limiter.limit("10/minute")
async def generate_token(

    request: Request,
    credentials: schemas.UserLogin | None = Body(None),
    db: Session = Depends(get_db),
):
    """Gerar um token de acesso a partir das credenciais fornecidas.

    Suporta tanto ``application/json`` quanto ``application/x-www-form-urlencoded``
    para compatibilidade com o botão *Authorize* do Swagger.
    """

    if credentials is None:
        form = await request.form()
        credentials = schemas.UserLogin(
            username=form.get("username"),
            password=form.get("password") or "",
            force=form.get("force") in {"true", "1", True},
        )

    email = credentials.email or credentials.username
    password = credentials.password
    force = credentials.force

    if not email or not password:
        security_logger.warning(f"Token request with missing credentials from {request.client.host}")
        raise HTTPException(status_code=400, detail="Email and password required")

    vendor = (
        db.query(models.Vendor)
        .filter(models.Vendor.email == email, models.Vendor.deleted_at == None)
        .first()
    )
    if not vendor or not pwd_context.verify(password, vendor.hashed_password):
        security_logger.warning(f"Failed token request for {email} from {request.client.host}")
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not vendor.email_confirmed:
        raise HTTPException(status_code=403, detail="Email not confirmed")

    existing_sessions = (
        db.query(models.VendorSession)
        .filter(models.VendorSession.vendor_id == vendor.id)
        .all()
    )
    if existing_sessions:
        if not force:
            raise HTTPException(status_code=409, detail="Sessão já ativa noutro dispositivo")
        for s in existing_sessions:
            db.delete(s)
        db.commit()

    token = create_access_token({"sub": vendor.id})
    session = models.VendorSession(
        vendor_id=vendor.id, token=token, user_agent=request.headers.get("user-agent")
    )
    db.add(session)
    db.commit()
    return {"access_token": token, "token_type": "bearer"}


# --------------------------
# Gestao de sessões
# --------------------------
@router.get("/vendors/me/sessions")
def list_sessions(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    current: models.Vendor = Depends(get_current_vendor),
    db: Session = Depends(get_db),
):
    token = credentials.credentials
    sessions = (
        db.query(models.VendorSession)
        .filter(models.VendorSession.vendor_id == current.id)
        .all()
    )
    return [
        {
            "id": s.id,
            "user_agent": s.user_agent,
            "created_at": s.created_at.isoformat(),
            "current": s.token == token,
        }
        for s in sessions
    ]


@router.delete("/vendors/me/sessions/{session_id}")
def delete_session(
    session_id: int,
    current: models.Vendor = Depends(get_current_vendor),
    db: Session = Depends(get_db),
):
    session_obj = (
        db.query(models.VendorSession)
        .filter(models.VendorSession.id == session_id, models.VendorSession.vendor_id == current.id)
        .first()
    )
    if not session_obj:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session_obj)
    db.commit()
    return {"status": "ok"}


@router.get("/confirm-email/{token}", response_class=HTMLResponse)
def confirm_email(token: str, db: Session = Depends(get_db)):
    vendor = db.query(models.Vendor).filter(models.Vendor.confirmation_token == token).first()
    if not vendor:
        return HTMLResponse(
            status_code=404,
            content=status_page(
                title="Link Inválido",
                icon="&#10060;",
                heading="Link inválido ou expirado",
                heading_color="#c62828",
                message="Este link de confirmação já não é válido. Se já confirmaste o teu email, podes fazer login normalmente.",
                button_label="Ir para a página inicial",
            ),
        )
    vendor.email_confirmed = True
    vendor.confirmation_token = None
    db.commit()
    return HTMLResponse(content=status_page(
        title="Email Confirmado",
        icon="&#9989;",
        heading="Email confirmado com sucesso!",
        heading_color="#2e7d32",
        message=f"Olá <strong>{vendor.name}</strong>, a tua conta Sunny Sales está agora ativa. Já podes iniciar sessão.",
        button_label="Fazer Login",
    ))


@router.get("/confirm-email-change/{token}", response_class=HTMLResponse)
def confirm_email_change(token: str, db: Session = Depends(get_db)):
    vendor = (
        db.query(models.Vendor)
        .filter(models.Vendor.email_change_token == token)
        .first()
    )
    if not vendor or not vendor.pending_email:
        return HTMLResponse(
            status_code=404,
            content=status_page(
                title="Link Inválido",
                icon="&#10060;",
                heading="Link inválido ou expirado",
                heading_color="#c62828",
                message="Este link de alteração de email já não é válido.",
                button_label="Ir para a página inicial",
            ),
        )

    # Garantir que o novo email continua livre antes de o aplicar
    taken = (
        db.query(models.Vendor)
        .filter(models.Vendor.email == vendor.pending_email, models.Vendor.id != vendor.id)
        .first()
    )
    if taken:
        vendor.pending_email = None
        vendor.email_change_token = None
        db.commit()
        return HTMLResponse(
            status_code=400,
            content=status_page(
                title="Email Indisponível",
                icon="&#10060;",
                heading="Email já em uso",
                heading_color="#c62828",
                message="Este email já está associado a outra conta. Tenta alterar para um email diferente.",
                button_label="Ir para a página inicial",
            ),
        )

    vendor.email = vendor.pending_email
    vendor.pending_email = None
    vendor.email_change_token = None
    vendor.email_confirmed = True
    db.commit()
    return HTMLResponse(content=status_page(
        title="Email Alterado",
        icon="&#9989;",
        heading="Email alterado com sucesso!",
        heading_color="#2e7d32",
        message=f"Olá <strong>{vendor.name}</strong>, o teu email foi atualizado. Usa o novo email para iniciar sessão.",
        button_label="Fazer Login",
    ))


@router.post("/password-reset-request")
@limiter.limit("3/minute")
async def password_reset_request(
    request: Request,
    background_tasks: BackgroundTasks,
    email: str = Body(..., embed=True),
    db: Session = Depends(get_db),
):
    if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email):
        raise HTTPException(status_code=400, detail="Email inválido")

    vendor = (
        db.query(models.Vendor)
        .filter(models.Vendor.email == email, models.Vendor.deleted_at == None)
        .first()
    )
    if vendor:
        token = uuid4().hex
        vendor.password_reset_token = token
        vendor.password_reset_expires = utcnow() + timedelta(hours=2)
        db.commit()
        background_tasks.add_task(
            send_password_reset_email, vendor.name, vendor.email, token
        )
        security_logger.info(f"Password reset requested for {email}")
    else:
        security_logger.info(f"Password reset requested for non-existent email: {email}")
    # Resposta neutra para não revelar se o email existe
    return {"status": "ok"}


@router.post("/password-reset/{token}")
@limiter.limit("5/minute")
async def reset_password(token: str, request: Request, db: Session = Depends(get_db)):
    try:
        form = await request.form()
        new_password = form.get("new_password", "")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid form data")

    vendor = (
        db.query(models.Vendor)
        .filter(
            models.Vendor.password_reset_token == token,
            models.Vendor.password_reset_expires > utcnow(),
        )
        .first()
    )
    if not vendor:
        security_logger.warning(f"Invalid password reset token attempt from {request.client.host}")
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    validate_password(new_password)

    vendor.hashed_password = pwd_context.hash(new_password)
    vendor.password_reset_token = None
    vendor.password_reset_expires = None
    db.commit()
    security_logger.info(f"Password reset successful for vendor {vendor.id}")
    return {"status": "Password reset successfully"}


@router.get("/password-reset/{token}", response_class=HTMLResponse)
async def show_password_reset_form(token: str):
    return password_reset_form(token)
