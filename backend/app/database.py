# database.py - configuração da conexão ao PostgreSQL

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()  # Isto carrega o .env

# Obter a URL da base de dados das variáveis de ambiente
DATABASE_URL = os.getenv("DATABASE_URL")

# Se a variável não estiver definida, usa uma base SQLite local para facilitar
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./app.db"
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

# Criar o motor de conexão
engine = create_engine(DATABASE_URL, **connect_args)

# Criar sessão de acesso ao banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos
Base = declarative_base()

# ✅ Aqui está a função que estava a faltar:
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
