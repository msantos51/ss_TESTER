# database.py - configuração da conexão ao PostgreSQL/SQLite

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()  # carrega o .env

# URL da base de dados
DATABASE_URL = os.getenv("DATABASE_URL")

# Se não houver DATABASE_URL, cai para SQLite local
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./app.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},  # <- só no SQLite
        pool_pre_ping=True,
    )
else:
    # Para Postgres (psycopg2/psycopg3), não passes check_same_thread
    # Se precisares de SSL no Render, garante ?sslmode=require na DATABASE_URL
    #   Ex.: postgresql+psycopg2://user:pass@host/dbname?sslmode=require
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=280,
        pool_size=20,
        max_overflow=10,
    )

# Sessão
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base p/ modelos
Base = declarative_base()

# Dependency FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pequena migração automática para adicionar colunas recentes
def ensure_latest_schema():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    if "vendors" in tables:
        columns = {c["name"] for c in inspector.get_columns("vendors")}
        migrations = [
            ("session_token", "ALTER TABLE vendors ADD COLUMN session_token TEXT"),
            ("email_confirmed", "ALTER TABLE vendors ADD COLUMN email_confirmed BOOLEAN DEFAULT false"),
            ("confirmation_token", "ALTER TABLE vendors ADD COLUMN confirmation_token TEXT"),
            ("password_reset_token", "ALTER TABLE vendors ADD COLUMN password_reset_token TEXT"),
            ("password_reset_expires", "ALTER TABLE vendors ADD COLUMN password_reset_expires TIMESTAMP"),
            ("payment_methods", "ALTER TABLE vendors ADD COLUMN payment_methods TEXT"),
            ("license_number", "ALTER TABLE vendors ADD COLUMN license_number TEXT"),
            ("license_municipality", "ALTER TABLE vendors ADD COLUMN license_municipality TEXT"),
            ("license_expiry", "ALTER TABLE vendors ADD COLUMN license_expiry TIMESTAMP"),
            ("license_type", "ALTER TABLE vendors ADD COLUMN license_type TEXT"),
            ("license_document", "ALTER TABLE vendors ADD COLUMN license_document TEXT"),
            ("nif", "ALTER TABLE vendors ADD COLUMN nif TEXT"),
            ("id_document_number", "ALTER TABLE vendors ADD COLUMN id_document_number TEXT"),
            ("phone", "ALTER TABLE vendors ADD COLUMN phone TEXT"),
            ("address", "ALTER TABLE vendors ADD COLUMN address TEXT"),
            ("beaches", "ALTER TABLE vendors ADD COLUMN beaches TEXT"),
            ("product_categories", "ALTER TABLE vendors ADD COLUMN product_categories TEXT"),
            ("iban", "ALTER TABLE vendors ADD COLUMN iban TEXT"),
            ("business_name", "ALTER TABLE vendors ADD COLUMN business_name TEXT"),
            ("terms_accepted", "ALTER TABLE vendors ADD COLUMN terms_accepted BOOLEAN DEFAULT false"),
            ("terms_accepted_at", "ALTER TABLE vendors ADD COLUMN terms_accepted_at TIMESTAMP"),
        ]
        with engine.begin() as conn:
            for col, stmt in migrations:
                if col not in columns:
                    conn.execute(text(stmt))

    # Índices adicionais em colunas muito consultadas (idempotente)
    index_statements = [
        "CREATE INDEX IF NOT EXISTS ix_routes_vendor_id ON routes (vendor_id)",
        "CREATE INDEX IF NOT EXISTS ix_routes_end_time ON routes (end_time)",
        "CREATE INDEX IF NOT EXISTS ix_paid_weeks_vendor_id ON paid_weeks (vendor_id)",
        "CREATE INDEX IF NOT EXISTS ix_stories_vendor_id ON stories (vendor_id)",
        "CREATE INDEX IF NOT EXISTS ix_stories_expires_at ON stories (expires_at)",
    ]
    with engine.begin() as conn:
        for stmt in index_statements:
            try:
                conn.execute(text(stmt))
            except Exception:
                pass
