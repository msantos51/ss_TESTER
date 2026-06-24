#!/bin/bash
set -e

# Build do frontend (se node_modules ainda não existe, instala dependências)
if [ -d "sunny_sales_web" ]; then
  echo "A compilar o frontend..."
  cd sunny_sales_web
  npm install --prefer-offline --no-audit --no-fund
  # Usar VITE_BASE_URL para configurar a URL do backend em produção
  # Em Railway, o backend está em https://sstester-production.up.railway.app
  export VITE_BASE_URL="${VITE_BASE_URL:-https://sstester-production.up.railway.app}"
  npm run build
  cd ..
  echo "Frontend compilado com sucesso."
fi

exec uvicorn backend.app.main:app --host 0.0.0.0 --port "${PORT:-10000}"
