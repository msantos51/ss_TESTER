# vendors.py - registo, perfil e dados pessoais do vendedor (incl. RGPD).

import json
import re
from uuid import uuid4

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Body,
    Depends,
    File,
    Form,
    HTTPException,
    Request,
    UploadFile,
)
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import (
    ALLOWED_IMAGE_EXTENSIONS,
    ALLOWED_IMAGE_TYPES,
    RESEND_API_KEY,
    limiter,
    security_logger,
)
from ..database import get_db
from ..emails import send_confirmation_email, send_email_change_confirmation
from ..premium import refresh_premium_status, within_reach
from ..ratings import attach_ratings, rating_summary
from ..security import (
    get_current_vendor,
    get_current_vendor_optional,
    pwd_context,
    validate_password,
)
from ..storage import PROFILE_PHOTO_DIR, delete_file, upload_file, validate_upload
from ..utils import utcnow, validate_nif

router = APIRouter()

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

@router.post("/vendors/resend-confirmation")
@limiter.limit("3/minute")
async def resend_confirmation_email(
    request: Request,
    background_tasks: BackgroundTasks,
    email: str = Body(..., embed=True),
    db: Session = Depends(get_db),
):
    vendor = (
        db.query(models.Vendor)
        .filter(models.Vendor.email == email, models.Vendor.deleted_at == None)
        .first()
    )
    if not vendor:
        raise HTTPException(status_code=404, detail="Email não encontrado")
    if vendor.email_confirmed:
        return {"detail": "Email já confirmado"}
    if not vendor.confirmation_token:
        vendor.confirmation_token = uuid4().hex
        db.commit()
    if not RESEND_API_KEY:
        raise HTTPException(status_code=503, detail="Não foi possível enviar o email. Tente novamente mais tarde.")
    background_tasks.add_task(send_confirmation_email, vendor.name, vendor.email, vendor.confirmation_token)
    return {"detail": "Email de confirmação reenviado com sucesso"}


@router.post("/vendors/")
@limiter.limit("3/minute")
async def create_vendor(
    request: Request,
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    product: str = Form(...),
    profile_photo: UploadFile = File(...),
    nif: str = Form(...),
    id_document_number: str = Form(""),
    phone: str = Form(...),
    address: str = Form(""),
    beaches: str = Form(""),
    product_categories: str = Form(""),
    iban: str = Form(""),
    business_name: str = Form(""),
    terms_accepted: bool = Form(...),
    db: Session = Depends(get_db),
):
    if not terms_accepted:
        raise HTTPException(status_code=400, detail="É necessário aceitar os Termos e Condições")

    name = name.strip()
    email = email.strip()
    if not name or len(name) > 200:
        raise HTTPException(status_code=400, detail="Indica um nome com até 200 caracteres.")
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Introduz um email válido.")

    if not validate_nif(nif):
        raise HTTPException(status_code=400, detail="NIF inválido")

    db_vendor = db.query(models.Vendor).filter(models.Vendor.email == email).first()
    if db_vendor:
        security_logger.warning(f"Registration attempt with existing email: {email} from {request.client.host}")
        raise HTTPException(status_code=400, detail="Já existe uma conta com este email.")

    db_nif = db.query(models.Vendor).filter(models.Vendor.nif == nif).first()
    if db_nif:
        security_logger.warning(f"Registration attempt with existing NIF from {request.client.host}")
        raise HTTPException(status_code=400, detail="NIF já registado")

    validate_password(password)
    validate_upload(profile_photo, ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_EXTENSIONS, "foto de perfil")

    hashed_password = pwd_context.hash(password)
    photo_path = upload_file(profile_photo, PROFILE_PHOTO_DIR)

    confirmation_token = uuid4().hex
    new_vendor = models.Vendor(
        name=name,
        email=email,
        hashed_password=hashed_password,
        product=product,
        profile_photo=photo_path,
        email_confirmed=False,
        confirmation_token=confirmation_token,
        nif=nif,
        id_document_number=id_document_number or None,
        phone=phone,
        address=address or None,
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

    background_tasks.add_task(send_confirmation_email, name, email, confirmation_token)

    vendor_data = schemas.VendorOut.model_validate(new_vendor).model_dump(mode="json")
    vendor_data["email_sent"] = True
    return JSONResponse(content=vendor_data, status_code=201)



@router.get("/vendors/", response_model=list[schemas.VendorPublicOut])
def list_vendors(
    lat: float | None = None,
    lng: float | None = None,
    current_vendor: models.Vendor | None = Depends(get_current_vendor_optional),
    db: Session = Depends(get_db),
):
    """Vendedores visíveis no mapa.

    `lat`/`lng` são a posição do banhista. Com ela é aplicado o raio de
    alcance: sem Premium o vendedor só é devolvido a quem está a menos de
    FREE_REACH_RADIUS_M, com Premium até PREMIUM_REACH_RADIUS_M. Sem posição
    não há distância que se possa medir, por isso não se filtra nada — é
    preferível a um mapa vazio para quem recusou a geolocalização.
    """
    if current_vendor:
        vendors = [current_vendor]
    else:
        # Contas eliminadas (RGPD) continuam na base de dados como lápide sem
        # dados pessoais — nunca podem aparecer no mapa público.
        vendors = (
            db.query(models.Vendor).filter(models.Vendor.deleted_at == None).all()
        )

    # mapear rotas ativas para evitar uma query por vendedor
    active_routes = {
        r.vendor_id: r
        for r in db.query(models.Route).filter(models.Route.end_time == None).all()
    }

    for v in vendors:
        if v.id not in active_routes:
            v.current_lat = None
            v.current_lng = None

    # O vendedor autenticado vê-se sempre a si próprio, esteja onde estiver: o
    # raio é sobre quem o procura, não sobre quem se vê a si mesmo na app.
    if current_vendor or lat is None or lng is None:
        attach_ratings(db, vendors)
        return vendors

    reachable = [v for v in vendors if within_reach(v, lat, lng)]
    attach_ratings(db, reachable)
    return reachable


# --------------------------
# Detalhe público de um vendedor
# --------------------------
@router.get("/vendors/{vendor_id:int}", response_model=schemas.VendorPublicOut)
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = (
        db.query(models.Vendor)
        .filter(models.Vendor.id == vendor_id, models.Vendor.deleted_at == None)
        .first()
    )
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendedor não encontrado")
    if vendor.is_premium:
        vendor.rating_average, vendor.rating_count = rating_summary(db, vendor.id)
    else:
        vendor.rating_average, vendor.rating_count = None, 0
    return vendor


# --------------------------
# Atualizar perfil do vendedor (agora com PATCH)
# --------------------------
@router.patch("/vendors/{vendor_id}/profile", response_model=schemas.VendorOut)
@limiter.limit("30/minute")
async def update_vendor_profile(
    vendor_id: int,
    request: Request,
    background_tasks: BackgroundTasks,
    name: str = Form(None),
    email: str = Form(None),
    password: str = Form(None),
    old_password: str = Form(None),
    new_password: str = Form(None),
    product: str = Form(None),
    profile_photo: UploadFile = File(None),
    pin_color: str = Form(None),
    payment_methods: str = Form(None),
    nif: str = Form(None),
    id_document_number: str = Form(None),
    phone: str = Form(None),
    address: str = Form(None),
    beaches: str = Form(None),
    product_categories: str = Form(None),
    iban: str = Form(None),
    business_name: str = Form(None),
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Sem permissão para alterar este perfil.")

    if name is not None and name.strip() != (vendor.name or ""):
        name = name.strip()
        if not name or len(name) > 200:
            raise HTTPException(status_code=400, detail="Indica um nome com até 200 caracteres.")
        vendor.name = name
    # Alteração de email: não muda já o email; envia link de confirmação para o
    # novo endereço e só ao confirmar é que o email passa a estar ativo.
    email = email.strip() if email else email
    if email and email != vendor.email:
        if not EMAIL_RE.match(email):
            raise HTTPException(status_code=400, detail="Introduz um email válido.")
        existing = (
            db.query(models.Vendor)
            .filter(models.Vendor.email == email, models.Vendor.id != vendor_id)
            .first()
        )
        pending = (
            db.query(models.Vendor)
            .filter(models.Vendor.pending_email == email, models.Vendor.id != vendor_id)
            .first()
        )
        if existing or pending:
            raise HTTPException(status_code=400, detail="Este email já está a ser usado por outra conta.")
        vendor.pending_email = email
        vendor.email_change_token = uuid4().hex
        background_tasks.add_task(
            send_email_change_confirmation, vendor.name, email, vendor.email_change_token
        )
    # manter compatibilidade com parametro antigo 'password'
    if new_password or password:
        new_pass = new_password if new_password is not None else password
        if not old_password:
            raise HTTPException(status_code=400, detail="Indica a palavra-passe atual para a alterares.")
        if not pwd_context.verify(old_password, vendor.hashed_password):
            raise HTTPException(status_code=400, detail="A palavra-passe atual está incorreta.")
        validate_password(new_pass)
        vendor.hashed_password = pwd_context.hash(new_pass)
    if product:
        vendor.product = product
    if profile_photo:
        validate_upload(profile_photo, ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_EXTENSIONS, "foto de perfil")
        old_photo_path = vendor.profile_photo
        vendor.profile_photo = upload_file(profile_photo, PROFILE_PHOTO_DIR)
        if old_photo_path:
            delete_file(old_photo_path)
    if pin_color:
        if not re.match(r"^#[0-9A-Fa-f]{6}$", pin_color):
            raise HTTPException(status_code=400, detail="Cor inválida. Usa o formato #RRGGBB.")
        vendor.pin_color = pin_color
    if payment_methods is not None:
        vendor.payment_methods = payment_methods
    if nif is not None and nif != (vendor.nif or ""):
        if not validate_nif(nif):
            raise HTTPException(status_code=400, detail="NIF inválido")
        existing_nif = (
            db.query(models.Vendor)
            .filter(models.Vendor.nif == nif, models.Vendor.id != vendor_id)
            .first()
        )
        if existing_nif:
            raise HTTPException(status_code=400, detail="NIF já registado")
        vendor.nif = nif
    if id_document_number is not None:
        vendor.id_document_number = id_document_number or None
    if phone is not None:
        vendor.phone = phone or None
    if address is not None:
        vendor.address = address or None
    if beaches is not None:
        vendor.beaches = beaches
    if product_categories is not None:
        vendor.product_categories = product_categories
    if iban is not None:
        if iban:
            if len(iban) > 34 or not re.match(r"^[A-Z]{2}[A-Z0-9]+$", iban):
                raise HTTPException(status_code=400, detail="IBAN inválido.")
            vendor.iban = iban
        else:
            vendor.iban = None
    if business_name is not None:
        vendor.business_name = business_name or None

    db.commit()
    db.refresh(vendor)
    return vendor


@router.get("/vendors/me", response_model=schemas.VendorOut)
def get_my_vendor_profile(
    current_vendor: models.Vendor = Depends(get_current_vendor),
    db: Session = Depends(get_db),
):
    return refresh_premium_status(current_vendor, db)


# --------------------------
# RGPD — exportação dos dados pessoais (art. 20.º, direito à portabilidade)
# --------------------------
@router.get("/vendors/me/export")
@limiter.limit("5/hour")
def export_my_data(
    request: Request,
    current_vendor: models.Vendor = Depends(get_current_vendor),
    db: Session = Depends(get_db),
):
    """Devolve, em JSON, todos os dados pessoais associados à conta.

    O ficheiro é servido como transferência (`Content-Disposition: attachment`)
    para que o titular o possa guardar. Inclui perfil, trajetos GPS, produtos,
    stories, pagamentos e sessões — tudo o que o Sunny Sales guarda sobre ele.
    """
    vendor = current_vendor

    routes = (
        db.query(models.Route)
        .filter(models.Route.vendor_id == vendor.id)
        .order_by(models.Route.start_time.asc())
        .all()
    )
    products = (
        db.query(models.Product)
        .filter(models.Product.vendor_id == vendor.id)
        .order_by(models.Product.created_at.asc())
        .all()
    )
    stories = (
        db.query(models.Story)
        .filter(models.Story.vendor_id == vendor.id)
        .order_by(models.Story.created_at.asc())
        .all()
    )
    paid_weeks = (
        db.query(models.PaidWeek)
        .filter(models.PaidWeek.vendor_id == vendor.id)
        .order_by(models.PaidWeek.start_date.asc())
        .all()
    )
    sessions = (
        db.query(models.VendorSession)
        .filter(models.VendorSession.vendor_id == vendor.id)
        .order_by(models.VendorSession.created_at.asc())
        .all()
    )

    def iso(value):
        return value.isoformat() if value else None

    payload = {
        "exportado_em": utcnow().isoformat(),
        "formato": "application/json",
        "conta": {
            "id": vendor.id,
            "nome": vendor.name,
            "email": vendor.email,
            "email_confirmado": bool(vendor.email_confirmed),
            "email_pendente": vendor.pending_email,
            "produto": vendor.product,
            "categorias_de_produto": vendor.product_categories,
            "praias": vendor.beaches,
            "metodos_de_pagamento": vendor.payment_methods,
            "cor_do_pin": vendor.pin_color,
            "foto_de_perfil": vendor.profile_photo,
            "nif": vendor.nif,
            "documento_de_identificacao": vendor.id_document_number,
            "telefone": vendor.phone,
            "morada": vendor.address,
            "iban": vendor.iban,
            "nome_comercial": vendor.business_name,
            "termos_aceites": bool(vendor.terms_accepted),
            "termos_aceites_em": iso(vendor.terms_accepted_at),
            "premium_ativo": bool(vendor.premium_active),
            "premium_valido_ate": iso(vendor.premium_valid_until),
        },
        "trajetos": [
            {
                "id": r.id,
                "inicio": iso(r.start_time),
                "fim": iso(r.end_time),
                "distancia_m": r.distance_m,
                "pontos": json.loads(r.points or "[]"),
            }
            for r in routes
        ],
        "produtos": [
            {
                "id": pr.id,
                "nome": pr.name,
                "preco": pr.price,
                "foto": pr.photo,
                "criado_em": iso(pr.created_at),
            }
            for pr in products
        ],
        "stories": [
            {
                "id": st.id,
                "media": st.media_path,
                "criado_em": iso(st.created_at),
                "expira_em": iso(st.expires_at),
            }
            for st in stories
        ],
        "pagamentos": [
            {
                "id": pw.id,
                "inicio": iso(pw.start_date),
                "fim": iso(pw.end_date),
                "plano": pw.plan,
                "recibo": pw.receipt_url,
            }
            for pw in paid_weeks
        ],
        "sessoes": [
            {
                "id": se.id,
                "dispositivo": se.user_agent,
                "criada_em": iso(se.created_at),
            }
            for se in sessions
        ],
    }

    security_logger.info(f"Data export requested by vendor {vendor.id}")
    return JSONResponse(
        content=payload,
        headers={
            "Content-Disposition": f'attachment; filename="sunny-sales-dados-{vendor.id}.json"'
        },
    )


# --------------------------
# RGPD — eliminação da conta (art. 17.º, direito ao apagamento)
# Exigido também pela Google Play para qualquer app com contas de utilizador.
# --------------------------
@router.delete("/vendors/me")
@limiter.limit("5/hour")
def delete_my_account(
    request: Request,
    payload: schemas.AccountDeleteRequest,
    current_vendor: models.Vendor = Depends(get_current_vendor),
    db: Session = Depends(get_db),
):
    """Apaga a conta do vendedor autenticado e os seus dados pessoais.

    Pede a palavra-passe como reautenticação, para que um telemóvel deixado
    desbloqueado não chegue para destruir a conta de alguém.

    O que é apagado de forma irreversível: trajetos GPS, produtos, stories, foto
    de perfil (incluindo os ficheiros no armazenamento), sessões e todos os
    campos de identificação do perfil.

    O que subsiste: o registo dos pagamentos (`paid_weeks`) e uma linha-lápide
    sem dados pessoais que lhe serve de referência. A lei fiscal portuguesa
    obriga a conservar os documentos de faturação durante 10 anos, e o RGPD
    (art. 17.º, n.º 3, al. b)) ressalva expressamente essa obrigação legal do
    direito ao apagamento. Depois disto a conta não volta a autenticar-se e o
    email fica livre para um novo registo.
    """
    vendor = current_vendor

    if not pwd_context.verify(payload.password, vendor.hashed_password):
        security_logger.warning(
            f"Failed account deletion attempt for vendor {vendor.id} from {request.client.host}"
        )
        raise HTTPException(status_code=401, detail="Palavra-passe incorreta")

    vendor_id = vendor.id

    # 1. Trajetos — o histórico de GPS é o dado mais sensível que guardamos.
    db.query(models.Route).filter(models.Route.vendor_id == vendor_id).delete(
        synchronize_session=False
    )

    # 2. Stories e produtos, com os respetivos ficheiros no armazenamento.
    for story in db.query(models.Story).filter(models.Story.vendor_id == vendor_id).all():
        if story.media_path:
            delete_file(story.media_path)
        db.delete(story)

    for product in db.query(models.Product).filter(models.Product.vendor_id == vendor_id).all():
        if product.photo:
            delete_file(product.photo)
        db.delete(product)

    # 3. Foto de perfil.
    if vendor.profile_photo:
        delete_file(vendor.profile_photo)

    # 4. Sessões — termina imediatamente o acesso em todos os dispositivos.
    db.query(models.VendorSession).filter(
        models.VendorSession.vendor_id == vendor_id
    ).delete(synchronize_session=False)

    # 5. Anonimização do perfil. O email passa a um endereço no domínio
    # reservado `.invalid` (RFC 2606), que nunca pode existir, mantendo a
    # restrição de unicidade satisfeita e libertando o email real.
    vendor.name = "Conta eliminada"
    vendor.email = f"apagado+{vendor_id}@sunnysales.invalid"
    vendor.hashed_password = pwd_context.hash(uuid4().hex + uuid4().hex)
    vendor.product = ""
    vendor.profile_photo = None
    vendor.pin_color = None
    vendor.payment_methods = None
    vendor.nif = None
    vendor.id_document_number = None
    vendor.phone = None
    vendor.address = None
    vendor.beaches = None
    vendor.product_categories = None
    vendor.iban = None
    vendor.business_name = None
    vendor.pending_email = None
    vendor.confirmation_token = None
    vendor.email_change_token = None
    vendor.password_reset_token = None
    vendor.password_reset_expires = None
    vendor.current_lat = None
    vendor.current_lng = None
    vendor.email_confirmed = False
    vendor.premium_active = False
    vendor.premium_valid_until = None
    vendor.deleted_at = utcnow()

    db.commit()

    security_logger.info(f"Account deleted by vendor {vendor_id}")
    return {
        "status": "deleted",
        "detail": (
            "Conta eliminada. Os dados pessoais foram apagados; o registo dos "
            "pagamentos é conservado por obrigação fiscal."
        ),
    }
