# Sunny Sales

Aplicação composta por backend em **FastAPI** e app móvel em **React Native** que permite aos vendedores de praia registar a sua atividade e aos clientes acompanharem a localização dos vendedores em tempo real.

## Estrutura

```
backend/    Código do servidor FastAPI
mobile/     Aplicação React Native (Expo)
scripts/    Utilidades auxiliares
```

## Configuração Rápida

1. **Requisitos**: Python 3.10+, Node.js e Expo CLI.
2. Instale as dependências Python:
   ```bash
   pip install -r backend/requirements.txt
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
5. Na pasta `mobile` instale pacotes e inicie o Expo:
   ```bash
   npm install
   npx expo start
   ```

## Novidades

- **Estatísticas**: painel no aplicativo mostra gráfico das distâncias diárias percorridas.
- **Favoritos**: clientes podem marcar vendedores favoritos para receber notificações de proximidade.
- **Respostas a reviews**: vendedores podem responder ou ocultar avaliações via API.
- **Tradução e acessibilidade**: interface com suporte a português e inglês e elementos com labels acessíveis.
   A variável `BASE_URL` em `mobile/config.js` deve apontar para o endereço do backend.

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

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
