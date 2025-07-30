# models.py - define as tabelas no PostgreSQL
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

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
    pin_color = Column(String, default="#FFB6C1")
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    subscription_active = Column(Boolean, default=False)
    subscription_valid_until = Column(DateTime, nullable=True)
    email_confirmed = Column(Boolean, default=False)
    confirmation_token = Column(String, nullable=True, index=True)
    password_reset_token = Column(String, nullable=True, index=True)
    password_reset_expires = Column(DateTime, nullable=True)

    routes = relationship("Route", back_populates="vendor")


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
    start_time = Column(DateTime, default=datetime.utcnow)
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
    start_date = Column(DateTime, default=datetime.utcnow)
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
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)

    vendor = relationship("Vendor")

