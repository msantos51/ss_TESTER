#!/bin/bash
set -e

# Build do frontend (se node_modules ainda não existe, instala dependências)
if [ -d "sunny_sales_web" ]; then
  echo "A compilar o frontend..."
  cd sunny_sales_web
  npm install --prefer-offline --no-audit --no-fund
  # Frontend e backend são servidos na MESMA origem, por isso o frontend usa
  # automaticamente window.location.origin (ver config.js) e funciona em
  # qualquer domínio sem reconfiguração. Só define VITE_BASE_URL se algum dia
  # separares o frontend do backend em domínios diferentes.
  npm run build
  cd ..
  echo "Frontend compilado com sucesso."
fi

exec uvicorn backend.app.main:app --host 0.0.0.0 --port "${PORT:-10000}"
