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
    if "vendors" in inspector.get_table_names():
        columns = [c["name"] for c in inspector.get_columns("vendors")]
        if "session_token" not in columns:
            with engine.begin() as conn:  # begin() cria transação e faz commit automático
                conn.execute(text("ALTER TABLE vendors ADD COLUMN session_token TEXT"))
