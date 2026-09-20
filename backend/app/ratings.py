# ratings.py - agregação das avaliações (1 a 5 estrelas) dos vendedores.

from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models


def rating_summary(db: Session, vendor_id: int) -> tuple[float | None, int]:
    """Média (arredondada a 1 casa) e número de avaliações de um vendedor."""
    avg, count = (
        db.query(func.avg(models.Review.rating), func.count(models.Review.id))
        .filter(models.Review.vendor_id == vendor_id)
        .one()
    )
    if not count:
        return None, 0
    return round(float(avg), 1), int(count)


def attach_ratings(db: Session, vendors: list[models.Vendor]) -> None:
    """Preenche `rating_average`/`rating_count` em cada vendedor de uma lista.

    Faz uma só query agregada para toda a lista, evitando um pedido por
    vendedor (problema N+1).
    """
    ids = [v.id for v in vendors]
    ratings: dict[int, tuple[float, int]] = {}
    if ids:
        rows = (
            db.query(
                models.Review.vendor_id,
                func.avg(models.Review.rating),
                func.count(models.Review.id),
            )
            .filter(models.Review.vendor_id.in_(ids))
            .group_by(models.Review.vendor_id)
            .all()
        )
        ratings = {vid: (round(float(avg), 1), int(cnt)) for vid, avg, cnt in rows}
    for v in vendors:
        avg, cnt = ratings.get(v.id, (None, 0))
        # Toda a gente recolhe avaliações, mas mostrar a pontuação é Premium:
        # sem ele o cartão do mapa sai sem média, como se não houvesse votos.
        if not v.is_premium:
            avg, cnt = None, 0
        v.rating_average = avg
        v.rating_count = cnt
