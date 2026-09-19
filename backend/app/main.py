# main.py - criação da aplicação FastAPI: middlewares, ficheiros estáticos e
# montagem dos routers. As rotas vivem em `routers/`, agrupadas por área.

from pathlib import Path
import time

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded

from . import models
from .config import (
    ALLOWED_HOSTS,
    ALLOWED_ORIGINS,
    limiter,
)
from .database import engine, ensure_latest_schema
from .routers import admin, auth, catalog, payments, public, reviews, tracking, vendors
from .storage import (
    PRODUCT_PHOTO_DIR,
    PROFILE_PHOTO_DIR,
    STORY_DIR,
    supabase,
)

app = FastAPI()
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={"detail": "Demasiadas requisições. Tenta novamente mais tarde."}
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=3600,
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=ALLOWED_HOSTS
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' fonts.gstatic.com; connect-src 'self' https: wss:"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(self), microphone=(), camera=()"
    return response


# --------------------------
# Base de dados
# --------------------------
def _init_db(max_retries: int = 5, retry_delay: int = 5) -> None:
    """Cria as tabelas, com retry para quando a BD ainda não está disponível."""
    for attempt in range(max_retries):
        try:
            models.Base.metadata.create_all(bind=engine)
            ensure_latest_schema()
            return
        except Exception as exc:
            if attempt == max_retries - 1:
                raise
            print(f"⚠️  Base de dados não disponível (tentativa {attempt + 1}/{max_retries}): {exc}. A aguardar {retry_delay}s...")
            time.sleep(retry_delay)


_init_db()


# --------------------------
# Ficheiros enviados (só sem Supabase: em produção vivem nos buckets)
# --------------------------
if not supabase:
    app.mount("/profile_photos", StaticFiles(directory=PROFILE_PHOTO_DIR), name="profile_photos")
    app.mount("/stories", StaticFiles(directory=STORY_DIR), name="stories")
    app.mount("/product_photos", StaticFiles(directory=PRODUCT_PHOTO_DIR), name="product_photos")


# --------------------------
# Rotas da API
# --------------------------
app.include_router(public.router)
app.include_router(auth.router)
app.include_router(vendors.router)
app.include_router(reviews.router)
app.include_router(tracking.router)
app.include_router(catalog.router)
app.include_router(payments.router)
app.include_router(admin.router)


# --------------------------
# SPA: servir o frontend React (deve ficar APÓS todas as rotas de API para
# não interceptar chamadas como GET /vendors/ ou GET /vendors/me)
# --------------------------

# Cache-Control por tipo de ficheiro:
# - index.html: no-cache (o browser revalida sempre e apanha novos deploys);
# - /assets/*: o Vite gera nomes com hash, por isso podem ser imutáveis;
# - restantes estáticos (logótipos, fontes): cache moderada de 7 dias.
_INDEX_CACHE = "no-cache"
_IMMUTABLE_CACHE = "public, max-age=31536000, immutable"
_STATIC_CACHE = "public, max-age=604800"

WEB_DIST = Path(__file__).resolve().parents[2] / "sunny_sales_web" / "dist"


class ImmutableStaticFiles(StaticFiles):
    """StaticFiles com cache imutável de 1 ano.

    Seguro para /assets porque o Vite gera nomes de ficheiro com hash do
    conteúdo — qualquer alteração produz um URL novo (invalidação correta).
    """

    def file_response(self, *args, **kwargs):
        response = super().file_response(*args, **kwargs)
        response.headers["Cache-Control"] = _IMMUTABLE_CACHE
        return response


def _index_response(web_dist_root: Path) -> FileResponse:
    return FileResponse(
        web_dist_root / "index.html",
        headers={"Cache-Control": _INDEX_CACHE},
    )


if WEB_DIST.is_dir():
    # Ficheiros estáticos gerados pelo Vite (JS/CSS), com nomes já hasheados.
    assets_path = WEB_DIST / "assets"
    if assets_path.is_dir():
        app.mount("/assets", ImmutableStaticFiles(directory=str(assets_path)), name="assets")

    @app.get("/", response_class=HTMLResponse, include_in_schema=False)
    async def serve_index():
        return _index_response(WEB_DIST.resolve())

    @app.get("/{path_name:path}", response_class=HTMLResponse, include_in_schema=False)
    async def serve_spa(path_name: str):
        # Resolver o caminho pedido e garantir que continua dentro da pasta de
        # build. Sem esta verificação, um pedido com `..` (ex.: enviado por um
        # cliente HTTP que não normaliza o caminho) poderia escapar de WEB_DIST
        # e servir ficheiros arbitrários do servidor (path traversal).
        web_dist_root = WEB_DIST.resolve()
        candidate = (web_dist_root / path_name).resolve()
        if candidate.is_file() and candidate.is_relative_to(web_dist_root):
            if candidate.name == "index.html":
                return _index_response(web_dist_root)
            cache = (
                _IMMUTABLE_CACHE
                if path_name.startswith("assets/")
                else _STATIC_CACHE
            )
            return FileResponse(candidate, headers={"Cache-Control": cache})
        return _index_response(web_dist_root)
