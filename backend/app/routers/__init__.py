"""Routers da API, agrupados por área funcional."""

from . import admin, auth, catalog, payments, public, reviews, tracking, vendors

__all__ = [
    "admin",
    "auth",
    "catalog",
    "payments",
    "public",
    "reviews",
    "tracking",
    "vendors",
]
