# Sunny Sales

Plataforma que liga **vendedores de praia** a **banhistas** em praias portuguesas através de localização em tempo real e mapas interativos. Os vendedores partilham a sua posição GPS e os banhistas encontram-nos facilmente sem ter de percorrer a praia toda.

---

## Resumo do Projeto

### O que é

O **Sunny Sales** é uma plataforma SaaS composta por uma aplicação web, uma aplicação móvel (React Native/Expo) e um backend FastAPI. Destina-se a:

- **Banhistas** — encontram vendedores de praia no mapa em tempo real, filtram por produto ou distância e acedem ao perfil do vendedor.
- **Vendedores** — ativam a partilha de localização, gerem rotas, veem estatísticas e gerem a subscrição paga.
- **Municípios / Gestão de praias** — solução B2B para organizar e digitalizar o comércio de praia com acesso via QR code público.

---

### Funcionalidades

#### Para banhistas
| Funcionalidade | Descrição |
|---|---|
| Mapa interativo em tempo real | Pins dos vendedores ativos com cores personalizadas, atualizados via WebSocket |
| Localização própria | GPS do dispositivo com seta de direção baseada na bússola |
| Filtros | Por tipo de produto (Bolas de Berlim, Gelados, Acessórios de Praia) e por distância (500 m a 5 km) |
| Mapa rotativo | O mapa roda com a orientação do dispositivo (iOS 13+ e Android) |
| Perfil do vendedor | Foto, produto, e stories efémeros (fotos/vídeos com expiração) |
| Páginas informativas | Sobre o projeto, Sustentabilidade, Implementação para municípios |

#### Para vendedores
| Funcionalidade | Descrição |
|---|---|
| Dashboard | Saudação personalizada, estado da subscrição, toggle de partilha de localização |
| Partilha de localização | Requer subscrição ativa; envia coordenadas GPS para o servidor em tempo real |
| Histórico de rotas | Lista de sessões com duração, distância e mapa do percurso |
| Estatísticas | Gráfico de barras com quilómetros percorridos por dia (Recharts) |
| Gestão de conta | Nome, email, foto de perfil com cropper, cor do pin, alteração de password |
| Sessões ativas | Ver e terminar sessões em outros dispositivos |
| Subscrição e faturação | Integração com Stripe; histórico de semanas pagas com links de recibo |
| Stories | Publicar fotos/vídeos efémeros visíveis no perfil |
| App móvel | App React Native/Expo (mais leve; partilha de localização e gestão de conta) |

---

### Arquitetura

```
ss_TESTER/
├── backend/                  # FastAPI + SQLAlchemy
│   └── app/
│       ├── main.py           # Endpoints REST e WebSocket
│       ├── models.py         # Modelos: Vendor, Route, PaidWeek, Story, VendorSession
│       ├── schemas.py        # Schemas Pydantic
│       └── database.py       # Configuração da BD
├── sunny_sales_web/          # React 19 + Vite (web)
│   └── src/
│       ├── pages/            # Dashboard, Rotas, Stats, Login, Registo, ...
│       ├── components/       # Botões de mapa, cropper de imagem, footer, ...
│       └── config.js         # BASE_URL do backend
├── sunny_sales_mobile/       # React Native / Expo (móvel)
│   └── src/
│       ├── screens/          # Login, Registo, Home
│       ├── navigation/       # Stack navigation
│       └── context/          # AuthContext
├── scripts/                  # Utilitários (simulação de movimento, ...)
├── requirements.txt          # Dependências Python
└── start.sh                  # Script de arranque
```

---

### Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Backend | FastAPI, SQLAlchemy, PostgreSQL / SQLite, JWT, bcrypt, Stripe, WebSocket |
| Web frontend | React 19, Vite, React Router, Leaflet + react-leaflet, Recharts, Axios |
| Mobile | React Native 0.76, Expo 56, TypeScript, expo-location, AsyncStorage |
| Mapas | Leaflet com tiles CARTO, leaflet-rotate (bússola), Haversine (distâncias) |
| Pagamentos | Stripe Checkout + Webhooks, semanas pagas com recibos |
| Autenticação | JWT Bearer tokens, gestão de sessões multi-dispositivo |
| Tempo real | WebSocket `/ws/locations` para atualizações de posição |
| Armazenamento de ficheiros | Fotos de perfil e stories servidos estaticamente |

---

### Modelos de Dados (principais)

- **Vendor** — conta do vendedor (nome, email, produto, foto, cor do pin, coordenadas atuais, subscrição)
- **Route** — sessão de rastreio (pontos GPS, duração, distância em metros)
- **PaidWeek** — registo de pagamento (intervalo de datas, URL do recibo Stripe)
- **Story** — media efémero do vendedor (foto/vídeo com expiração)
- **VendorSession** — sessões ativas por dispositivo (token, user-agent)

---

## Configuração Rápida

1. **Requisitos**: Python 3.10+ e Node.js.
2. Instale as dependências Python:
   ```bash
   pip install -r requirements.txt
   ```
3. Defina as variáveis de ambiente usadas pelo backend:
   - `DATABASE_URL` — ligação à base de dados (PostgreSQL ou SQLite)
   - `SECRET_KEY` — chave para assinar tokens JWT
   - `SMTP_USER` e `SMTP_PASSWORD` — envio de emails (opcional)
   - `STRIPE_API_KEY` — pagamentos (opcional)
   - `STRIPE_PRICE_ID_SEMANAL`, `STRIPE_PRICE_ID_QUINZENAL`, `STRIPE_PRICE_ID_MENSAL` — price IDs dos planos de subscrição (opcional, têm valores por omissão)
4. Execute o servidor:
   ```bash
   uvicorn backend.app.main:app --reload
   ```
5. Na pasta `sunny_sales_web`, instale e inicie o frontend:
   ```bash
   npm install
   npm run dev
   ```

> A variável `BASE_URL` em `sunny_sales_web/src/config.js` deve apontar para o endereço do backend.

---

## Testes

Os testes do backend utilizam **pytest**:
```bash
pytest
```

---

## Simulação de Movimento

O script `scripts/simulate_movement.py` envia localizações fictícias de um vendedor para o servidor. Configure `VENDOR_EMAIL` e `VENDOR_PASSWORD` antes de executar:
```bash
python scripts/simulate_movement.py
```

---

## Resolução de Problemas

Ao executar `npm ci` em ambientes como o EAS Build pode surgir o erro:

```
npm ci can only install packages when your package.json and package-lock.json are in sync
```

Significa que as versões em `package.json` não coincidem com o `package-lock.json`. Dentro de `sunny_sales_web`, corra:

```bash
npm install
```

E commite o `package-lock.json` atualizado.

---

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
