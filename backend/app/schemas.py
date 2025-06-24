# schemas.py - define os formatos de dados para entrada e saída
from pydantic import BaseModel
from typing import Optional, Literal

class UserLogin(BaseModel):
    email: str
    password: str

class VendorProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    product: Optional[Literal["Bolas de Berlim", "Gelados", "Acess\u00f3rios"]] = None
    profile_photo: Optional[str] = None
    pin_color: Optional[str] = None

class VendorCreate(BaseModel):
    name: str
    email: str
    password: str
    product: Literal["Bolas de Berlim", "Gelados", "Acess\u00f3rios"]
    profile_photo: str

class VendorOut(BaseModel):
    id: int
    name: str
    email: str
    product: str
    profile_photo: str
    pin_color: Optional[str] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    rating_average: Optional[float] = None
    subscription_active: Optional[bool] = None
    subscription_valid_until: Optional[str] = None
    last_seen: Optional[str] = None
    class Config:
        orm_mode = True


class ClientCreate(BaseModel):
    name: str
    email: str
    password: str
    profile_photo: str


class ClientOut(BaseModel):
    id: int
    name: str
    email: str
    profile_photo: str

    class Config:
        orm_mode = True


class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    response: str


class ReviewOut(BaseModel):
    id: int
    vendor_id: int
    client_name: Optional[str] = None
    client_profile_photo: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    response: Optional[str] = None
    active: bool

    class Config:
        orm_mode = True


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

    class Config:
        orm_mode = True


class PaidWeekOut(BaseModel):
    id: int
    start_date: str
    end_date: str
    receipt_url: Optional[str] = None

    class Config:
        orm_mode = True
