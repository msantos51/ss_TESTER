# schemas.py - define os formatos de dados para entrada e saída
from pydantic import BaseModel
from typing import Optional, Literal

# UserLogin
class UserLogin(BaseModel):
    email: str
    password: str

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
    rating_average: Optional[float] = None
    subscription_active: Optional[bool] = None
    subscription_valid_until: Optional[str] = None
    last_seen: Optional[str] = None
    # Config
    class Config:
        orm_mode = True


# ClientCreate
class ClientCreate(BaseModel):
    name: str
    email: str
    password: str
    profile_photo: str


# ClientOut
class ClientOut(BaseModel):
    id: int
    name: str
    email: str
    profile_photo: str

    # Config
    class Config:
        orm_mode = True


# ReviewCreate
class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None


# ReviewResponse
class ReviewResponse(BaseModel):
    response: str


# ReviewOut
class ReviewOut(BaseModel):
    id: int
    vendor_id: int
    client_name: Optional[str] = None
    client_profile_photo: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    response: Optional[str] = None
    active: bool

    # Config
    class Config:
        orm_mode = True


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

    # Config
    class Config:
        orm_mode = True


# PaidWeekOut
class PaidWeekOut(BaseModel):
    id: int
    start_date: str
    end_date: str
    receipt_url: Optional[str] = None

    # Config
    class Config:
        orm_mode = True


# StoryOut
class StoryOut(BaseModel):
    id: int
    media_url: str
    created_at: str

    # Config
    class Config:
        orm_mode = True
