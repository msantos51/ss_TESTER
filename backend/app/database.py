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
        pool_size=5,
        max_overflow=2,
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
        ]
        with engine.begin() as conn:
            for col, stmt in migrations:
                if col not in columns:
                    conn.execute(text(stmt))
