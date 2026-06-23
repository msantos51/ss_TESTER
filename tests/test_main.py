# Testes automatizados do backend com pytest
import os
import importlib
import itertools
import shutil

import pytest
from fastapi.testclient import TestClient

# Fixture to create a new app with a fresh database for each test
@pytest.fixture()
def client(tmp_path):
    # setup DATABASE_URL for tests
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test.db?check_same_thread=False"
    os.environ["ADMIN_TOKEN"] = "test-admin-token"
    os.environ["STRIPE_WEBHOOK_SECRET"] = "test-webhook-secret"

    # reload application modules so they pick up the new DATABASE_URL
    from backend.app import database, models, main
    importlib.reload(database)
    importlib.reload(models)
    importlib.reload(main)

    sent_emails = []

    def fake_send_email(to, subject, body, html=None):
        sent_emails.append({"to": to, "subject": subject, "body": body, "html": html})
        return True

    main.send_email = fake_send_email

    # nos testes não há um pedido Stripe real assinado; simular a verificação
    # da assinatura para se poder testar o fluxo do webhook isoladamente
    main.stripe.Webhook.construct_event = lambda payload, sig, secret: __import__("json").loads(payload)

    # create tables
    models.Base.metadata.create_all(bind=database.engine)

    with TestClient(main.app) as c:
        c.sent_emails = sent_emails
        yield c

    # cleanup created profile photos directory if it exists
    if os.path.exists("profile_photos"):
        shutil.rmtree("profile_photos")

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


def activate_subscription(client, vendor_id):
    token = get_token(client)
    resp = client.post(
        f"/vendors/{vendor_id}/activate-subscription",
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
    assert resp.status_code == 400
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
    token = activate_subscription(client, vendor_id)

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


def test_location_update_fields(client):
    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)
    token = activate_subscription(client, vendor_id)

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
    token = activate_subscription(client, vendor_id)

    client.post(
        f"/vendors/{vendor_id}/routes/start",
        headers={"Authorization": f"Bearer {token}"},
    )
    with client.websocket_connect("/ws/locations") as websocket:
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
    token = activate_subscription(client, vendor_id)

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
    from backend.app import main

    # O recibo é obtido a partir da fatura Stripe associada à sessão.
    main.stripe.Invoice.retrieve = lambda invoice_id: {"hosted_invoice_url": "http://r"}

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
    resp = client.post("/stripe/webhook", json=event)
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



