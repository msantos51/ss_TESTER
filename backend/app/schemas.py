# schemas.py - define os formatos de dados para entrada e saída
from pydantic import BaseModel, ConfigDict, Field
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

class AccountDeleteRequest(BaseModel):
    """Reautenticação exigida para eliminar a conta (RGPD art. 17.º)."""

    password: str


class VendorProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    product: Optional[Literal["Bolas de Berlim", "Gelados", "Acessórios de Praia"]] = None
    profile_photo: Optional[str] = None
    pin_color: Optional[str] = None
    nif: Optional[str] = None
    id_document_number: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    beaches: Optional[str] = None
    product_categories: Optional[str] = None
    iban: Optional[str] = None
    business_name: Optional[str] = None

class VendorCreate(BaseModel):
    name: str
    email: str
    password: str
    product: Literal["Bolas de Berlim", "Gelados", "Acessórios de Praia"]
    profile_photo: str
    nif: str
    id_document_number: Optional[str] = None
    phone: str
    address: Optional[str] = None
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
    premium_active: Optional[bool] = None
    premium_valid_until: Optional[datetime] = None
    # Propriedade do modelo: subscrição Premium comprada E dentro da validade.
    is_premium: bool = False
    last_seen: Optional[str] = None
    payment_methods: Optional[str] = None
    nif: Optional[str] = None
    id_document_number: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    beaches: Optional[str] = None
    product_categories: Optional[str] = None
    iban: Optional[str] = None
    business_name: Optional[str] = None
    terms_accepted: Optional[bool] = None
    # Email novo a aguardar confirmação (alteração de email pendente)
    pending_email: Optional[str] = None
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
    # Marca o vendedor como Premium: é o que põe a estrela no pin do mapa.
    is_premium: bool = False
    # Média das avaliações (1 a 5) e número de votos acumulados. As avaliações
    # só podem ser submetidas enquanto o vendedor for Premium (tem QR code), mas
    # persistem e continuam a aparecer mesmo após a subscrição expirar.
    rating_average: Optional[float] = None
    rating_count: int = 0
    model_config = ConfigDict(from_attributes=True)


class ReviewCreate(BaseModel):
    """Avaliação submetida por quem lê o QR: 1 a 5 estrelas."""

    rating: int = Field(..., ge=1, le=5)


class ReviewSummary(BaseModel):
    """Resumo das avaliações de um vendedor."""

    average: Optional[float] = None
    count: int = 0


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
    pin_color: Optional[str] = None

    # Configuração para permitir criação a partir de objetos ORM
    model_config = ConfigDict(from_attributes=True)


class PaidWeekOut(BaseModel):
    id: int
    start_date: datetime
    end_date: datetime
    receipt_url: Optional[str] = None
    plan: Optional[str] = None

    # Configuração para permitir criação a partir de objetos ORM
    model_config = ConfigDict(from_attributes=True)


class ProductOut(BaseModel):
    id: int
    name: str
    price: float
    photo: Optional[str] = None

    # Configuração para permitir criação a partir de objetos ORM
    model_config = ConfigDict(from_attributes=True)


class StoryOut(BaseModel):
    id: int
    media_url: str
    created_at: str

    # Configuração para permitir criação a partir de objetos ORM
    model_config = ConfigDict(from_attributes=True)

