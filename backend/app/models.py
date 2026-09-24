# models.py - define as tabelas no PostgreSQL
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from .utils import utcnow

class Vendor(Base):
    """Tabela principal de vendedores (utilizadores)."""

    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    product = Column(String)
    profile_photo = Column(String)
    # Verde floresta — a mesma cor com que o site desenha um pin sem cor
    # escolhida (ver --forest no design system).
    pin_color = Column(String, default="#1D5C3A")
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    # Premium — a única compra da plataforma (ver PREMIUM_PLAN em config.py). Dá
    # estrela no pin, alcance de 1 km em vez de 300 m, produtos no cartão do
    # mapa e a média das avaliações à vista.
    # Sem ele o vendedor fica no plano gratuito: aparece na mesma no mapa.
    premium_active = Column(Boolean, default=False)
    premium_valid_until = Column(DateTime, nullable=True)
    email_confirmed = Column(Boolean, default=False)
    confirmation_token = Column(String, nullable=True, index=True)
    # Alteração de email: guarda o novo email até este ser confirmado por link
    pending_email = Column(String, nullable=True)
    email_change_token = Column(String, nullable=True, index=True)
    password_reset_token = Column(String, nullable=True, index=True)
    password_reset_expires = Column(DateTime, nullable=True)
    payment_methods = Column(String, nullable=True)

    # Identificação e compliance
    nif = Column(String, nullable=True, unique=True, index=True)
    id_document_number = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)

    # Operacional
    beaches = Column(String, nullable=True)
    product_categories = Column(String, nullable=True)
    iban = Column(String, nullable=True)
    business_name = Column(String, nullable=True)

    # Compliance
    terms_accepted = Column(Boolean, default=False)
    terms_accepted_at = Column(DateTime, nullable=True)

    # RGPD — direito ao apagamento (art. 17.º). Quando preenchido, a conta foi
    # eliminada pelo titular: os dados pessoais já foram apagados/anonimizados e
    # a linha só subsiste como referência dos pagamentos, que a lei fiscal obriga
    # a conservar. Uma conta com `deleted_at` nunca autentica nem é listada.
    deleted_at = Column(DateTime, nullable=True)

    routes = relationship("Route", back_populates="vendor")
    sessions = relationship(
        "VendorSession", back_populates="vendor", cascade="all, delete-orphan"
    )

    @property
    def is_premium(self) -> bool:
        """Premium em vigor: comprado e ainda dentro da validade.

        É esta propriedade — e não a coluna `premium_active` — que decide as
        vantagens, para que um Premium expirado deixe de as dar mesmo antes de
        alguém passar por `refresh_premium_status`.
        """
        return bool(
            self.premium_active
            and self.premium_valid_until
            and self.premium_valid_until > utcnow()
        )


class VendorSession(Base):
    """Sessões ativas de cada vendedor."""

    __tablename__ = "vendor_sessions"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), index=True)
    token = Column(String, unique=True, index=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    vendor = relationship("Vendor", back_populates="sessions")


class Route(Base):
    """Trajetos percorridos pelos vendedores."""

    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    start_time = Column(DateTime, default=utcnow)
    end_time = Column(DateTime, nullable=True)
    points = Column(String)
    distance_m = Column(Float, default=0.0)

    vendor = relationship("Vendor", back_populates="routes")


class PaidWeek(Base):
    """Registo dos períodos pagos pelos vendedores.

    Hoje só o Premium é vendido, mas a tabela conserva também os pagamentos
    dos antigos planos de visibilidade: a lei fiscal obriga a guardar os
    documentos de faturação, e o ecrã de faturas continua a mostrá-los.
    """

    __tablename__ = "paid_weeks"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    start_date = Column(DateTime, default=utcnow)
    end_date = Column(DateTime)
    receipt_url = Column(String, nullable=True)
    # O que foi comprado. Nos pagamentos novos é sempre "premium"; nos
    # históricos pode ser "semanal", "quinzenal" ou "mensal".
    plan = Column(String, nullable=True)
    # Identificador da sessão de checkout Stripe que originou este pagamento.
    # Usado para garantir idempotência: um webhook reenviado pelo Stripe não
    # pode creditar o mesmo período duas vezes.
    stripe_session_id = Column(String, nullable=True, unique=True, index=True)

    vendor = relationship("Vendor")


class Product(Base):
    """Produtos colocados à venda por cada vendedor."""

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    name = Column(String)
    price = Column(Float)
    photo = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    vendor = relationship("Vendor")


class Review(Base):
    """Avaliação (1 a 5 estrelas) deixada por um cliente a um vendedor.

    Todos os vendedores têm um QR code pessoal (ver /vendors/{id}/qr.png). Quem
    o lê chega à página de avaliação e deixa uma classificação de 1 a 5
    estrelas. Mostrar a pontuação é que é a vantagem Premium: só a média de um
    vendedor Premium aparece no cartão do mapa e no separador do QR — sem
    Premium os votos ficam guardados mas escondidos.

    Os votos repetidos são travados pelo `QRToken` de uso único que a página de
    avaliação consome: nada aqui identifica quem avalia, nem sequer de forma
    anónima.
    """

    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), index=True)
    rating = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    vendor = relationship("Vendor")


class QRToken(Base):
    """Token de uso único gerado ao abrir a página do QR code do vendedor.

    A página de avaliação pede um token novo (POST /vendors/{id}/review-token)
    a cada leitura do QR, com expiração de 20 min.
    Ao submeter a avaliação, o token é marcado como `used=True`. Tentativas
    de reutilizar um token já utilizado ou expirado são rejeitadas com 410.
    """

    __tablename__ = "qr_tokens"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), index=True)
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    vendor = relationship("Vendor")


class Story(Base):
    """Stories efêmeras publicadas pelos vendedores."""

    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    media_path = Column(String)
    created_at = Column(DateTime, default=utcnow)
    expires_at = Column(DateTime)

    vendor = relationship("Vendor")
