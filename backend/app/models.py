# models.py - define as tabelas no PostgreSQL
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base


def utcnow():
    """Return current UTC time as a naive datetime."""
    return datetime.now(timezone.utc).replace(tzinfo=None)

# Vendor
class Vendor(Base):
    """Tabela principal de vendedores (utilizadores)."""

    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    product = Column(String)
    profile_photo = Column(String)
    pin_color = Column(String, default="#7B61FF")
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    subscription_active = Column(Boolean, default=False)
    subscription_valid_until = Column(DateTime, nullable=True)
    email_confirmed = Column(Boolean, default=False)
    confirmation_token = Column(String, nullable=True, index=True)
    password_reset_token = Column(String, nullable=True, index=True)
    password_reset_expires = Column(DateTime, nullable=True)
    session_token = Column(String, nullable=True, index=True)
    payment_methods = Column(String, nullable=True)

    # Licença
    license_number = Column(String, nullable=True)
    license_municipality = Column(String, nullable=True)
    license_expiry = Column(DateTime, nullable=True)
    license_type = Column(String, nullable=True)
    license_document = Column(String, nullable=True)

    # Identificação e compliance
    nif = Column(String, nullable=True, unique=True, index=True)
    id_document_number = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)

    # Operacional
    beaches = Column(String, nullable=True)
    product_categories = Column(String, nullable=True)
    iban = Column(String, nullable=True)
    business_name = Column(String, nullable=True)

    # Compliance
    terms_accepted = Column(Boolean, default=False)
    terms_accepted_at = Column(DateTime, nullable=True)

    routes = relationship("Route", back_populates="vendor")
    sessions = relationship(
        "VendorSession", back_populates="vendor", cascade="all, delete-orphan"
    )


# VendorSession
class VendorSession(Base):
    """Sessões ativas de cada vendedor."""

    __tablename__ = "vendor_sessions"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), index=True)
    token = Column(String, unique=True, index=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    vendor = relationship("Vendor", back_populates="sessions")


# Client
class Client(Base):
    """Utilizador cliente que pode avaliar e guardar favoritos."""

    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    profile_photo = Column(String)
    email_confirmed = Column(Boolean, default=False)
    confirmation_token = Column(String, nullable=True, index=True)
    password_reset_token = Column(String, nullable=True, index=True)
    password_reset_expires = Column(DateTime, nullable=True)
    google_id = Column(String, unique=True, index=True, nullable=True)
    apple_id = Column(String, unique=True, index=True, nullable=True)



# Route
class Route(Base):
    """Trajetos percorridos pelos vendedores."""

    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    start_time = Column(DateTime, default=utcnow)
    end_time = Column(DateTime, nullable=True)
    points = Column(String)
    distance_m = Column(Float, default=0.0)

    vendor = relationship("Vendor", back_populates="routes")


# PaidWeek
class PaidWeek(Base):
    """Registo de semanas pagas pelos vendedores."""

    __tablename__ = "paid_weeks"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    start_date = Column(DateTime, default=utcnow)
    end_date = Column(DateTime)
    receipt_url = Column(String, nullable=True)

    vendor = relationship("Vendor")


# Story
class Story(Base):
    """Stories efêmeras publicadas pelos vendedores."""

    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    media_path = Column(String)
    created_at = Column(DateTime, default=utcnow)
    expires_at = Column(DateTime)

    vendor = relationship("Vendor")

