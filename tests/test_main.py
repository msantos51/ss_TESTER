# Testes automatizados do backend com pytest
import os
import sys
import itertools
import shutil
from datetime import datetime, timedelta

import pytest
import stripe
from fastapi.testclient import TestClient

# Fixture to create a new app with a fresh database for each test
@pytest.fixture()
def client(tmp_path):
    # setup DATABASE_URL for tests
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test.db?check_same_thread=False"
    os.environ["ADMIN_TOKEN"] = "test-admin-token"
    os.environ["STRIPE_WEBHOOK_SECRET"] = "test-webhook-secret"

    # Descartar os módulos já importados para que a aplicação volte a ser
    # construída do zero com a DATABASE_URL (e restantes variáveis) do teste.
    for name in [m for m in sys.modules if m == "backend" or m.startswith("backend.")]:
        del sys.modules[name]

    from backend.app import database, emails, models, main

    sent_emails = []

    def fake_send_email(to, subject, body, html=None):
        sent_emails.append({"to": to, "subject": subject, "body": body, "html": html})
        return True

    emails.send_email = fake_send_email

    # nos testes não há um pedido Stripe real assinado; simular a verificação
    # da assinatura para se poder testar o fluxo do webhook isoladamente
    stripe.Webhook.construct_event = lambda payload, sig, secret: __import__("json").loads(payload)

    # create tables
    models.Base.metadata.create_all(bind=database.engine)

    with TestClient(main.app) as c:
        c.sent_emails = sent_emails
        yield c

    # cleanup created upload directories if they exist
    for upload_dir in ("profile_photos", "product_photos"):
        if os.path.exists(upload_dir):
            shutil.rmtree(upload_dir)

_nif_counter = itertools.count(1)


def make_nif():
    """Gera um NIF português válido e único para cada registo de teste."""
    base = f"1{next(_nif_counter):07d}"
    check = sum(int(base[i]) * (9 - i) for i in range(8))
    remainder = check % 11
    control = 0 if remainder < 2 else 11 - remainder
    return base + str(control)


def register_vendor(client, email="vendor@example.com", password="Secret123", name="Vendor"):
    data = {
        "name": name,
        "email": email,
        "password": password,
        "product": "Bolas de Berlim",
        "nif": make_nif(),
        "id_document_number": "12345678",
        "phone": "912345678",
        "address": "Rua de Teste 1",
        "beaches": "Carcavelos",
        "product_categories": "Bolas de Berlim",
        "terms_accepted": "true",
    }
    files = {
        "profile_photo": ("test.png", b"fakeimage", "image/png"),
    }
    return client.post("/vendors/", data=data, files=files)


def activate_premium(client, vendor_id):
    """Credita Premium a mão de admin e devolve o token do vendedor."""
    token = get_token(client)
    resp = client.post(
        f"/vendors/{vendor_id}/activate-premium",
        headers={"X-Admin-Token": os.environ["ADMIN_TOKEN"]},
    )
    assert resp.status_code == 200
    return token



def confirm_latest_email(client):
    body = client.sent_emails[-1]["body"]
    token = body.split("/confirm-email/")[1].split()[0].strip()
    return client.get(f"/confirm-email/{token}")



def test_contact_form_sends_email_to_sunny_sales(client):
    """Garante que o formulário de contacto envia email para a caixa correta."""

    resp = client.post(
        "/api/contact",
        json={
            "nome": "Cliente Teste",
            "email": "cliente@example.com",
            "assunto": "Informação geral",
            "mensagem": "Quero saber mais informações sobre a Sunny Sales.",
        },
    )

    assert resp.status_code == 200
    assert client.sent_emails[-1]["to"] == "sunnysales.geral@gmail.com"
    assert "cliente@example.com" in client.sent_emails[-1]["body"]


def test_contact_form_rejects_invalid_email(client):
    """Valida que o backend rejeita emails de contacto inválidos."""

    resp = client.post(
        "/api/contact",
        json={
            "nome": "Cliente Teste",
            "email": "email-invalido",
            "assunto": "Informação geral",
            "mensagem": "Esta mensagem tem caracteres suficientes.",
        },
    )

    assert resp.status_code == 400
    assert resp.json()["detail"] == "Introduz um email válido."

def test_vendor_registration(client):
    resp = register_vendor(client)
    assert resp.status_code == 201
    payload = resp.json()
    assert payload["email"] == "vendor@example.com"
    assert payload["product"] == "Bolas de Berlim"
    assert "email_sent" in payload


def get_token(client, email="vendor@example.com", password="Secret123", force=False):
    payload = {"email": email, "password": password}
    if force:
        payload["force"] = True
    resp = client.post("/token", json=payload)
    assert resp.status_code == 200
    return resp.json()["access_token"]




def test_token_generation(client):
    register_vendor(client)
    confirm_latest_email(client)
    token = get_token(client)
    assert token


def test_session_management(client):
    register_vendor(client, email="single@example.com")
    confirm_latest_email(client)

    token1 = get_token(client, email="single@example.com")

    # Segunda tentativa sem force deve devolver 409
    resp = client.post("/token", json={"email": "single@example.com", "password": "Secret123"})
    assert resp.status_code == 409

    # token1 continua válido
    resp = client.get("/vendors/me", headers={"Authorization": f"Bearer {token1}"})
    assert resp.status_code == 200

    # Com force=True a sessão anterior é terminada e é criada uma nova
    token2 = get_token(client, email="single@example.com", force=True)

    # token1 deve agora ser inválido
    resp = client.get("/vendors/me", headers={"Authorization": f"Bearer {token1}"})
    assert resp.status_code == 401

    # token2 é válido e é a única sessão
    resp = client.get("/vendors/me/sessions", headers={"Authorization": f"Bearer {token2}"})
    sessions = resp.json()
    assert len(sessions) == 1

    # Eliminar a sessão atual via DELETE invalida token2
    resp = client.delete(
        f"/vendors/me/sessions/{sessions[0]['id']}",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert resp.status_code == 200

    resp = client.get("/vendors/me", headers={"Authorization": f"Bearer {token2}"})
    assert resp.status_code == 401


def test_login_requires_confirmation(client):
    register_vendor(client, email="new@example.com")
    resp = client.post("/login", json={"email": "new@example.com", "password": "Secret123"})
    assert resp.status_code == 403
    assert "Email not confirmed" in resp.json()["detail"]

    confirm_latest_email(client)
    resp = client.post("/login", json={"email": "new@example.com", "password": "Secret123"})
    assert resp.status_code == 200


def test_login_accepts_username_field(client):
    """O endpoint /login deve aceitar o campo 'username' como alias de email."""

    register_vendor(client, email="alias@example.com")
    confirm_latest_email(client)

    resp = client.post(
        "/login",
        json={"username": "alias@example.com", "password": "Secret123"},
    )
    assert resp.status_code == 200


def test_login_with_vendor_name(client):
    """Permite autenticar usando o nome do vendedor."""

    register_vendor(client, email="nome@example.com", name="vendedor1")
    confirm_latest_email(client)

    resp = client.post(
        "/login",
        json={"username": "vendedor1", "password": "Secret123"},
    )
    assert resp.status_code == 200


def test_password_reset_flow(client):
    register_vendor(client)
    confirm_latest_email(client)
    client.post("/password-reset-request", json={"email": "vendor@example.com"})
    body = client.sent_emails[-1]["body"]
    token = body.split("/password-reset/")[1].split()[0].strip()
    resp = client.post(f"/password-reset/{token}", data={"new_password": "Newpass1"})
    assert resp.status_code == 200
    resp = client.post("/token", json={"email": "vendor@example.com", "password": "Newpass1"})
    assert resp.status_code == 200


def test_vendor_listing(client):
    register_vendor(client, email="first@example.com", name="First")
    confirm_latest_email(client)
    register_vendor(client, email="second@example.com", name="Second")
    confirm_latest_email(client)
    resp = client.get("/vendors/")
    assert resp.status_code == 200
    vendors = resp.json()
    # A listagem pública não expõe email (ver VendorPublicOut); identifica pelo nome.
    names = [v["name"] for v in vendors]
    assert "First" in names and "Second" in names
    for v in vendors:
        assert "current_lat" in v and "current_lng" in v
        assert "email" not in v


def test_vendor_listing_authenticated_vendor(client):
    resp = register_vendor(client, email="auth1@example.com", name="Auth1")
    vid = resp.json()["id"]
    confirm_latest_email(client)

    register_vendor(client, email="auth2@example.com", name="Auth2")
    confirm_latest_email(client)

    token = get_token(client, email="auth1@example.com")
    resp = client.get("/vendors/", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    vendors = resp.json()
    assert len(vendors) == 1
    assert vendors[0]["id"] == vid


def test_protected_routes(client):
    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = activate_premium(client, vendor_id)

    # update profile with auth
    resp = client.patch(
        f"/vendors/{vendor_id}/profile",
        data={"name": "New"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "New"

    # update profile without auth
    resp = client.patch(f"/vendors/{vendor_id}/profile", data={"name": "Fail"})
    assert resp.status_code == 401

    # update location with auth
    client.post(
        f"/vendors/{vendor_id}/routes/start",
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = client.put(
        f"/vendors/{vendor_id}/location",
        json={"lat": 1.0, "lng": 2.0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200


def test_update_registration_fields(client):
    """O vendedor pode alterar os dados que introduziu no registo."""
    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = get_token(client)

    new_nif = make_nif()
    resp = client.patch(
        f"/vendors/{vendor_id}/profile",
        data={
            "phone": "961112233",
            "business_name": "Praia & Sol Lda",
            "nif": new_nif,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["phone"] == "961112233"
    assert body["business_name"] == "Praia & Sol Lda"
    assert body["nif"] == new_nif


def test_update_profile_rejects_invalid_nif(client):
    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = get_token(client)

    resp = client.patch(
        f"/vendors/{vendor_id}/profile",
        data={"nif": "123456788"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400
    assert resp.json()["detail"] == "NIF inválido"


def test_email_change_requires_confirmation(client):
    """Alterar o email não é imediato: exige confirmação por email."""
    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = get_token(client)

    resp = client.patch(
        f"/vendors/{vendor_id}/profile",
        data={"email": "novo@example.com"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    # o email ainda não mudou; fica pendente até confirmação
    assert body["email"] == "vendor@example.com"
    assert body["pending_email"] == "novo@example.com"

    # foi enviado um email de confirmação para o novo endereço
    last = client.sent_emails[-1]
    assert last["to"] == "novo@example.com"
    assert "/confirm-email-change/" in last["body"]

    # login com o email antigo continua a funcionar
    assert client.post(
        "/token", json={"email": "vendor@example.com", "password": "Secret123", "force": True}
    ).status_code == 200
    # ainda não é possível autenticar com o novo email
    assert client.post(
        "/token", json={"email": "novo@example.com", "password": "Secret123", "force": True}
    ).status_code != 200

    # confirmar a alteração através do link
    change_token = last["body"].split("/confirm-email-change/")[1].split()[0].strip()
    confirm = client.get(f"/confirm-email-change/{change_token}")
    assert confirm.status_code == 200

    # agora o login passa a ser feito com o novo email
    assert client.post(
        "/token", json={"email": "novo@example.com", "password": "Secret123", "force": True}
    ).status_code == 200
    # e o email antigo deixa de ser válido
    assert client.post(
        "/token", json={"email": "vendor@example.com", "password": "Secret123", "force": True}
    ).status_code != 200


def test_email_change_rejects_duplicate(client):
    register_vendor(client, email="a@example.com")
    second = register_vendor(client, email="b@example.com")
    vendor_id = second.json()["id"]
    confirm_latest_email(client)
    token = get_token(client, email="b@example.com")

    resp = client.patch(
        f"/vendors/{vendor_id}/profile",
        data={"email": "a@example.com"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Email already in use"


def test_location_update_fields(client):
    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = activate_premium(client, vendor_id)

    client.post(
        f"/vendors/{vendor_id}/routes/start",
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = client.put(
        f"/vendors/{vendor_id}/location",
        json={"lat": 10.5, "lng": -20.3},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200

    resp = client.get("/vendors/")
    assert resp.status_code == 200
    vendors = resp.json()
    vendor = next(v for v in vendors if v["id"] == vendor_id)
    assert vendor["current_lat"] == 10.5
    assert vendor["current_lng"] == -20.3


def test_websocket_location_broadcast(client):
    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = activate_premium(client, vendor_id)

    client.post(
        f"/vendors/{vendor_id}/routes/start",
        headers={"Authorization": f"Bearer {token}"},
    )
    with client.websocket_connect(f"/ws/locations?token={token}") as websocket:
        resp = client.put(
            f"/vendors/{vendor_id}/location",
            json={"lat": 5.5, "lng": -7.1},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = websocket.receive_json()
        assert data == {"vendor_id": vendor_id, "lat": 5.5, "lng": -7.1}




def test_routes_flow(client):
    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = activate_premium(client, vendor_id)

    # start route
    resp = client.post(
        f"/vendors/{vendor_id}/routes/start",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200

    # send a couple of locations
    client.put(
        f"/vendors/{vendor_id}/location",
        json={"lat": 1.0, "lng": 1.0},
        headers={"Authorization": f"Bearer {token}"},
    )
    client.put(
        f"/vendors/{vendor_id}/location",
        json={"lat": 1.001, "lng": 1.001},
        headers={"Authorization": f"Bearer {token}"},
    )

    # stop route
    resp = client.post(
        f"/vendors/{vendor_id}/routes/stop",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    route = resp.json()
    assert route["distance_m"] >= 0
    assert len(route["points"]) >= 2

    # vendor location should be cleared after stopping route
    resp = client.get("/vendors/")
    assert resp.status_code == 200
    vendor = next(v for v in resp.json() if v["id"] == vendor_id)
    assert vendor["current_lat"] is None and vendor["current_lng"] is None

    # list routes
    resp = client.get(
        f"/vendors/{vendor_id}/routes",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    routes = resp.json()
    assert len(routes) == 1


def test_password_reset_form(client):
    register_vendor(client)
    confirm_latest_email(client)
    client.post("/password-reset-request", json={"email": "vendor@example.com"})
    body = client.sent_emails[-1]["body"]
    token = body.split("/password-reset/")[1].split()[0].strip()

    resp = client.get(f"/password-reset/{token}")
    assert resp.status_code == 200
    assert "<form" in resp.text and token in resp.text


def test_paid_weeks_listing(client):
    # O recibo é obtido a partir da fatura Stripe associada à sessão.
    stripe.Invoice.retrieve = lambda invoice_id: {"hosted_invoice_url": "http://r"}

    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)

    event = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "metadata": {"vendor_id": vendor_id},
                "invoice": "in_test",
                "payment_status": "paid",
            }
        },
    }
    resp = client.post(
        "/stripe/webhook", json=event, headers={"stripe-signature": "test-sig"}
    )
    assert resp.status_code == 200

    token = get_token(client)
    resp = client.get(
        f"/vendors/{vendor_id}/paid-weeks",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    weeks = resp.json()
    assert len(weeks) == 1
    assert weeks[0]["receipt_url"] == "http://r"

def test_stripe_webhook_rejects_the_old_visibility_plans(client):
    """Os planos de visibilidade acabaram: um webhook com um deles não credita.

    Um checkout antigo que só agora conclua — ou um pedido forjado — não pode
    ressuscitar um plano que a app já não vende.
    """
    for plan in ("semanal", "quinzenal", "mensal"):
        resp = register_vendor(client, email=f"{plan}@example.com")
        vendor_id = resp.json()["id"]
        confirm_latest_email(client)
        token = get_token(client, email=f"{plan}@example.com")

        event = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": f"cs_test_{plan}",
                    "metadata": {"vendor_id": vendor_id, "plan": plan},
                    "payment_status": "paid",
                }
            },
        }
        resp = client.post(
            "/stripe/webhook", json=event, headers={"stripe-signature": "test-sig"}
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "ignored"

        resp = client.get("/vendors/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json()["is_premium"] is False

        resp = client.get(
            f"/vendors/{vendor_id}/paid-weeks",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.json() == []


def test_create_checkout_session_uses_one_time_payment(client):
    """O checkout deve ser criado em modo de PAGAMENTO ÚNICO (sem renovação)."""
    captured = {}

    def fake_create(**kwargs):
        captured.update(kwargs)
        return type("S", (), {"url": "https://checkout.stripe.test/session_abc"})()

    stripe.checkout.Session.create = fake_create

    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = get_token(client)

    # Sem `plan`: o checkout abre no Premium, a única compra da plataforma.
    resp = client.post(
        f"/vendors/{vendor_id}/create-checkout-session",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["checkout_url"] == "https://checkout.stripe.test/session_abc"
    # Garantir que NÃO é uma subscrição recorrente
    assert captured["mode"] == "payment"
    # O montante do Premium é 19,99 € = 1999 cêntimos
    assert captured["line_items"][0]["price_data"]["unit_amount"] == 1999
    assert captured["line_items"][0]["price_data"]["currency"] == "eur"
    assert captured["metadata"]["plan"] == "premium"


def test_create_checkout_session_rejects_invalid_plan(client):
    """Só "premium" é aceite — incluindo contra os nomes dos planos antigos."""
    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = get_token(client)

    for plan in ("anual", "semanal", "quinzenal", "mensal"):
        resp = client.post(
            f"/vendors/{vendor_id}/create-checkout-session",
            params={"plan": plan},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 400
        assert resp.json()["detail"] == "Invalid plan"


def test_stripe_webhook_is_idempotent(client):
    """Um webhook reenviado com o mesmo id de sessão não credita duas vezes."""
    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = get_token(client)

    event = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "cs_test_dup_1",
                "metadata": {"vendor_id": vendor_id, "plan": "premium"},
                "payment_status": "paid",
            }
        },
    }

    first = client.post("/stripe/webhook", json=event, headers={"stripe-signature": "sig"})
    assert first.status_code == 200
    second = client.post("/stripe/webhook", json=event, headers={"stripe-signature": "sig"})
    assert second.status_code == 200
    assert second.json()["status"] == "already_processed"

    # Apesar dos dois envios, só existe UM período pago.
    resp = client.get(
        f"/vendors/{vendor_id}/paid-weeks",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_stripe_webhook_receipt_from_payment_intent(client):
    """Em modo pagamento único o recibo vem da cobrança do payment_intent."""
    stripe.PaymentIntent.retrieve = lambda pi_id, expand=None: {
        "latest_charge": {"receipt_url": "https://receipt.stripe.test/r1"}
    }

    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = get_token(client)

    event = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "cs_test_pi_1",
                "metadata": {"vendor_id": vendor_id, "plan": "premium"},
                "payment_intent": "pi_test_1",
                "payment_status": "paid",
            }
        },
    }
    resp = client.post("/stripe/webhook", json=event, headers={"stripe-signature": "sig"})
    assert resp.status_code == 200

    resp = client.get(
        f"/vendors/{vendor_id}/paid-weeks",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    weeks = resp.json()
    assert len(weeks) == 1
    assert weeks[0]["receipt_url"] == "https://receipt.stripe.test/r1"


def test_websocket_open_to_anonymous_visitors(client):
    """O canal de tempo real do mapa deve aceitar banhistas anónimos (sem token)."""
    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = activate_premium(client, vendor_id)

    client.post(
        f"/vendors/{vendor_id}/routes/start",
        headers={"Authorization": f"Bearer {token}"},
    )
    # Ligação SEM token — como um banhista qualquer no site.
    with client.websocket_connect("/ws/locations") as websocket:
        resp = client.put(
            f"/vendors/{vendor_id}/location",
            json={"lat": 6.6, "lng": -8.2},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = websocket.receive_json()
        assert data == {"vendor_id": vendor_id, "lat": 6.6, "lng": -8.2}


def test_free_vendor_can_share_location(client):
    """Estar no mapa é gratuito: sem Premium, a partilha funciona na mesma.

    Era aqui que vivia o antigo bloqueio por subscrição inativa. Agora não há
    nada a pagar para aparecer, por isso um vendedor que nunca comprou tem de
    conseguir abrir um trajeto e enviar posição.
    """
    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Nunca comprou nada.
    resp = client.get("/vendors/me", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["is_premium"] is False

    resp = client.post(f"/vendors/{vendor_id}/routes/start", headers=headers)
    assert resp.status_code == 200

    resp = client.put(
        f"/vendors/{vendor_id}/location",
        json={"lat": 38.68, "lng": -9.33},
        headers=headers,
    )
    assert resp.status_code == 200

    resp = client.post(f"/vendors/{vendor_id}/routes/stop", headers=headers)
    assert resp.status_code == 200


def test_cors_allows_capacitor_mobile_origin(client):
    """A app móvel (Capacitor) faz fetch a partir da origem https://localhost.

    Sem essa origem na lista de CORS, a WebView do Android bloqueia a resposta
    e o ecrã inicial mostra "Failed to fetch". Este teste garante que a origem
    da app móvel é aceite tanto num pedido simples como no preflight.
    """
    # Pedido simples (GET) — cenário exato do ecrã inicial a carregar /vendors.
    resp = client.get("/vendors/", headers={"Origin": "https://localhost"})
    assert resp.status_code == 200
    assert resp.headers.get("access-control-allow-origin") == "https://localhost"

    # Preflight (OPTIONS) para um pedido autenticado a partir da app móvel.
    resp = client.options(
        "/vendors/",
        headers={
            "Origin": "https://localhost",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization",
        },
    )
    assert resp.status_code == 200
    assert resp.headers.get("access-control-allow-origin") == "https://localhost"


def test_cors_rejects_unknown_origin(client):
    """Origens não autorizadas continuam sem receber cabeçalhos de CORS."""
    resp = client.get(
        "/vendors/", headers={"Origin": "https://malicious.example.com"}
    )
    assert resp.status_code == 200
    assert "access-control-allow-origin" not in resp.headers



# --------------------------
# RGPD — exportação e eliminação da conta
# --------------------------

def _vendor_with_data(client):
    """Regista um vendedor com trajeto, produto e pagamento associados."""
    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = activate_premium(client, vendor_id)
    headers = {"Authorization": f"Bearer {token}"}

    client.post(f"/vendors/{vendor_id}/routes/start", headers=headers)
    client.put(
        f"/vendors/{vendor_id}/location", json={"lat": 38.68, "lng": -9.33}, headers=headers
    )
    client.post(f"/vendors/{vendor_id}/routes/stop", headers=headers)
    client.post(
        f"/vendors/{vendor_id}/products",
        data={"name": "Bola de Berlim", "price": "1.5"},
        headers=headers,
    )
    return vendor_id, token, headers


def test_export_my_data_returns_all_personal_data(client):
    """RGPD art. 20.º: o titular consegue descarregar tudo o que guardamos."""
    vendor_id, _token, headers = _vendor_with_data(client)

    resp = client.get("/vendors/me/export", headers=headers)
    assert resp.status_code == 200
    assert "attachment" in resp.headers["content-disposition"]
    assert f"sunny-sales-dados-{vendor_id}.json" in resp.headers["content-disposition"]

    data = resp.json()
    assert data["conta"]["id"] == vendor_id
    assert data["conta"]["email"] == "vendor@example.com"
    assert data["conta"]["telefone"] == "912345678"
    assert len(data["trajetos"]) == 1
    assert data["trajetos"][0]["pontos"]
    assert len(data["produtos"]) == 1
    assert data["produtos"][0]["nome"] == "Bola de Berlim"
    assert len(data["pagamentos"]) == 1
    assert len(data["sessoes"]) == 1


def test_export_requires_authentication(client):
    assert client.get("/vendors/me/export").status_code in (401, 403)


def test_delete_account_requires_correct_password(client):
    """Uma palavra-passe errada não pode destruir a conta de ninguém."""
    vendor_id, _token, headers = _vendor_with_data(client)

    resp = client.request(
        "DELETE", "/vendors/me", json={"password": "ErradaXYZ1"}, headers=headers
    )
    assert resp.status_code == 401

    # A conta continua intacta e utilizável.
    assert client.get("/vendors/me", headers=headers).status_code == 200
    listed = client.get("/vendors/").json()
    assert any(v["id"] == vendor_id for v in listed)


def test_delete_account_erases_personal_data(client):
    """RGPD art. 17.º: os dados pessoais desaparecem e a conta deixa de existir."""
    from backend.app import database, models

    vendor_id, _token, headers = _vendor_with_data(client)

    resp = client.request(
        "DELETE", "/vendors/me", json={"password": "Secret123"}, headers=headers
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "deleted"

    # Deixa de autenticar, por token antigo ou por credenciais.
    assert client.get("/vendors/me", headers=headers).status_code == 401
    assert client.post(
        "/login", json={"email": "vendor@example.com", "password": "Secret123"}
    ).status_code == 401
    assert client.post(
        "/token", json={"email": "vendor@example.com", "password": "Secret123"}
    ).status_code == 401

    # Desaparece do mapa público e do detalhe.
    assert all(v["id"] != vendor_id for v in client.get("/vendors/").json())
    assert client.get(f"/vendors/{vendor_id}").status_code == 404

    db = database.SessionLocal()
    try:
        # Trajetos GPS e produtos apagados de facto; sessões terminadas.
        assert db.query(models.Route).filter_by(vendor_id=vendor_id).count() == 0
        assert db.query(models.Product).filter_by(vendor_id=vendor_id).count() == 0
        assert db.query(models.VendorSession).filter_by(vendor_id=vendor_id).count() == 0

        # O registo de pagamentos subsiste — obrigação fiscal (10 anos).
        assert db.query(models.PaidWeek).filter_by(vendor_id=vendor_id).count() == 1

        vendor = db.query(models.Vendor).filter_by(id=vendor_id).first()
        assert vendor is not None
        assert vendor.deleted_at is not None
        assert vendor.email == f"apagado+{vendor_id}@sunnysales.invalid"
        assert vendor.name == "Conta eliminada"
        assert vendor.premium_active is False
        for field in (
            "nif",
            "phone",
            "address",
            "iban",
            "id_document_number",
            "business_name",
            "profile_photo",
            "beaches",
            "current_lat",
            "current_lng",
        ):
            assert getattr(vendor, field) is None, f"{field} não foi anonimizado"
    finally:
        db.close()


def test_deleted_account_frees_the_email_for_a_new_registration(client):
    """Quem elimina a conta pode voltar a registar-se com o mesmo email."""
    _vendor_id, _token, headers = _vendor_with_data(client)
    client.request("DELETE", "/vendors/me", json={"password": "Secret123"}, headers=headers)

    resp = register_vendor(client, email="vendor@example.com")
    assert resp.status_code == 201


def test_stripe_webhook_ignores_deleted_account(client):
    """Um checkout que conclua depois da eliminação não pode creditar a conta."""
    from backend.app import database, models

    vendor_id, _token, headers = _vendor_with_data(client)
    client.request("DELETE", "/vendors/me", json={"password": "Secret123"}, headers=headers)

    event = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "cs_test_apos_eliminacao",
                "payment_status": "paid",
                "client_reference_id": str(vendor_id),
                "metadata": {"vendor_id": str(vendor_id), "plan": "premium"},
            }
        },
    }
    resp = client.post(
        "/stripe/webhook",
        json=event,
        headers={"stripe-signature": "test"},
    )
    assert resp.status_code == 200

    db = database.SessionLocal()
    try:
        vendor = db.query(models.Vendor).filter_by(id=vendor_id).first()
        assert vendor.premium_active is False
        # Continua a existir apenas o pagamento anterior à eliminação.
        assert db.query(models.PaidWeek).filter_by(vendor_id=vendor_id).count() == 1
    finally:
        db.close()


def test_password_reset_ignores_deleted_account(client):
    """A lápide de uma conta eliminada não gera tokens de recuperação."""
    from backend.app import database, models

    vendor_id, _token, headers = _vendor_with_data(client)
    client.request("DELETE", "/vendors/me", json={"password": "Secret123"}, headers=headers)

    tombstone = f"apagado+{vendor_id}@sunnysales.invalid"
    resp = client.post("/password-reset-request", json={"email": tombstone})
    assert resp.status_code == 200  # resposta neutra, como para um email inexistente

    db = database.SessionLocal()
    try:
        vendor = db.query(models.Vendor).filter_by(id=vendor_id).first()
        assert vendor.password_reset_token is None
    finally:
        db.close()


# ══════════════════════════════════════════════════════════════════
# Premium — a única compra da plataforma. Sem ele o vendedor fica no
# gratuito, que já o põe no mapa.
# ══════════════════════════════════════════════════════════════════
def grant_premium(client, vendor_id):
    """Credita Premium pelo caminho real: o webhook do Stripe."""
    event = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "metadata": {"vendor_id": vendor_id, "plan": "premium"},
                "payment_status": "paid",
            }
        },
    }
    resp = client.post(
        "/stripe/webhook", json=event, headers={"stripe-signature": "test-sig"}
    )
    assert resp.status_code == 200


def premium_vendor_sharing(client, email="premium@example.com", premium=True):
    """Vendedor confirmado, Premium opcional e trajeto a decorrer."""
    resp = register_vendor(client, email=email)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = get_token(client, email=email)
    if premium:
        grant_premium(client, vendor_id)
    resp = client.post(
        f"/vendors/{vendor_id}/routes/start",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    return vendor_id, token


def send_location(client, vendor_id, token, lat, lng):
    return client.put(
        f"/vendors/{vendor_id}/location",
        json={"lat": lat, "lng": lng},
        headers={"Authorization": f"Bearer {token}"},
    )


def test_premium_webhook_credits_thirty_days(client):
    """O Premium dá 30 dias e fica registado nas faturas como tal."""
    from backend.app.utils import utcnow

    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = get_token(client)

    before = utcnow()
    grant_premium(client, vendor_id)
    after = utcnow()

    resp = client.get("/vendors/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    vendor = resp.json()

    assert vendor["premium_active"] is True
    assert vendor["is_premium"] is True
    valid_until = datetime.fromisoformat(vendor["premium_valid_until"])
    assert before + timedelta(days=30) <= valid_until <= after + timedelta(days=30)

    # O pagamento fica registado nas faturas, identificado como Premium.
    resp = client.get(
        f"/vendors/{vendor_id}/paid-weeks",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert [w["plan"] for w in resp.json()] == ["premium"]


def test_premium_checkout_charges_the_premium_price(client):
    """O checkout do Premium cobra 19,99 € como pagamento único."""
    captured = {}

    def fake_create(**kwargs):
        captured.update(kwargs)
        return type("S", (), {"url": "https://checkout.stripe.test/premium"})()

    stripe.checkout.Session.create = fake_create

    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = get_token(client)

    resp = client.post(
        f"/vendors/{vendor_id}/create-checkout-session",
        params={"plan": "premium"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert captured["mode"] == "payment"
    assert captured["line_items"][0]["price_data"]["unit_amount"] == 1999
    assert captured["metadata"]["plan"] == "premium"


def test_premium_expired_stops_giving_the_advantages(client):
    """Premium fora da validade deixa de contar, mesmo com a flag ligada."""
    from backend.app import database, models

    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = get_token(client)
    grant_premium(client, vendor_id)

    db = database.SessionLocal()
    try:
        vendor = db.query(models.Vendor).filter_by(id=vendor_id).first()
        vendor.premium_valid_until = models.utcnow() - timedelta(minutes=1)
        db.commit()
    finally:
        db.close()

    resp = client.get("/vendors/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.json()["is_premium"] is False
    assert resp.json()["premium_active"] is False


def test_reach_radius_is_300m_without_premium_and_1km_with_it(client):
    """O raio de alcance é a vantagem Premium mais direta: 300 m contra 1 km."""
    free_id, free_token = premium_vendor_sharing(
        client, email="free-reach@example.com", premium=False
    )
    premium_id, premium_token = premium_vendor_sharing(
        client, email="premium-reach@example.com", premium=True
    )

    # Os dois vendedores na mesma posição; só muda quem tem Premium.
    send_location(client, free_id, free_token, 38.7000, -9.4000)
    send_location(client, premium_id, premium_token, 38.7000, -9.4000)

    def visible_ids(lat, lng):
        resp = client.get("/vendors/", params={"lat": lat, "lng": lng})
        assert resp.status_code == 200
        return {v["id"] for v in resp.json()}

    # Banhista em cima dos dois: vê ambos.
    near = visible_ids(38.7000, -9.4000)
    assert {free_id, premium_id} <= near

    # ~550 m a norte: fora dos 300 m do gratuito, dentro do 1 km do Premium.
    middle = visible_ids(38.7050, -9.4000)
    assert free_id not in middle
    assert premium_id in middle

    # ~1,7 km: fora do alcance de ambos.
    far = visible_ids(38.7150, -9.4000)
    assert free_id not in far
    assert premium_id not in far

    # Sem posição não há distância a medir: devolvem-se todos, como antes.
    resp = client.get("/vendors/")
    assert {free_id, premium_id} <= {v["id"] for v in resp.json()}


def test_vendor_listing_exposes_is_premium(client):
    """O mapa precisa de saber quem é Premium para desenhar a estrela."""
    vendor_id, token = premium_vendor_sharing(client, email="star@example.com")
    send_location(client, vendor_id, token, 38.7000, -9.4000)

    resp = client.get("/vendors/")
    assert resp.status_code == 200
    vendor = next(v for v in resp.json() if v["id"] == vendor_id)
    assert vendor["is_premium"] is True
    # O subconjunto público continua sem dados pessoais.
    assert "email" not in vendor and "nif" not in vendor


def test_products_require_premium(client):
    """Sem Premium não se criam nem editam produtos — nem com foto, nem sem."""
    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    photo = {"photo": ("p.png", b"fakeimage", "image/png")}

    for files in (None, photo):
        resp = client.post(
            f"/vendors/{vendor_id}/products",
            data={"name": "Bola de Berlim", "price": "1.50"},
            files=files,
            headers=headers,
        )
        assert resp.status_code == 403
        assert "Premium" in resp.json()["detail"]

    # Com Premium passa, com nome, preço e foto.
    grant_premium(client, vendor_id)
    resp = client.post(
        f"/vendors/{vendor_id}/products",
        data={"name": "Gelado", "price": "2.00"},
        files=photo,
        headers=headers,
    )
    assert resp.status_code == 200
    assert resp.json()["photo"]
    product_id = resp.json()["id"]

    resp = client.put(
        f"/vendors/{vendor_id}/products/{product_id}",
        data={"name": "Gelado", "price": "2.20"},
        headers=headers,
    )
    assert resp.status_code == 200
    assert resp.json()["price"] == 2.2


def test_products_are_hidden_when_premium_ends(client):
    """Sem Premium os produtos ficam guardados mas saem do cartão do mapa.

    O vendedor continua a vê-los na app (para os apagar), mas já não os pode
    editar; apagar é sempre possível.
    """
    from backend.app import database, models

    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = get_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    grant_premium(client, vendor_id)

    resp = client.post(
        f"/vendors/{vendor_id}/products",
        data={"name": "Bola de Berlim", "price": "1.50"},
        headers=headers,
    )
    product_id = resp.json()["id"]

    # Com Premium, o público vê o produto.
    assert [p["id"] for p in client.get(f"/vendors/{vendor_id}/products").json()] == [product_id]

    db = database.SessionLocal()
    try:
        vendor = db.query(models.Vendor).filter_by(id=vendor_id).first()
        vendor.premium_valid_until = models.utcnow() - timedelta(minutes=1)
        db.commit()
    finally:
        db.close()

    # Premium acabou: o público deixa de ver, o próprio vendedor continua a ver.
    assert client.get(f"/vendors/{vendor_id}/products").json() == []
    own = client.get(f"/vendors/{vendor_id}/products", headers=headers).json()
    assert [p["id"] for p in own] == [product_id]

    resp = client.put(
        f"/vendors/{vendor_id}/products/{product_id}",
        data={"name": "Bola de Berlim", "price": "1.60"},
        headers=headers,
    )
    assert resp.status_code == 403

    resp = client.delete(f"/vendors/{vendor_id}/products/{product_id}", headers=headers)
    assert resp.status_code == 200
    assert client.get(f"/vendors/{vendor_id}/products", headers=headers).json() == []


def test_deleting_the_account_clears_the_premium_it_had(client):
    """O Premium morre com a conta: apagá-la não deixa a vantagem de pé."""
    from backend.app import database, models

    vendor_id, token = premium_vendor_sharing(client, email="apagavel@example.com")

    resp = client.request(
        "DELETE",
        "/vendors/me",
        json={"password": "Secret123"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200

    db = database.SessionLocal()
    try:
        vendor = db.query(models.Vendor).filter_by(id=vendor_id).first()
        assert vendor.premium_active is False
        assert vendor.premium_valid_until is None
    finally:
        db.close()


# --------------------------
# Avaliações (QR code — token de uso único gerado ao abrir o URL)
# O QR code é de todos os vendedores; o que o Premium acrescenta é mostrar a
# pontuação (média e nº de estrelas) no cartão do mapa e no separador do QR.
# --------------------------
def _fresh_token(client, vendor_id: int) -> str:
    """Simula a abertura do URL do QR code: pede um token de avaliação fresco."""
    resp = client.post(f"/vendors/{vendor_id}/review-token")
    assert resp.status_code == 200
    return resp.json()["token"]


def test_review_premium_vendor_updates_average(client):
    """Avaliar um vendedor Premium regista a estrela e devolve a média."""
    vendor_id, _ = premium_vendor_sharing(client, email="avaliado@example.com")
    t = _fresh_token(client, vendor_id)

    resp = client.post(f"/vendors/{vendor_id}/reviews", json={"rating": 4}, params={"t": t})
    assert resp.status_code == 200
    assert resp.json() == {"average": 4.0, "count": 1}

    # O resumo público reflete a avaliação.
    resp = client.get(f"/vendors/{vendor_id}/reviews/summary")
    assert resp.json() == {"average": 4.0, "count": 1}


def test_review_token_is_single_use(client):
    """O mesmo token não pode ser usado duas vezes — segundo uso retorna 410."""
    vendor_id, _ = premium_vendor_sharing(client, email="usorepetido@example.com")
    t = _fresh_token(client, vendor_id)

    first = client.post(f"/vendors/{vendor_id}/reviews", json={"rating": 5}, params={"t": t})
    assert first.status_code == 200

    second = client.post(f"/vendors/{vendor_id}/reviews", json={"rating": 3}, params={"t": t})
    assert second.status_code == 410


def test_review_without_token_rejected(client):
    """Submeter sem token retorna 422 (parâmetro obrigatório em falta)."""
    vendor_id, _ = premium_vendor_sharing(client, email="semtoken@example.com")
    resp = client.post(f"/vendors/{vendor_id}/reviews", json={"rating": 4})
    assert resp.status_code == 422


def test_review_rejects_out_of_range(client):
    """Só 1 a 5 estrelas são aceites."""
    vendor_id, _ = premium_vendor_sharing(client, email="fora@example.com")
    t1 = _fresh_token(client, vendor_id)
    t2 = _fresh_token(client, vendor_id)
    assert client.post(f"/vendors/{vendor_id}/reviews", json={"rating": 0}, params={"t": t1}).status_code == 422
    assert client.post(f"/vendors/{vendor_id}/reviews", json={"rating": 6}, params={"t": t2}).status_code == 422


def test_review_accepted_for_free_vendor(client):
    """Sem Premium o vendedor também recolhe avaliações — só não as mostra."""
    vendor_id, _ = premium_vendor_sharing(client, email="gratuito@example.com", premium=False)
    t = _fresh_token(client, vendor_id)
    resp = client.post(f"/vendors/{vendor_id}/reviews", json={"rating": 5}, params={"t": t})
    assert resp.status_code == 200
    # A pontuação fica escondida: mostrá-la é que é a vantagem Premium.
    assert resp.json() == {"average": None, "count": 0}
    assert client.get(f"/vendors/{vendor_id}/reviews/summary").json() == {"average": None, "count": 0}
    entry = client.get(f"/vendors/{vendor_id}").json()
    assert entry["rating_average"] is None and entry["rating_count"] == 0

    # Um token inválido continua a ser recusado.
    assert client.post(
        f"/vendors/{vendor_id}/reviews", json={"rating": 5}, params={"t": "qualquercoisa"}
    ).status_code == 410


def test_review_token_endpoint(client):
    """review-token devolve um token novo para cada pedido."""
    vendor_id, _ = premium_vendor_sharing(client, email="novotoken@example.com")
    r1 = client.post(f"/vendors/{vendor_id}/review-token")
    r2 = client.post(f"/vendors/{vendor_id}/review-token")
    assert r1.status_code == 200
    assert r2.status_code == 200
    assert r1.json()["token"] != r2.json()["token"]


def test_rating_average_appears_in_public_listing(client):
    """A média entra no schema público que alimenta o cartão do mapa."""
    vendor_id, token = premium_vendor_sharing(client, email="nolisting@example.com")
    send_location(client, vendor_id, token, 38.0, -9.0)
    t = _fresh_token(client, vendor_id)
    client.post(f"/vendors/{vendor_id}/reviews", json={"rating": 3}, params={"t": t})

    resp = client.get("/vendors/")
    assert resp.status_code == 200
    entry = next(v for v in resp.json() if v["id"] == vendor_id)
    assert entry["rating_average"] == 3.0
    assert entry["rating_count"] == 1


def test_qr_available_for_every_vendor(client):
    """O QR code PNG existe para qualquer vendedor; URL é estático."""
    premium_id, _ = premium_vendor_sharing(client, email="comqr@example.com")
    resp = client.get(f"/vendors/{premium_id}/qr.png")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "image/png"
    assert resp.content[:8] == b"\x89PNG\r\n\x1a\n"

    # Sem Premium o QR é igual: é a pontuação que fica reservada ao Premium.
    free_id, _ = premium_vendor_sharing(client, email="semqr@example.com", premium=False)
    free_resp = client.get(f"/vendors/{free_id}/qr.png")
    assert free_resp.status_code == 200
    assert free_resp.content[:8] == b"\x89PNG\r\n\x1a\n"


def _start_sharing(client):
    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = get_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    client.post(f"/vendors/{vendor_id}/routes/start", headers=headers)
    return vendor_id, headers


def _current_position(client, vendor_id):
    vendor = next(v for v in client.get("/vendors/").json() if v["id"] == vendor_id)
    return vendor["current_lat"], vendor["current_lng"]


def test_small_correction_updates_pin_but_not_route(client):
    """Uma correção de poucos metros mexe no pin, mas não conta como trajeto."""
    vendor_id, headers = _start_sharing(client)
    url = f"/vendors/{vendor_id}/location"
    client.put(url, json={"lat": 38.68, "lng": -9.33, "accuracy": 40}, headers=headers)
    # ~5 m ao lado, já com o GPS mais afinado.
    resp = client.put(url, json={"lat": 38.68004, "lng": -9.33, "accuracy": 5}, headers=headers)
    assert resp.status_code == 200
    assert _current_position(client, vendor_id) == (38.68004, -9.33)

    route = client.post(f"/vendors/{vendor_id}/routes/stop", headers=headers).json()
    assert len(route["points"]) == 1


def test_imprecise_first_fix_can_be_corrected_by_large_jump(client):
    """Um primeiro fix por rede, errado por quilómetros, não prende o pin."""
    vendor_id, headers = _start_sharing(client)
    url = f"/vendors/{vendor_id}/location"
    client.put(url, json={"lat": 38.70, "lng": -9.30, "accuracy": 1500}, headers=headers)
    # ~5 km a sul, com GPS a sério: é a posição verdadeira.
    client.put(url, json={"lat": 38.655, "lng": -9.30, "accuracy": 6}, headers=headers)
    assert _current_position(client, vendor_id) == (38.655, -9.30)


def test_large_jump_after_precise_fix_is_still_ignored(client):
    vendor_id, headers = _start_sharing(client)
    url = f"/vendors/{vendor_id}/location"
    client.put(url, json={"lat": 38.70, "lng": -9.30, "accuracy": 5}, headers=headers)
    resp = client.put(url, json={"lat": 38.655, "lng": -9.30, "accuracy": 5}, headers=headers)
    assert "anómalo" in resp.json()["message"]
    assert _current_position(client, vendor_id) == (38.70, -9.30)


def test_imprecise_reading_does_not_move_existing_pin(client):
    vendor_id, headers = _start_sharing(client)
    url = f"/vendors/{vendor_id}/location"
    client.put(url, json={"lat": 38.70, "lng": -9.30, "accuracy": 5}, headers=headers)
    resp = client.put(url, json={"lat": 38.702, "lng": -9.30, "accuracy": 400}, headers=headers)
    assert "precisão" in resp.json()["message"]
    assert _current_position(client, vendor_id) == (38.70, -9.30)
