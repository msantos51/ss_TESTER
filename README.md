# Sunny Sales

Aplicação composta por backend em **FastAPI** e interface web em **React** que permite aos vendedores de praia registar e acompanhar a sua atividade em tempo real.

## Estrutura

```
backend/            Código do servidor FastAPI
sunny_sales_web/    Aplicação web (React + Vite)
sunny_sales_mobile/ Aplicação mobile (Expo/React Native)
scripts/            Utilidades auxiliares
```

## Configuração Rápida

1. **Requisitos**: Python 3.10+ e Node.js.
2. Instale as dependências Python:
   ```bash
   pip install -r requirements.txt
   ```
3. Defina as variáveis de ambiente usadas pelo backend (PostgreSQL ou SQLite):
   - `DATABASE_URL` para apontar para a base de dados.
   - `SECRET_KEY` para assinar tokens JWT.
   - `SMTP_USER` e `SMTP_PASSWORD` caso deseje envio de emails.
   - Opções da Stripe (`STRIPE_API_KEY`, `STRIPE_PRICE_ID`, etc.) são opcionais.
4. Execute o servidor com:
   ```bash
   uvicorn backend.app.main:app --reload
   ```
5. Na pasta `sunny_sales_web` instale pacotes e inicie o Vite:
   ```bash
   npm install
   npm run dev
   ```
6. Para a aplicação mobile navegue até `sunny_sales_mobile` e inicie o Expo:
   ```bash
   npm install
   npm start
   ```

## Novidades

- **Estatísticas**: painel no aplicativo mostra gráfico das distâncias diárias percorridas.

- **Tradução e acessibilidade**: interface com suporte a português e inglês e elementos com labels acessíveis.

    A variável `BASE_URL` em `sunny_sales_web/src/config.js` e `EXPO_PUBLIC_BASE_URL` em `sunny_sales_mobile` devem apontar para o endereço do backend.

## Testes

Os testes do backend utilizam **pytest**:
```bash
pytest
```

Caso as dependências não estejam instaladas, os testes podem falhar.

## Simulação de Movimento

O script `scripts/simulate_movement.py` envia localizações fictícias de um vendedor para o servidor. Configure `VENDOR_EMAIL` e `VENDOR_PASSWORD` antes de executar:
```bash
python scripts/simulate_movement.py
```

## Resolução de Problemas

Ao executar `npm ci` em ambientes como o EAS Build pode surgir o erro:

```
npm ci can only install packages when your package.json and package-lock.json are in sync
```

Isso significa que as versões listadas em `package.json` não coincidem com o
`package-lock.json`. Entre na pasta `sunny_sales_web` e rode:

```bash
npm install
```

Em seguida commite o `package-lock.json` atualizado para que a build use as
mesmas dependências do projeto.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
