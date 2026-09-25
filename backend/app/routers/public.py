# public.py - endpoints abertos: estado da API, marés, contacto e WebSocket.

import re
from html import escape

import httpx
from fastapi import APIRouter, Body, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse

from .. import emails
from ..config import CONTACT_EMAIL_TO, limiter, security_logger
from ..realtime import manager

router = APIRouter()

# Endpoint de verificação de funcionamento da API
@router.get("/api/status")
def read_root():
    return {"status": "ok"}


# Proxy para a API de marés do IPMA, que não envia cabeçalhos CORS e
# por isso não pode ser chamada diretamente do browser.
@router.get("/api/tides")
async def get_tides():
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.get(
                "https://api.ipma.pt/open-data/forecast/tides/prediction-daily.json"
            )
            resp.raise_for_status()
        except httpx.HTTPError as exc:
            security_logger.warning(f"IPMA tides error: {exc}")
            raise HTTPException(status_code=502, detail="Marés indisponíveis de momento.")
    return JSONResponse(content=resp.json())


# --------------------------
# WebSocket para localização em tempo real
# --------------------------
@router.websocket("/ws/locations")
async def websocket_locations(websocket: WebSocket, token: str = None):
    # As mensagens difundidas contêm apenas dados públicos (id do vendedor e
    # coordenadas), os mesmos já expostos por GET /vendors/. A ligação é, por
    # isso, aberta a qualquer visitante — inclusive banhistas anónimos, que são
    # precisamente quem precisa das atualizações em tempo real do mapa. É este
    # canal que substitui o polling constante. O parâmetro `token` é aceite por
    # compatibilidade, mas não é exigido.
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
        try:
            await websocket.close()
        except Exception:
            pass


@router.post("/api/contact")
@limiter.limit("10/minute")
async def contact_form(
    request: Request,
    nome: str = Body(..., embed=True),
    email: str = Body(..., embed=True),
    assunto: str = Body(..., embed=True),
    mensagem: str = Body(..., embed=True),
):
    """Recebe o formulário de contacto e confirma o envio real do email."""
    # Normalizar os campos recebidos para evitar espaços acidentais no início ou no fim.
    contact_name = nome.strip()[:200]
    contact_email = email.strip()[:255]
    contact_subject = assunto.strip()[:500]
    contact_message = mensagem.strip()[:10000]

    # Validar todos os campos antes de tentar enviar o email.
    if not contact_name or not contact_email or not contact_subject or not contact_message:
        raise HTTPException(status_code=400, detail="Todos os campos são obrigatórios.")

    # Validar o formato do email para evitar mensagens sem remetente de resposta válido.
    if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", contact_email):
        raise HTTPException(status_code=400, detail="Introduz um email válido.")

    if len(contact_message) < 10:
        raise HTTPException(status_code=400, detail="Mensagem deve ter no mínimo 10 caracteres.")

    # Escapar o conteúdo do utilizador antes de montar o HTML do email.
    safe_name = escape(contact_name)
    safe_email = escape(contact_email)
    safe_subject = escape(contact_subject)
    safe_message = escape(contact_message).replace("\n", "<br>")

    html_body = f"""<html><body>
    <h2>Nova mensagem de contacto do Sunny Sales</h2>
    <p><strong>Nome:</strong> {safe_name}</p>
    <p><strong>Email:</strong> {safe_email}</p>
    <p><strong>Assunto:</strong> {safe_subject}</p>
    <p><strong>Mensagem:</strong></p>
    <p>{safe_message}</p>
    </body></html>"""

    try:
        email_sent = emails.send_email(
            to=CONTACT_EMAIL_TO,
            subject=f"[Sunny Sales] Contacto: {contact_subject}",
            body=(
                f"Nome: {contact_name}\n"
                f"Email: {contact_email}\n"
                f"Assunto: {contact_subject}\n\n"
                f"Mensagem:\n{contact_message}"
            ),
            html=html_body,
        )
    except httpx.HTTPError as exc:
        # Devolver erro claro quando o fornecedor de email rejeita ou falha o envio.
        security_logger.error(f"Contact email error: {exc}")
        raise HTTPException(
            status_code=502,
            detail="Não foi possível enviar a mensagem. Tenta novamente mais tarde.",
        )

    if not email_sent:
        raise HTTPException(
            status_code=503,
            detail="Serviço de email não configurado. Define RESEND_API_KEY para ativar o envio.",
        )

    return {"status": "success", "message": "Mensagem enviada com sucesso. Responderemos em breve!"}
