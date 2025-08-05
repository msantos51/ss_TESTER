# Testes automatizados do backend com pytest
import os
import importlib
import shutil

import pytest
from fastapi.testclient import TestClient

# Fixture to create a new app with a fresh database for each test
@pytest.fixture()
def client(tmp_path):
    # setup DATABASE_URL for tests
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test.db?check_same_thread=False"

    # reload application modules so they pick up the new DATABASE_URL
    from backend.app import database, models, main
    importlib.reload(database)
    importlib.reload(models)
    importlib.reload(main)

    sent_emails = []

    def fake_send_email(to, subject, body):
        sent_emails.append({"to": to, "subject": subject, "body": body})

    main.send_email = fake_send_email

    # create tables
    models.Base.metadata.create_all(bind=database.engine)

    with TestClient(main.app) as c:
        c.sent_emails = sent_emails
        yield c

    # cleanup created profile photos directory if it exists
    if os.path.exists("profile_photos"):
        shutil.rmtree("profile_photos")

def register_vendor(client, email="vendor@example.com", password="Secret123", name="Vendor"):
    data = {
        "name": name,
        "email": email,
        "password": password,
        "product": "Bolas de Berlim",
    }
    files = {"profile_photo": ("test.png", b"fakeimage", "image/png")}
    return client.post("/vendors/", data=data, files=files)


def activate_subscription(client, vendor_id):
    token = get_token(client)
    resp = client.post(
        f"/vendors/{vendor_id}/activate-subscription",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    return token



def confirm_latest_email(client):
    body = client.sent_emails[-1]["body"]
    token = body.split("/confirm-email/")[1]
    return client.get(f"/confirm-email/{token}")


def test_vendor_registration(client):
    resp = register_vendor(client)
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["email"] == "vendor@example.com"
    assert payload["product"] == "Bolas de Berlim"


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


def test_single_session(client):
    register_vendor(client, email="single@example.com")
    confirm_latest_email(client)

    token1 = get_token(client, email="single@example.com")
    resp = client.get(
        "/vendors/me",
        headers={"Authorization": f"Bearer {token1}"},
    )
    assert resp.status_code == 200

    # Tentar gerar um novo token sem forçar deve falhar
    resp = client.post(
        "/token",
        json={"email": "single@example.com", "password": "Secret123"},
    )
    assert resp.status_code == 409

    # Gerar um novo token forçando o logout anterior
    token2 = get_token(client, email="single@example.com", force=True)
    resp = client.get(
        "/vendors/me",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert resp.status_code == 200

    # O token atual armazenado deve corresponder ao novo token
    from backend.app import models, database

    db = database.SessionLocal()
    try:
        vendor = db.query(models.Vendor).filter(models.Vendor.email == "single@example.com").first()
        assert vendor.session_token == token2
    finally:
        db.close()

    # Token antigo deve deixar de ser válido
    resp = client.get(
        "/vendors/me",
        headers={"Authorization": f"Bearer {token1}"},
    )
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
    client.post("/password-reset-request", data={"email": "vendor@example.com"})
    body = client.sent_emails[-1]["body"]
    token = body.split("/password-reset/")[1]
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
    emails = [v["email"] for v in vendors]
    assert "first@example.com" in emails and "second@example.com" in emails
    for v in vendors:
        assert "current_lat" in v and "current_lng" in v


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
    client.post("/password-reset-request", data={"email": "vendor@example.com"})
    body = client.sent_emails[-1]["body"]
    token = body.split("/password-reset/")[1]

    resp = client.get(f"/password-reset/{token}")
    assert resp.status_code == 200
    assert "<form" in resp.text and token in resp.text


def test_paid_weeks_listing(client):
    resp = register_vendor(client)
    vendor_id = resp.json()["id"]
    confirm_latest_email(client)

    event = {
        "type": "checkout.session.completed",
        "data": {"object": {"metadata": {"vendor_id": vendor_id}, "url": "http://r"}},
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



