# security.py - autenticação: palavras-passe, tokens JWT e dependências.

import base64
import os
import hashlib
import hmac
import json
import time
from uuid import uuid4

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from . import models
from .config import ADMIN_TOKEN, security_logger
from .database import get_db

# Contexto para hash de password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def validate_password(password: str):
    if len(password) < 8 or password.lower() == password or not any(c.isdigit() for c in password):
        raise HTTPException(
            status_code=400,
            detail="Password deve ter pelo menos 8 caracteres, uma letra maiúscula e um número",
        )


# --------------------------
# Autenticação JWT simples
# --------------------------
SECRET_KEY = os.getenv("SECRET_KEY", "")
if not SECRET_KEY:
    import warnings
    import secrets as _secrets
    warnings.warn(
        "SECRET_KEY não está definida — a gerar uma chave aleatória temporária. "
        "Define SECRET_KEY em produção para manter as sessões válidas entre reinícios.",
        RuntimeWarning,
        stacklevel=1,
    )
    # Nunca usar um valor fixo/conhecido como fallback: permitiria forjar tokens
    # JWT. Gerar uma chave aleatória por arranque é seguro (no máximo invalida
    # sessões existentes ao reiniciar quando SECRET_KEY não está configurada).
    SECRET_KEY = _secrets.token_hex(32)
bearer_scheme = HTTPBearer(auto_error=False)


def _b64(data: dict | bytes) -> str:
    if isinstance(data, dict):
        data = json.dumps(data, separators=(",", ":"), sort_keys=True).encode()
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def _b64decode(segment: str) -> bytes:
    padded = segment + "=" * (-len(segment) % 4)
    return base64.urlsafe_b64decode(padded)

def create_access_token(payload: dict, expires_sec: int = 604800) -> str:
    data = payload.copy()
    data["exp"] = int(time.time()) + expires_sec
    # Identificador único para garantir tokens diferentes a cada chamada
    data["jti"] = uuid4().hex
    header = {"alg": "HS256", "typ": "JWT"}
    segments = [_b64(header), _b64(data)]
    signing_input = ".".join(segments)
    sig = hmac.new(SECRET_KEY.encode(), signing_input.encode(), hashlib.sha256).digest()
    segments.append(_b64(sig))
    return ".".join(segments)

def decode_token(token: str) -> dict:
    try:
        header_b64, payload_b64, sig_b64 = token.split(".")
        signing_input = f"{header_b64}.{payload_b64}"
        expected = hmac.new(SECRET_KEY.encode(), signing_input.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(expected, _b64decode(sig_b64)):
            raise HTTPException(status_code=401, detail="Invalid token signature")
        payload = json.loads(_b64decode(payload_b64))
        if payload.get("exp", 0) < int(time.time()):
            raise HTTPException(status_code=401, detail="Token expired")
        return payload
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_vendor(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    payload = decode_token(token)
    vendor_id = payload.get("sub")
    vendor = (
        db.query(models.Vendor)
        .filter(models.Vendor.id == vendor_id, models.Vendor.deleted_at == None)
        .first()
    )
    if not vendor:
        raise HTTPException(status_code=401, detail="Vendor not found")
    session = (
        db.query(models.VendorSession)
        .filter(models.VendorSession.vendor_id == vendor.id, models.VendorSession.token == token)
        .first()
    )
    if not session:
        raise HTTPException(status_code=401, detail="Session invalidated")
    return vendor


def get_current_vendor_optional(request: Request, db: Session = Depends(get_db)):
    """Return the authenticated vendor if token is provided, otherwise None."""
    auth = request.headers.get("Authorization")
    if auth and auth.lower().startswith("bearer "):
        token = auth.split(" ", 1)[1]
        try:
            payload = decode_token(token)
            vendor_id = payload.get("sub")
            vendor = (
                db.query(models.Vendor)
                .filter(models.Vendor.id == vendor_id, models.Vendor.deleted_at == None)
                .first()
            )
            if vendor:
                session = (
                    db.query(models.VendorSession)
                        .filter(models.VendorSession.vendor_id == vendor.id, models.VendorSession.token == token)
                        .first()
                )
                if session:
                    return vendor
        except HTTPException:
            pass
    return None


def get_admin(request: Request):
    if not ADMIN_TOKEN:
        security_logger.error("ADMIN_TOKEN não está configurada em produção!")
        raise HTTPException(status_code=500, detail="Admin token not configured")

    token = request.headers.get("X-Admin-Token")
    if not token:
        security_logger.warning(f"Admin request without token from {request.client.host}")
        raise HTTPException(status_code=401, detail="Admin token required")

    if not hmac.compare_digest(token, ADMIN_TOKEN):
        security_logger.warning(f"Invalid admin token attempt from {request.client.host}")
        raise HTTPException(status_code=401, detail="Admin unauthorized")
    return True
