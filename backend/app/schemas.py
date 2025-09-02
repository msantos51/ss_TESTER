# schemas.py - define os formatos de dados para entrada e saída
from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from datetime import datetime

# UserLogin
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

# VendorProfileUpdate
class VendorProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    product: Optional[Literal["Bolas de Berlim", "Gelados", "Acess\u00f3rios"]] = None
    profile_photo: Optional[str] = None
    pin_color: Optional[str] = None

# VendorCreate
class VendorCreate(BaseModel):
    name: str
    email: str
    password: str
    product: Literal["Bolas de Berlim", "Gelados", "Acess\u00f3rios"]
    profile_photo: str

# VendorOut
class VendorOut(BaseModel):
    id: int
    name: str
    email: str
    product: str
    profile_photo: str
    pin_color: Optional[str] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    subscription_active: Optional[bool] = None
    subscription_valid_until: Optional[datetime] = None
    last_seen: Optional[str] = None
    # Configuração para permitir criação a partir de objetos ORM
    model_config = ConfigDict(from_attributes=True)





# RoutePoint
class RoutePoint(BaseModel):
    lat: float
    lng: float
    t: str


# RouteOut
class RouteOut(BaseModel):
    id: int
    start_time: str
    end_time: Optional[str]
    distance_m: float
    points: list[RoutePoint]

    # Configuração para permitir criação a partir de objetos ORM
    model_config = ConfigDict(from_attributes=True)


# PaidWeekOut
class PaidWeekOut(BaseModel):
    id: int
    start_date: datetime
    end_date: datetime
    receipt_url: Optional[str] = None

    # Configuração para permitir criação a partir de objetos ORM
    model_config = ConfigDict(from_attributes=True)


# StoryOut
class StoryOut(BaseModel):
    id: int
    media_url: str
    created_at: str

    # Configuração para permitir criação a partir de objetos ORM
    model_config = ConfigDict(from_attributes=True)
