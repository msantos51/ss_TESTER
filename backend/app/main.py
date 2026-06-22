# main.py - aplicação FastAPI com rotas principais e PATCH otimizado

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Body, WebSocket, WebSocketDisconnect, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from sqlalchemy import or_
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from . import models, schemas
import stripe
from datetime import datetime, timedelta, timezone
from .database import engine, get_db, ensure_latest_schema
import os
from pathlib import Path
import shutil
from uuid import uuid4
import time
import json
import base64
import hmac
import hashlib
import smtplib
from email.message import EmailMessage
from math import radians, sin, cos, sqrt, atan2
from supabase import create_client

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_STORY_TYPES = ALLOWED_IMAGE_TYPES | {"video/mp4", "video/webm"}
ALLOWED_STORY_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | {".mp4", ".webm"}

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY else None

PROFILE_PHOTO_BUCKET = "profile-photos"
STORY_BUCKET = "stories"

PROFILE_PHOTO_DIR = "profile_photos"
STORY_DIR = "stories"
if not supabase:
    os.makedirs(PROFILE_PHOTO_DIR, exist_ok=True)
    os.makedirs(STORY_DIR, exist_ok=True)

BUCKET_MAP = {
    PROFILE_PHOTO_DIR: PROFILE_PHOTO_BUCKET,
    STORY_DIR: STORY_BUCKET,
}


def validate_upload(file: UploadFile, allowed_types: set, allowed_exts: set, label: str = "ficheiro"):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed_exts or (file.content_type and file.content_type not in allowed_types):
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de {label} inválido. Permitidos: {', '.join(sorted(allowed_exts))}",
        )


def _upload_file(upload_file: UploadFile, folder: str) -> str:
    ext = os.path.splitext(upload_file.filename or "")[1].lower()
    file_name = f"{uuid4().hex}{ext}"
    if supabase:
        bucket = BUCKET_MAP.get(folder, folder)
        content = upload_file.file.read()
        try:
            supabase.storage.from_(bucket).upload(
                file_name,
                content,
                {"content-type": upload_file.content_type or "application/octet-stream"},
            )
        except Exception as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Erro ao enviar ficheiro para armazenamento: {exc}",
            )
        return supabase.storage.from_(bucket).get_public_url(file_name)
    file_path = os.path.join(folder, file_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return f"{folder}/{file_name}"


def _delete_file(path_or_url: str) -> None:
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

# Inicializar app
app = FastAPI()


def utcnow():
    """Return current UTC time as a naive datetime."""
    return datetime.now(timezone.utc).replace(tzinfo=None)

# Habilitar CORS (permitir acesso do frontend)
_cors_origins_env = os.getenv("ALLOWED_ORIGINS", "")
origins = [o.strip() for o in _cors_origins_env.split(",") if o.strip()] or ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint de verificação de funcionamento da API
@app.get("/api/status")
def read_root():
    return {"status": "ok"}

if not supabase:
    app.mount("/profile_photos", StaticFiles(directory=PROFILE_PHOTO_DIR), name="profile_photos")
    app.mount("/stories", StaticFiles(directory=STORY_DIR), name="stories")

# Servir a aplicação web compilada, se existir
WEB_DIST = Path(__file__).resolve().parents[2] / "sunny_sales_web" / "dist"
if WEB_DIST.is_dir():
    # Servir ficheiros estáticos gerados pelo Vite (JS/CSS)
    assets_path = WEB_DIST / "assets"
    if assets_path.is_dir():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")

# Criar as tabelas na base de dados (com retry para quando a BD ainda não está disponível)
def _init_db(max_retries: int = 5, retry_delay: int = 5) -> None:
    for attempt in range(max_retries):
        try:
            models.Base.metadata.create_all(bind=engine)
            ensure_latest_schema()
            return
        except Exception as exc:
            if attempt == max_retries - 1:
                raise
            print(f"⚠️  Base de dados não disponível (tentativa {attempt + 1}/{max_retries}): {exc}. A aguardar {retry_delay}s...")
            time.sleep(retry_delay)

_init_db()

# Contexto para hash de password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

BASE_APP_URL = os.getenv("BASE_APP_URL", "https://ss-tester.onrender.com")

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)


def send_email(to: str, subject: str, body: str, html: str | None = None) -> bool:
    """Send an email via SMTP. Returns True if sent, False if SMTP not configured."""
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"[Email] SMTP não configurado. Para: {to}\nAssunto: {subject}")
        return False

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = to
    msg.set_content(body)
    if html:
        msg.add_alternative(html, subtype="html")

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
    return True

# Configuração do Stripe
stripe.api_key = os.getenv("STRIPE_API_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
SUCCESS_URL = os.getenv("SUCCESS_URL", "https://example.com/success")
CANCEL_URL = os.getenv("CANCEL_URL", "https://example.com/cancel")

# Price IDs dos planos de subscrição (Stripe)
STRIPE_PLAN_PRICE_IDS = {
    "semanal": os.getenv("STRIPE_PRICE_ID_SEMANAL", "price_1TjhC7IUkNjcmfnZf8Kzjsam"),
    "quinzenal": os.getenv("STRIPE_PRICE_ID_QUINZENAL", "price_1TjhBKIUkNjcmfnZF5tlmASF"),
    "mensal": os.getenv("STRIPE_PRICE_ID_MENSAL", "price_1TjhCMIUkNjcmfnZECNOhR4y"),
}


def validate_password(password: str):
    if len(password) < 8 or password.lower() == password or not any(c.isdigit() for c in password):
        raise HTTPException(
            status_code=400,
            detail="Password deve ter pelo menos 8 caracteres, uma letra maiúscula e um número",
        )


def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1 = radians(lat1)
    phi2 = radians(lat2)
    dphi = radians(lat2 - lat1)
    dlambda = radians(lon2 - lon1)
    a = sin(dphi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(dlambda / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

# Distância mínima (metros) entre leituras de GPS consecutivas para serem
# consideradas movimento real. Abaixo deste valor é ruído típico de GPS
# e o ponto é ignorado, evitando que o trajeto "ande sozinho" parado.
# Alinhado com a precisão máxima aceite no dispositivo (ver
# MAX_ACCEPTABLE_ACCURACY_METERS em LocationForegroundService.java), já que
# valores mais baixos deixavam passar oscilações dentro do raio de erro do GPS.
MIN_GPS_DISTANCE_M = 15.0

# Gerenciador de WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

# --------------------------
# Autenticação JWT simples
# --------------------------
SECRET_KEY = os.getenv("SECRET_KEY", "")
if not SECRET_KEY:
    import warnings
    warnings.warn(
        "SECRET_KEY não está definida. Usar um valor aleatório em produção.",
        RuntimeWarning,
        stacklevel=1,
    )
    SECRET_KEY = "dev-insecure-secret-change-in-production"
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
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
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
            vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
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


ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")

def get_admin(request: Request):
    token = request.headers.get("X-Admin-Token")
    if not ADMIN_TOKEN or token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Admin unauthorized")
    return True

# --------------------------
# Subscrição
# --------------------------
def verify_active_subscription(vendor: models.Vendor, db: Session):
    """Ensure subscription is active and not expired."""
    if (
        vendor.subscription_active
        and vendor.subscription_valid_until
        and vendor.subscription_valid_until < utcnow()
    ):
        vendor.subscription_active = False
        db.commit()
        db.refresh(vendor)
    if not vendor.subscription_active:
        raise HTTPException(status_code=403, detail="Subscription inactive")

# --------------------------
# Login do vendedor
# --------------------------
@app.post("/login", response_model=schemas.VendorOut)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Autentica um vendedor a partir do email ou username."""

    identifier = credentials.email or credentials.username
    if not identifier or not credentials.password:
        raise HTTPException(status_code=400, detail="Email and password required")

    vendor = (
        db.query(models.Vendor)
        .filter(
            or_(
                models.Vendor.email == identifier,
                models.Vendor.name == identifier,
            )
        )
        .first()
    )
    if not vendor or not pwd_context.verify(credentials.password, vendor.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not vendor.email_confirmed:
        raise HTTPException(status_code=400, detail="Email not confirmed")
    return vendor

# --------------------------
# Endpoint para obter JWT
# --------------------------
@app.post("/token")
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
        raise HTTPException(status_code=400, detail="Email and password required")

    vendor = db.query(models.Vendor).filter(models.Vendor.email == email).first()
    if not vendor or not pwd_context.verify(password, vendor.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not vendor.email_confirmed:
        raise HTTPException(status_code=400, detail="Email not confirmed")

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
@app.get("/vendors/me/sessions")
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


@app.delete("/vendors/me/sessions/{session_id}")
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


# --------------------------
# Registo de vendedor
# --------------------------

def _validate_nif(nif: str) -> bool:
    if len(nif) != 9 or not nif.isdigit():
        return False
    if nif[0] not in ("1", "2", "3", "5", "6", "7", "8", "9"):
        return False
    check = 0
    for i in range(8):
        check += int(nif[i]) * (9 - i)
    remainder = check % 11
    control = 0 if remainder < 2 else 11 - remainder
    return int(nif[8]) == control


def _send_confirmation_email(name: str, email: str, confirmation_token: str) -> bool:
    confirm_link = f"{BASE_APP_URL}/confirm-email/{confirmation_token}"
    try:
        return send_email(
            to=email,
            subject="Sunny Sales - Confirma o teu email",
            body=f"Olá {name},\n\nObrigado por te registares na Sunny Sales!\n\nClica no link para confirmares a tua conta:\n{confirm_link}\n\nSe não criaste esta conta, ignora este email.\n\nCumprimentos,\nEquipa Sunny Sales",
            html=f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#FCB454,#F7931E);padding:30px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;">&#9728;&#65039; Sunny Sales</h1>
        </td></tr>
        <tr><td style="padding:30px;">
          <h2 style="color:#333;margin-top:0;">Olá {name}!</h2>
          <p style="color:#555;font-size:16px;line-height:1.6;">Obrigado por te registares na <strong>Sunny Sales</strong>. Para ativares a tua conta, confirma o teu email clicando no botão abaixo:</p>
          <div style="text-align:center;margin:30px 0;">
            <a href="{confirm_link}" style="background:#FCB454;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">Confirmar Email</a>
          </div>
          <p style="color:#888;font-size:13px;">Se o botão não funcionar, copia e cola este link no teu navegador:</p>
          <p style="color:#888;font-size:13px;word-break:break-all;">{confirm_link}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#aaa;font-size:12px;text-align:center;">Se não criaste esta conta, ignora este email.<br>Equipa Sunny Sales</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>""",
        )
    except Exception as exc:
        print(f"[Email] Falha ao enviar email de confirmação para {email}: {exc}")
        return False


@app.post("/vendors/resend-confirmation")
async def resend_confirmation_email(
    email: str = Body(..., embed=True),
    db: Session = Depends(get_db),
):
    vendor = db.query(models.Vendor).filter(models.Vendor.email == email).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Email não encontrado")
    if vendor.email_confirmed:
        return {"detail": "Email já confirmado"}
    if not vendor.confirmation_token:
        vendor.confirmation_token = uuid4().hex
        db.commit()
    sent = _send_confirmation_email(vendor.name, vendor.email, vendor.confirmation_token)
    if not sent:
        raise HTTPException(status_code=503, detail="Não foi possível enviar o email. Tente novamente mais tarde.")
    return {"detail": "Email de confirmação reenviado com sucesso"}


@app.post("/vendors/")
async def create_vendor(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    product: str = Form(...),
    profile_photo: UploadFile = File(...),
    nif: str = Form(...),
    id_document_number: str = Form(...),
    phone: str = Form(...),
    address: str = Form(...),
    beaches: str = Form(""),
    product_categories: str = Form(""),
    iban: str = Form(""),
    business_name: str = Form(""),
    terms_accepted: bool = Form(...),
    db: Session = Depends(get_db),
):
    if not terms_accepted:
        raise HTTPException(status_code=400, detail="É necessário aceitar os Termos e Condições")

    if not _validate_nif(nif):
        raise HTTPException(status_code=400, detail="NIF inválido")

    db_vendor = db.query(models.Vendor).filter(models.Vendor.email == email).first()
    if db_vendor:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_nif = db.query(models.Vendor).filter(models.Vendor.nif == nif).first()
    if db_nif:
        raise HTTPException(status_code=400, detail="NIF já registado")

    validate_password(password)
    validate_upload(profile_photo, ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_EXTENSIONS, "foto de perfil")

    hashed_password = pwd_context.hash(password)
    photo_path = _upload_file(profile_photo, PROFILE_PHOTO_DIR)

    confirmation_token = uuid4().hex
    new_vendor = models.Vendor(
        name=name,
        email=email,
        hashed_password=hashed_password,
        product=product,
        profile_photo=photo_path,
        pin_color="#7B61FF",
        email_confirmed=False,
        confirmation_token=confirmation_token,
        nif=nif,
        id_document_number=id_document_number,
        phone=phone,
        address=address,
        beaches=beaches,
        product_categories=product_categories,
        iban=iban or None,
        business_name=business_name or None,
        terms_accepted=True,
        terms_accepted_at=utcnow(),
    )
    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)

    email_sent = _send_confirmation_email(name, email, confirmation_token)

    vendor_data = schemas.VendorOut.model_validate(new_vendor).model_dump(mode="json")
    vendor_data["email_sent"] = email_sent
    return JSONResponse(content=vendor_data, status_code=201)


# --------------------------
# Listar vendedores
# --------------------------
@app.get("/vendors/", response_model=list[schemas.VendorPublicOut])
def list_vendors(
    current_vendor: models.Vendor | None = Depends(get_current_vendor_optional),
    db: Session = Depends(get_db),
):
    if current_vendor:
        vendors = [current_vendor]
    else:
        vendors = db.query(models.Vendor).all()

    # mapear rotas ativas para evitar uma query por vendedor
    active_routes = {
        r.vendor_id: r
        for r in db.query(models.Route).filter(models.Route.end_time == None).all()
    }

    for v in vendors:
        if v.id not in active_routes:
            v.current_lat = None
            v.current_lng = None

    return vendors


# --------------------------
# Atualizar perfil do vendedor (agora com PATCH)
# --------------------------
@app.patch("/vendors/{vendor_id}/profile", response_model=schemas.VendorOut)
async def update_vendor_profile(
    vendor_id: int,
    name: str = Form(None),
    email: str = Form(None),
    password: str = Form(None),
    old_password: str = Form(None),
    new_password: str = Form(None),
    product: str = Form(None),
    profile_photo: UploadFile = File(None),
    pin_color: str = Form(None),
    payment_methods: str = Form(None),
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if name:
        vendor.name = name
    if email and email != vendor.email:
        existing = db.query(models.Vendor).filter(models.Vendor.email == email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        vendor.email = email
    # manter compatibilidade com parametro antigo 'password'
    if new_password or password:
        new_pass = new_password if new_password is not None else password
        if not old_password:
            raise HTTPException(status_code=400, detail="Old password required")
        if not pwd_context.verify(old_password, vendor.hashed_password):
            raise HTTPException(status_code=400, detail="Old password incorrect")
        validate_password(new_pass)
        vendor.hashed_password = pwd_context.hash(new_pass)
    if product:
        vendor.product = product
    if profile_photo:
        validate_upload(profile_photo, ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_EXTENSIONS, "foto de perfil")
        old_photo_path = vendor.profile_photo
        vendor.profile_photo = _upload_file(profile_photo, PROFILE_PHOTO_DIR)
        if old_photo_path:
            _delete_file(old_photo_path)
    if pin_color:
        vendor.pin_color = pin_color
    if payment_methods is not None:
        vendor.payment_methods = payment_methods

    db.commit()
    db.refresh(vendor)
    return vendor

# --------------------------
# Atualizar localização do vendedor
# --------------------------
@app.put("/vendors/{vendor_id}/location")
async def update_vendor_location(
    vendor_id: int,
    lat: float = Body(...),
    lng: float = Body(...),
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    verify_active_subscription(current_vendor, db)

    # only allow updates if the vendor has an active route
    active_route = (
        db.query(models.Route)
        .filter(models.Route.vendor_id == vendor_id, models.Route.end_time == None)
        .order_by(models.Route.start_time.desc())
        .first()
    )
    if not active_route:
        raise HTTPException(status_code=400, detail="Location sharing inactive")

    points = json.loads(active_route.points or "[]")
    last_point = points[-1] if points else None

    # Ignora leituras de GPS demasiado próximas da última posição gravada:
    # ruído de GPS (poucos metros) não deve ser contabilizado como movimento
    # nem propagado ao mapa, para não dar a impressão de o vendedor estar
    # sempre a deslocar-se enquanto está parado.
    if last_point is not None:
        moved = haversine(last_point["lat"], last_point["lng"], lat, lng)
        if moved < MIN_GPS_DISTANCE_M:
            return {"message": "Localização ignorada (ruído de GPS)"}

    vendor.current_lat = lat
    vendor.current_lng = lng
    points.append({"lat": lat, "lng": lng, "t": utcnow().isoformat()})
    active_route.points = json.dumps(points)
    db.commit()

    await manager.broadcast({"vendor_id": vendor_id, "lat": lat, "lng": lng})
    return {"message": "Localização atualizada com sucesso"}

# --------------------------
# Iniciar e terminar trajetos
# --------------------------
@app.post("/vendors/{vendor_id}/routes/start", response_model=schemas.RouteOut)
def start_route(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    verify_active_subscription(current_vendor, db)

    # close any previously active routes to avoid duplicates
    active_routes = (
        db.query(models.Route)
        .filter(models.Route.vendor_id == vendor_id, models.Route.end_time == None)
        .all()
    )
    for r in active_routes:
        pts = json.loads(r.points or "[]")
        dist = 0.0
        for p1, p2 in zip(pts, pts[1:]):
            dist += haversine(p1["lat"], p1["lng"], p2["lat"], p2["lng"])
        r.distance_m = dist
        r.end_time = utcnow()

    route = models.Route(vendor_id=vendor_id, points="[]")
    db.add(route)
    db.commit()
    db.refresh(route)
    return {
        "id": route.id,
        "start_time": route.start_time.isoformat(),
        "end_time": route.end_time,
        "distance_m": route.distance_m,
        "points": [],
    }


@app.post("/vendors/{vendor_id}/routes/stop", response_model=schemas.RouteOut)
async def stop_route(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    verify_active_subscription(current_vendor, db)
    routes = (
        db.query(models.Route)
        .filter(models.Route.vendor_id == vendor_id, models.Route.end_time == None)
        .order_by(models.Route.start_time.desc())
        .all()
    )
    if not routes:
        raise HTTPException(status_code=404, detail="Route not found")

    latest = routes[0]
    for r in routes:
        pts = json.loads(r.points or "[]")
        dist = 0.0
        for p1, p2 in zip(pts, pts[1:]):
            dist += haversine(p1["lat"], p1["lng"], p2["lat"], p2["lng"])
        r.distance_m = dist
        r.end_time = utcnow()

    # Clear vendor's current location so clients remove it from the map
    current_vendor.current_lat = None
    current_vendor.current_lng = None
    db.commit()
    for r in routes:
        db.refresh(r)
    db.refresh(current_vendor)
    # Notify via websocket that the vendor stopped sharing location
    await manager.broadcast({
        "vendor_id": vendor_id,
        "lat": None,
        "lng": None,
        "remove": True,
    })

    return {
        "id": latest.id,
        "start_time": latest.start_time.isoformat(),
        "end_time": latest.end_time.isoformat(),
        "distance_m": latest.distance_m,
        "points": json.loads(latest.points or "[]"),
    }


@app.get("/vendors/{vendor_id}/routes", response_model=list[schemas.RouteOut])
def list_routes(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    routes = (
        db.query(models.Route)
        .filter(models.Route.vendor_id == vendor_id)
        .order_by(models.Route.start_time.desc())
        .all()
    )
    result = []
    for r in routes:
        result.append(
            {
                "id": r.id,
                "start_time": r.start_time.isoformat(),
                "end_time": r.end_time.isoformat() if r.end_time else None,
                "distance_m": r.distance_m,
                "points": json.loads(r.points or "[]"),
            }
        )
    return result


@app.get("/vendors/{vendor_id}/paid-weeks", response_model=list[schemas.PaidWeekOut])
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


@app.get("/confirm-email/{token}", response_class=HTMLResponse)
def confirm_email(token: str, db: Session = Depends(get_db)):
    vendor = db.query(models.Vendor).filter(models.Vendor.confirmation_token == token).first()
    if not vendor:
        return HTMLResponse(
            status_code=404,
            content="""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
<title>Link Inválido</title></head>
<body style="font-family:'Roboto',sans-serif;background:#f4f4f4;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
<div style="background:#fff;border-radius:12px;padding:40px;text-align:center;max-width:420px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<h2 style="color:#c62828;">&#10060; Link inválido ou expirado</h2>
<p style="color:#555;">Este link de confirmação já não é válido. Se já confirmaste o teu email, podes fazer login normalmente.</p>
<a href="/" style="display:inline-block;margin-top:20px;background:#FCB454;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Ir para a página inicial</a>
</div></body></html>""",
        )
    vendor.email_confirmed = True
    vendor.confirmation_token = None
    db.commit()
    return HTMLResponse(content=f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
<title>Email Confirmado</title></head>
<body style="font-family:'Roboto',sans-serif;background:#f4f4f4;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
<div style="background:#fff;border-radius:12px;padding:40px;text-align:center;max-width:420px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<h2 style="color:#2e7d32;">&#9989; Email confirmado com sucesso!</h2>
<p style="color:#555;">Olá <strong>{vendor.name}</strong>, a tua conta Sunny Sales está agora ativa. Já podes fazer login.</p>
<a href="/" style="display:inline-block;margin-top:20px;background:#FCB454;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Fazer Login</a>
</div></body></html>""")


@app.post("/password-reset-request")
async def password_reset_request(request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    email = form.get("email", "")
    vendor = db.query(models.Vendor).filter(models.Vendor.email == email).first()
    if vendor:
        token = uuid4().hex
        vendor.password_reset_token = token
        vendor.password_reset_expires = utcnow() + timedelta(hours=2)
        db.commit()
        try:
            send_email(
                to=email,
                subject="Redefinir Palavra-passe",
                body=f"Clica no link para redefenires a tua palavra-passe: {BASE_APP_URL}/password-reset/{token}",
            )
        except Exception as exc:
            print(f"[Email] Falha ao enviar email de reset para {email}: {exc}")
    return {"status": "ok"}


@app.post("/password-reset/{token}")
async def reset_password(token: str, request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    new_password = form.get("new_password", "")
    vendor = (
        db.query(models.Vendor)
        .filter(
            models.Vendor.password_reset_token == token,
            models.Vendor.password_reset_expires > utcnow(),
        )
        .first()
    )
    if not vendor:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    validate_password(new_password)
    vendor.hashed_password = pwd_context.hash(new_password)
    vendor.password_reset_token = None
    vendor.password_reset_expires = None
    db.commit()
    return {"status": "Password reset successfully"}


@app.get("/password-reset/{token}", response_class=HTMLResponse)
async def show_password_reset_form(token: str):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
        <title>Redefinir Senha</title>
    </head>
    <body style="font-family: 'Roboto', sans-serif; background: #ffffff; padding: 30px;">
        <h2>Redefinir Senha</h2>
        <form action="/password-reset/{token}" method="post">
            <input type="password" name="new_password" placeholder="Nova senha" required style="padding: 8px; width: 200px;"><br><br>
            <button type="submit" style="padding: 10px 20px; background-color: #FCB454; color: #ffffff; border: none; border-radius: 4px;">Redefinir</button>
        </form>
    </body>
    </html>"""

# --------------------------
# Criar sessão de pagamento no Stripe
# --------------------------
@app.post("/vendors/{vendor_id}/create-checkout-session")
def create_checkout_session(
    vendor_id: int,
    plan: str = "mensal",
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    price_id = STRIPE_PLAN_PRICE_IDS.get(plan)
    if not price_id:
        raise HTTPException(status_code=400, detail="Invalid plan")
    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=SUCCESS_URL,
            cancel_url=CANCEL_URL,
            metadata={"vendor_id": vendor_id, "plan": plan},
        )
        return {"checkout_url": session.url}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

# --------------------------
# WebSocket para localização em tempo real
# --------------------------
@app.websocket("/ws/locations")
async def websocket_locations(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/vendors/{vendor_id}/stories", response_model=schemas.StoryOut)
async def create_story(
    vendor_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    validate_upload(file, ALLOWED_STORY_TYPES, ALLOWED_STORY_EXTENSIONS, "story")
    media_url = _upload_file(file, STORY_DIR)
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


@app.get("/vendors/{vendor_id}/stories", response_model=list[schemas.StoryOut])
def list_stories(vendor_id: int, db: Session = Depends(get_db)):
    now = utcnow()

    expired = (
        db.query(models.Story)
        .filter(models.Story.vendor_id == vendor_id, models.Story.expires_at <= now)
        .all()
    )
    for s in expired:
        _delete_file(s.media_path)
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
# Webhook do Stripe
# --------------------------
@app.post("/stripe/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    if not STRIPE_WEBHOOK_SECRET:
        # Sem segredo configurado não é possível verificar a autenticidade do
        # pedido; rejeitar em vez de confiar em JSON não assinado.
        raise HTTPException(status_code=500, detail="Webhook not configured")

    payload = await request.body()
    sig = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook")

    if event.get("type") == "checkout.session.completed":
        session = event["data"]["object"]
        if session.get("payment_status") != "paid":
            return {"status": "ignored"}
        vendor_id = int(session.get("client_reference_id") or session.get("metadata", {}).get("vendor_id") or 0)
        vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
        if vendor:
            vendor.subscription_active = True
            vendor.subscription_valid_until = utcnow() + timedelta(days=7)
            receipt_url = None
            invoice_id = session.get("invoice")
            if invoice_id:
                try:
                    invoice = stripe.Invoice.retrieve(invoice_id)
                    receipt_url = invoice.get("hosted_invoice_url") or invoice.get("invoice_pdf")
                except Exception:
                    receipt_url = None
            paid = models.PaidWeek(
                vendor_id=vendor_id,
                start_date=utcnow(),
                end_date=utcnow() + timedelta(days=7),
                receipt_url=receipt_url,
            )
            db.add(paid)
            db.commit()
    return {"status": "success"}


# --------------------------
# Endpoint para ativar pagamento manualmente (ex.: pagamento por transferência)
# Apenas acessível por administradores - nunca pelo próprio vendedor.
# --------------------------
@app.post("/vendors/{vendor_id}/activate-subscription")
def activate_subscription_manual(
    vendor_id: int,
    db: Session = Depends(get_db),
    admin: bool = Depends(get_admin),
):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    vendor.subscription_active = True
    vendor.subscription_valid_until = utcnow() + timedelta(days=7)
    paid = models.PaidWeek(
        vendor_id=vendor_id,
        start_date=utcnow(),
        end_date=utcnow() + timedelta(days=7),
    )
    db.add(paid)
    db.commit()
    return {"status": "activated"}

# --------------------------
# Admin endpoints simples
# --------------------------
@app.get("/admin/vendors", response_model=list[schemas.VendorOut])
def admin_list_vendors(db: Session = Depends(get_db), admin: bool = Depends(get_admin)):
    vendors = db.query(models.Vendor).all()
    return vendors

@app.post("/admin/vendors/{vendor_id}/deactivate")
def admin_deactivate_vendor(vendor_id: int, db: Session = Depends(get_db), admin: bool = Depends(get_admin)):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.subscription_active = False
    db.commit()
    return {"status": "deactivated"}

@app.get("/vendors/me", response_model=schemas.VendorOut)
def get_my_vendor_profile(current_vendor: models.Vendor = Depends(get_current_vendor)):
    return current_vendor


# --------------------------
# SPA: servir o frontend React (deve ficar APÓS todas as rotas de API para
# não interceptar chamadas como GET /vendors/ ou GET /vendors/me)
# --------------------------
if WEB_DIST.is_dir():
    @app.get("/", response_class=HTMLResponse, include_in_schema=False)
    async def serve_index():
        return FileResponse(WEB_DIST / "index.html")

    @app.get("/{path_name:path}", response_class=HTMLResponse, include_in_schema=False)
    async def serve_spa(path_name: str):
        file_path = WEB_DIST / path_name
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(WEB_DIST / "index.html")
