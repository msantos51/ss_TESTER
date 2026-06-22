# schemas.py - define os formatos de dados para entrada e saída
from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from datetime import datetime

class UserLogin(BaseModel):
    """Schema usado para autenticação de vendedores.

    Aceita tanto o campo tradicional ``email`` como ``username``
    (alias utilizado por algumas bibliotecas OAuth2). Um dos dois
    deve ser fornecido juntamente com a palavra‑passe.
    """

    email: Optional[str] = None
    username: Optional[str] = None
    password: str
    force: bool = False

class VendorProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    product: Optional[Literal["Bolas de Berlim", "Gelados", "Acessórios de Praia"]] = None
    profile_photo: Optional[str] = None
    pin_color: Optional[str] = None

class VendorCreate(BaseModel):
    name: str
    email: str
    password: str
    product: Literal["Bolas de Berlim", "Gelados", "Acessórios de Praia"]
    profile_photo: str
    license_number: str
    license_municipality: str
    license_expiry: str
    license_type: str
    nif: str
    id_document_number: str
    phone: str
    address: str
    beaches: str
    product_categories: str
    iban: Optional[str] = None
    business_name: Optional[str] = None
    terms_accepted: bool

class VendorOut(BaseModel):
    id: int
    name: str
    email: str
    product: str
    profile_photo: Optional[str] = None
    pin_color: Optional[str] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    subscription_active: Optional[bool] = None
    subscription_valid_until: Optional[datetime] = None
    last_seen: Optional[str] = None
    payment_methods: Optional[str] = None
    license_number: Optional[str] = None
    license_municipality: Optional[str] = None
    license_expiry: Optional[datetime] = None
    license_type: Optional[str] = None
    nif: Optional[str] = None
    phone: Optional[str] = None
    beaches: Optional[str] = None
    product_categories: Optional[str] = None
    business_name: Optional[str] = None
    terms_accepted: Optional[bool] = None
    model_config = ConfigDict(from_attributes=True)


# VendorPublicOut - subconjunto seguro exposto a utilizadores não autenticados
# (mapa público). Nunca incluir email, nif, phone, license_number, business_name.
class VendorPublicOut(BaseModel):
    id: int
    name: str
    product: str
    profile_photo: Optional[str] = None
    pin_color: Optional[str] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    last_seen: Optional[str] = None
    beaches: Optional[str] = None
    product_categories: Optional[str] = None
    payment_methods: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class RoutePoint(BaseModel):
    lat: float
    lng: float
    t: str


class RouteOut(BaseModel):
    id: int
    start_time: str
    end_time: Optional[str]
    distance_m: float
    points: list[RoutePoint]

    # Configuração para permitir criação a partir de objetos ORM
    model_config = ConfigDict(from_attributes=True)


class PaidWeekOut(BaseModel):
    id: int
    start_date: datetime
    end_date: datetime
    receipt_url: Optional[str] = None

    # Configuração para permitir criação a partir de objetos ORM
    model_config = ConfigDict(from_attributes=True)


class StoryOut(BaseModel):
    id: int
    media_url: str
    created_at: str

    # Configuração para permitir criação a partir de objetos ORM
    model_config = ConfigDict(from_attributes=True)
