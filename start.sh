#!/bin/bash
set -e

# Build do frontend (se node_modules ainda não existe, instala dependências)
if [ -d "sunny_sales_web" ]; then
  echo "A compilar o frontend..."
  cd sunny_sales_web
  npm install --prefer-offline --no-audit --no-fund
  npm run build
  cd ..
  echo "Frontend compilado com sucesso."
fi

exec uvicorn backend.app.main:app --host 0.0.0.0 --port 10000
