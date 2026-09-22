# config.py - configuração da aplicação a partir do ambiente.
#
# Tudo o que é lido de variáveis de ambiente (ou constante para toda a app)
# vive aqui, num sítio só, para não ser preciso caçar `os.getenv` pelo código.

import logging
import os

import stripe
from slowapi import Limiter
from slowapi.util import get_remote_address

# --------------------------
# Uploads
# --------------------------
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_STORY_TYPES = ALLOWED_IMAGE_TYPES | {"video/mp4", "video/webm"}
ALLOWED_STORY_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | {".mp4", ".webm"}

# Limites de tamanho
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100 MB

MAX_PRODUCTS_PER_VENDOR = 10

# Setup de logging de segurança
logging.basicConfig(level=logging.INFO)
security_logger = logging.getLogger("security")

# --------------------------
# Observabilidade (Sentry) — opcional e desligado por omissão.
# Só é inicializado se a variável de ambiente SENTRY_DSN estiver definida, pelo
# que não tem qualquer efeito (nem custo) em desenvolvimento ou nos testes. O
# import é protegido para que a aplicação arranque mesmo sem o pacote instalado.
# --------------------------
SENTRY_DSN = os.getenv("SENTRY_DSN")
if SENTRY_DSN:
    try:
        import sentry_sdk

        sentry_sdk.init(
            dsn=SENTRY_DSN,
            environment=os.getenv("SENTRY_ENVIRONMENT", "production"),
            traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.0")),
            send_default_pii=False,
        )
        security_logger.info("Sentry inicializado.")
    except Exception as exc:  # pragma: no cover - depende de ambiente externo
        security_logger.warning(f"Sentry não inicializado: {exc}")


# --------------------------
# Rate limiting
# --------------------------
limiter = Limiter(key_func=get_remote_address)


# --------------------------
# CORS e hosts confiáveis
# --------------------------
# CORS configurado com origins específicas (SEGURO)
_cors_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if _cors_origins_env:
    ALLOWED_ORIGINS = [o.strip() for o in _cors_origins_env.split(",") if o.strip()]
else:
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://sstester-production.up.railway.app",
    ]

# (em português) Origens da app móvel (Capacitor).
# No Android, com androidScheme 'https', a WebView serve a app a partir de
# https://localhost; no iOS a origem é capacitor://localhost. Sem estas
# origens na lista de CORS, o browser bloqueia as respostas do backend e o
# fetch falha com "Failed to fetch" no ecrã inicial. São sempre adicionadas
# (mesmo quando ALLOWED_ORIGINS está definido) para a app móvel funcionar em
# qualquer configuração de deploy.
for _mobile_origin in ("https://localhost", "capacitor://localhost", "http://localhost"):
    if _mobile_origin not in ALLOWED_ORIGINS:
        ALLOWED_ORIGINS.append(_mobile_origin)

# Middleware de host confiável
ALLOWED_HOSTS = [
    "localhost",
    "localhost:8000",
    "127.0.0.1",
    "sstester-production.up.railway.app",
]
_env_hosts = os.getenv("ALLOWED_HOSTS", "")
if _env_hosts:
    ALLOWED_HOSTS.extend([h.strip() for h in _env_hosts.split(",") if h.strip()])


# --------------------------
# URLs públicas e envio de email
# --------------------------
BASE_APP_URL = os.getenv("BASE_APP_URL", "https://sstester-production.up.railway.app")

# Onde vive a página de avaliação que o QR code do vendedor abre. Por omissão é
# o próprio servidor (que também serve o site), mas pode apontar-se para o
# domínio público do site com REVIEW_WEB_URL.
REVIEW_WEB_URL = os.getenv("REVIEW_WEB_URL", BASE_APP_URL).rstrip("/")

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
RESEND_FROM = os.getenv("RESEND_FROM", "Sunny Sales <onboarding@resend.dev>")
CONTACT_EMAIL_TO = os.getenv("CONTACT_EMAIL_TO", "sunnysales.geral@gmail.com")

# Configuração do Stripe
stripe.api_key = os.getenv("STRIPE_API_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
# Destinos após o checkout. Apontam por omissão para páginas reais da app (o
# vendedor volta ao painel em caso de sucesso, ou ao Premium se cancelar).
SUCCESS_URL = os.getenv("SUCCESS_URL", f"{BASE_APP_URL}/dashboard")
CANCEL_URL = os.getenv("CANCEL_URL", f"{BASE_APP_URL}/premium")

# --------------------------
# Premium — a única compra da plataforma.
# --------------------------
# Há dois estados possíveis para um vendedor: GRATUITO ou PREMIUM. O plano
# gratuito põe toda a gente no mapa — não há nada a pagar para aparecer. O
# Premium é um PAGAMENTO ÚNICO de 30 dias (mode="payment" no Stripe, sem
# renovação automática, para não haver cobranças-surpresa nem chargebacks) e
# acrescenta ao vendedor
#   · estrela no pin, para se distinguir no mapa;
#   · alcance de PREMIUM_REACH_RADIUS_M em vez de FREE_REACH_RADIUS_M;
#   · fotografias nos produtos (sem Premium ficam-se pelo nome e preço).
# O montante pode ser ajustado por variável de ambiente sem alterar o código
# nem tocar no Stripe.
def _plan_amount(env_name: str, default_cents: int) -> int:
    raw = os.getenv(env_name)
    if not raw:
        return default_cents
    try:
        return int(round(float(raw) * 100))
    except (TypeError, ValueError):
        return default_cents


PREMIUM_PLAN_ID = "premium"
PREMIUM_PLAN = {
    "days": 30,
    "amount_cents": _plan_amount("PREMIUM_PRICE_EUR", 1999),
    "label": "Premium",
}

# Raio a que o vendedor é encontrado no mapa do banhista. Sem Premium o
# vendedor só aparece a quem já está ao pé dele; com Premium alcança
# praticamente toda a praia.
FREE_REACH_RADIUS_M = int(os.getenv("FREE_REACH_RADIUS_M", "300"))
PREMIUM_REACH_RADIUS_M = int(os.getenv("PREMIUM_REACH_RADIUS_M", "1000"))

PREMIUM_PRODUCT_PHOTO_DETAIL = (
    "As fotografias nos produtos são uma vantagem Premium. "
    "Sem Premium podes guardar o nome e o preço."
)

# Distância mínima (metros) entre leituras de GPS consecutivas para serem
# consideradas movimento real. Abaixo deste valor é ruído típico de GPS
# e o ponto não entra no trajeto, evitando que ele "ande sozinho" parado
# (a posição mostrada no mapa, essa, é atualizada na mesma).
# Alinhado com a precisão máxima aceite no dispositivo (ver
# MAX_ACCEPTABLE_ACCURACY_METERS em LocationForegroundService.java), já que
# valores mais baixos deixavam passar oscilações dentro do raio de erro do GPS.
MIN_GPS_DISTANCE_M = 15.0

# Distância máxima (metros) aceite entre leituras consecutivas. Acima deste
# valor, é considerado erro de GPS (satélite perdido, salto para outro
# fornecedor de localização, etc.) e a leitura é descartada. Para um vendedor
# numa praia, valores > 2 km em 1 segundo são fisicamente impossíveis.
MAX_GPS_DISTANCE_M = 2000.0

# Um salto acima de MAX_GPS_DISTANCE_M ainda é aceite se o tempo desde o ponto
# anterior o tornar possível a esta velocidade (m/s, ~180 km/h) — assim um
# primeiro ponto mal colocado não prende o pin no sítio errado para sempre.
MAX_GPS_SPEED_MPS = 50.0

# Precisão (raio de erro, metros) acima da qual uma leitura não mexe num pin
# que já existe. Também marca o ponto anterior como "impreciso", o que deixa
# a leitura seguinte corrigi-lo mesmo com um salto grande.
MAX_GPS_ACCURACY_M = 100.0


# --------------------------
# Autenticação
# --------------------------
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")

