# tracking.py - partilha de localização e trajetos dos vendedores.

import json
from datetime import datetime

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import (
    MAX_GPS_ACCURACY_M,
    MAX_GPS_DISTANCE_M,
    MAX_GPS_SPEED_MPS,
    MIN_GPS_DISTANCE_M,
)
from ..database import get_db
from ..realtime import manager
from ..security import get_current_vendor
from ..utils import haversine, route_distance, utcnow

router = APIRouter()


def _jump_is_plausible(last_point: dict, moved: float, now) -> bool:
    """Diz se um salto maior que MAX_GPS_DISTANCE_M pode ser verdadeiro.

    É plausível quando o ponto anterior era impreciso (o erro estava nele, não
    na leitura nova) ou quando o tempo decorrido chega para o percorrer a uma
    velocidade possível.
    """
    last_acc = last_point.get("acc")
    if last_acc is not None and last_acc > MAX_GPS_ACCURACY_M:
        return True
    try:
        elapsed = (now - datetime.fromisoformat(last_point["t"])).total_seconds()
    except (KeyError, TypeError, ValueError):
        return False
    return elapsed > 0 and moved / elapsed <= MAX_GPS_SPEED_MPS

# --------------------------
# Atualizar localização do vendedor
# --------------------------
@router.put("/vendors/{vendor_id}/location")
async def update_vendor_location(
    vendor_id: int,
    lat: float = Body(...),
    lng: float = Body(...),
    # Raio de incerteza da leitura, em metros, tal como o GPS do telemóvel o
    # reporta. Opcional para as versões antigas da app continuarem a funcionar.
    accuracy: float | None = Body(None),
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
    now = utcnow()

    if last_point is not None:
        # Leitura demasiado imprecisa para mexer num pin que já existe: um fix
        # de rede com centenas de metros de erro só o afastava do vendedor.
        if accuracy is not None and accuracy > MAX_GPS_ACCURACY_M:
            return {"message": "Localização ignorada (precisão insuficiente)"}

        # Saltos grandes são quase sempre erro de satélite, MAS não quando o
        # ponto anterior é que estava errado (primeiro fix por rede, impreciso)
        # ou quando passou tempo suficiente para o salto ser possível. Antes o
        # salto era recusado sempre, e um primeiro ponto mal colocado prendia o
        # pin no sítio errado durante o resto do trajeto.
        moved = haversine(last_point["lat"], last_point["lng"], lat, lng)
        if moved > MAX_GPS_DISTANCE_M and not _jump_is_plausible(last_point, moved, now):
            return {"message": "Localização ignorada (salto de GPS anómalo)"}

    # A posição mostrada aos banhistas é sempre a mais recente que a app envia:
    # a app já filtra o tremer do GPS e só reenvia parado quando a precisão
    # melhora. Antes, tudo abaixo de 15 m era deitado fora, e o pin no mapa do
    # site ficava até 15 m ao lado do vendedor — ou preso no primeiro fix,
    # impreciso, mesmo depois de o GPS acertar.
    vendor.current_lat = lat
    vendor.current_lng = lng

    # Ao trajeto (distância percorrida) só entra movimento real: abaixo de
    # MIN_GPS_DISTANCE_M é ruído e faria o trajeto "andar sozinho" parado.
    if last_point is None or moved >= MIN_GPS_DISTANCE_M:
        point = {"lat": lat, "lng": lng, "t": now.isoformat()}
        if accuracy is not None:
            point["acc"] = accuracy
        points.append(point)
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
