# utils.py - funções puras partilhadas por toda a aplicação.
#
# Este módulo não conhece FastAPI nem a base de dados: só cálculo e validação.
# É por isso que pode ser importado de qualquer lado sem criar ciclos.

from datetime import datetime, timezone
from math import radians, sin, cos, sqrt, atan2


def utcnow():
    """Return current UTC time as a naive datetime."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1 = radians(lat1)
    phi2 = radians(lat2)
    dphi = radians(lat2 - lat1)
    dlambda = radians(lon2 - lon1)
    a = sin(dphi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(dlambda / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


def route_distance(points: list[dict]) -> float:
    """Comprimento em metros de um trajeto, somando as pernas entre pontos."""
    return sum(
        haversine(p1["lat"], p1["lng"], p2["lat"], p2["lng"])
        for p1, p2 in zip(points, points[1:])
    )


def validate_nif(nif: str) -> bool:
    """Valida o dígito de controlo de um NIF português."""
    if len(nif) != 9 or not nif.isdigit():
        return False
    if nif[0] not in ("1", "2", "3", "5", "6", "7", "8", "9"):
        return False
    check = 0
    for i in range(8):
        check += int(nif[i]) * (9 - i)
    remainder = check % 11
    control = 0 if remainder < 2 else 11 - remainder
    return int(nif[8]) == control
