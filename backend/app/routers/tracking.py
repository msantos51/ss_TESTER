# tracking.py - partilha de localização e trajetos dos vendedores.

import json

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import MAX_GPS_DISTANCE_M, MIN_GPS_DISTANCE_M
from ..database import get_db
from ..realtime import manager
from ..security import get_current_vendor
from ..utils import haversine, route_distance, utcnow

router = APIRouter()

# --------------------------
# Atualizar localização do vendedor
# --------------------------
@router.put("/vendors/{vendor_id}/location")
async def update_vendor_location(
    vendor_id: int,
    lat: float = Body(...),
    lng: float = Body(...),
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # only allow updates if the vendor has an active route
    active_route = (
        db.query(models.Route)
        .filter(models.Route.vendor_id == vendor_id, models.Route.end_time == None)
        .order_by(models.Route.start_time.desc())
        .first()
    )
    if not active_route:
        raise HTTPException(status_code=400, detail="Location sharing inactive")

    points = json.loads(active_route.points or "[]")
    last_point = points[-1] if points else None

    # Ignora leituras de GPS demasiado próximas ou demasiado afastadas:
    # - Próximas (< 15m): ruído de GPS não deve ser contabilizado como movimento
    # - Afastadas (> 2km): saltos impossíveis de GPS (erro de satélite, etc.)
    if last_point is not None:
        moved = haversine(last_point["lat"], last_point["lng"], lat, lng)
        if moved < MIN_GPS_DISTANCE_M:
            return {"message": "Localização ignorada (ruído de GPS)"}
        if moved > MAX_GPS_DISTANCE_M:
            return {"message": "Localização ignorada (salto de GPS anómalo)"}

    vendor.current_lat = lat
    vendor.current_lng = lng
    points.append({"lat": lat, "lng": lng, "t": utcnow().isoformat()})
    active_route.points = json.dumps(points)
    db.commit()

    await manager.broadcast({"vendor_id": vendor_id, "lat": lat, "lng": lng})
    return {"message": "Localização atualizada com sucesso"}


# --------------------------
# Iniciar e terminar trajetos
# --------------------------
@router.post("/vendors/{vendor_id}/routes/start", response_model=schemas.RouteOut)
def start_route(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # close any previously active routes to avoid duplicates
    active_routes = (
        db.query(models.Route)
        .filter(models.Route.vendor_id == vendor_id, models.Route.end_time == None)
        .all()
    )
    for r in active_routes:
        r.distance_m = route_distance(json.loads(r.points or "[]"))
        r.end_time = utcnow()

    route = models.Route(vendor_id=vendor_id, points="[]")
    db.add(route)
    db.commit()
    db.refresh(route)
    return {
        "id": route.id,
        "start_time": route.start_time.isoformat(),
        "end_time": route.end_time,
        "distance_m": route.distance_m,
        "points": [],
    }


@router.post("/vendors/{vendor_id}/routes/stop", response_model=schemas.RouteOut)
async def stop_route(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    routes = (
        db.query(models.Route)
        .filter(models.Route.vendor_id == vendor_id, models.Route.end_time == None)
        .order_by(models.Route.start_time.desc())
        .all()
    )
    if not routes:
        raise HTTPException(status_code=404, detail="Route not found")

    latest = routes[0]
    for r in routes:
        r.distance_m = route_distance(json.loads(r.points or "[]"))
        r.end_time = utcnow()

    # Clear vendor's current location so clients remove it from the map
    current_vendor.current_lat = None
    current_vendor.current_lng = None
    db.commit()
    for r in routes:
        db.refresh(r)
    db.refresh(current_vendor)
    # Notify via websocket that the vendor stopped sharing location
    await manager.broadcast({
        "vendor_id": vendor_id,
        "lat": None,
        "lng": None,
        "remove": True,
    })

    return {
        "id": latest.id,
        "start_time": latest.start_time.isoformat(),
        "end_time": latest.end_time.isoformat(),
        "distance_m": latest.distance_m,
        "points": json.loads(latest.points or "[]"),
    }


@router.get("/vendors/{vendor_id}/routes", response_model=list[schemas.RouteOut])
def list_routes(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_vendor: models.Vendor = Depends(get_current_vendor),
):
    if current_vendor.id != vendor_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    routes = (
        db.query(models.Route)
        .filter(models.Route.vendor_id == vendor_id)
        .order_by(models.Route.start_time.desc())
        .all()
    )
    result = []
    for r in routes:
        result.append(
            {
                "id": r.id,
                "start_time": r.start_time.isoformat(),
                "end_time": r.end_time.isoformat() if r.end_time else None,
                "distance_m": r.distance_m,
                "points": json.loads(r.points or "[]"),
                "pin_color": r.vendor.pin_color,
            }
        )
    return result
