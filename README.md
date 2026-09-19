# Sunny Sales

Plataforma que liga **vendedores de praia** a **banhistas** em praias portuguesas através de localização em tempo real e mapas interativos. Os vendedores partilham a sua posição GPS e os banhistas encontram-nos facilmente sem ter de percorrer a praia toda.

---

## Resumo do Projeto

### O que é

O **Sunny Sales** é uma plataforma SaaS composta por uma aplicação web, uma aplicação móvel (Capacitor + React) e um backend FastAPI. Destina-se a:

- **Banhistas** — encontram vendedores de praia no mapa em tempo real, filtram por produto ou distância e acedem ao perfil do vendedor.
- **Vendedores** — ativam a partilha de localização, gerem rotas, veem estatísticas e, se quiserem, compram Premium.
- **Municípios / Gestão de praias** — solução B2B para organizar e digitalizar o comércio de praia com acesso via QR code público.

---

### Funcionalidades

#### Para banhistas
| Funcionalidade | Descrição |
|---|---|
| Mapa interativo em tempo real | Pins dos vendedores ativos com cores personalizadas, atualizados via WebSocket |
| Localização própria | GPS do dispositivo com seta de direção baseada na bússola |
| Filtros | Por tipo de produto (Bolas de Berlim, Gelados, Acessórios de Praia) e por distância (500 m a 5 km) |
| Mapa rotativo | Roda com dois dedos no telemóvel (ou shift + roda do rato no computador) e, sem ninguém lhe tocar, segue a orientação do dispositivo (iOS 13+ e Android). O botão do norte endireita-o |
| Perfil do vendedor | Foto, produto, e stories efémeros (fotos/vídeos com expiração) |
| Vendedores Premium | Pin com estrela no mapa e alcance maior (1 km, contra 300 m dos restantes) |
| Páginas informativas | Sobre o projeto, Sustentabilidade, Implementação para municípios |
| Páginas legais | Privacidade, Termos, Aviso Legal, Cookies e gestão da conta de vendedor (`/eliminar-conta`) |

#### Para vendedores
| Funcionalidade | Descrição |
|---|---|
| Dashboard | Saudação personalizada, estado do Premium, toggle de partilha de localização |
| Partilha de localização | Gratuita e sem pré-requisitos; envia coordenadas GPS para o servidor em tempo real |
| Histórico de rotas | Lista de sessões com duração, distância e mapa do percurso |
| Estatísticas | Gráfico de barras com quilómetros percorridos por dia (Recharts) |
| Gestão de conta | Nome, email, foto de perfil com cropper, cor do pin, alteração de password |
| Sessões ativas | Ver e terminar sessões em outros dispositivos |
| Faturação | Integração com Stripe; histórico dos períodos pagos com links de recibo |
| Premium (19,99 €/30 dias) | A única compra da plataforma, com separador próprio na app: estrela no pin, alcance de 1 km e fotografias nos produtos |
| Stories | Publicar fotos/vídeos efémeros visíveis no perfil |
| Os teus dados (RGPD) | Descarregar todos os dados pessoais em JSON e eliminar a conta em definitivo, na app ou em `/eliminar-conta` |
| App móvel | App Android (Capacitor + React) dedicada ao vendedor: registo de conta, partilha de localização em tempo real (serviço nativo), gestão de conta, produtos, Premium e faturas |

---

### Arquitetura

```
ss_TESTER/
├── backend/                  # FastAPI + SQLAlchemy
│   └── app/
│       ├── main.py           # Criação da app: middlewares, estáticos, routers
│       ├── routers/          # Rotas por área: auth, vendors, reviews, tracking,
│       │                     #   catalog, payments, admin, public
│       ├── config.py         # Configuração lida do ambiente
│       ├── security.py       # Passwords, tokens JWT e dependências de auth
│       ├── storage.py        # Uploads (Supabase ou disco local)
│       ├── emails.py         # Envio de email (Resend) e respetivos modelos
│       ├── templates.py      # Páginas HTML fora da SPA (confirmações, reset)
│       ├── premium.py        # Regras do Premium
│       ├── ratings.py        # Agregação das avaliações
│       ├── realtime.py       # Difusão de posições por WebSocket
│       ├── utils.py          # Funções puras (datas, haversine, NIF)
│       ├── models.py         # Modelos: Vendor, Route, PaidWeek, Story, VendorSession
│       ├── schemas.py        # Schemas Pydantic
│       └── database.py       # Configuração da BD
├── sunny_sales_web/          # React 19 + Vite (web, para banhistas)
│   └── src/
│       ├── pages/            # Mapa, Praia Sustentável, Sobre, FAQs, Contacto, ...
│       ├── components/       # Botões de mapa, meteorologia, footer, ...
│       └── config.js         # BASE_URL do backend
├── mobile/                   # Capacitor + React + Vite (móvel Android, para vendedores)
│   └── src/
│       ├── pages/            # Welcome, Registo, Login, MapTab (partilha), Produtos, Premium, Trajetos, Conta
│       ├── components/       # AnimatedMarker, cropper de imagem, seletor de cor
│       └── hooks/            # useDeviceHeading (bússola)
├── docs/                     # Documentação: checklist de lançamento, design system
├── scripts/                  # Utilitários (simulação de movimento)
├── tests/                    # Testes do backend (pytest)
├── requirements.txt          # Dependências Python
└── start.sh                  # Script de arranque
```

---

### Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Backend | FastAPI, SQLAlchemy, PostgreSQL / SQLite, JWT, bcrypt, Stripe, WebSocket |
| Web frontend | React 19, Vite, React Router, Leaflet + react-leaflet, Axios |
| Mobile | Capacitor 7 (Android), React 18, Vite, Leaflet + leaflet-rotate, @capacitor/geolocation |
| Mapas | Leaflet com tiles CARTO, leaflet-rotate (rotação com dois dedos e pela bússola, no site e na app), Haversine (distâncias) |
| Pagamentos | Stripe Checkout + Webhooks, semanas pagas com recibos |
| Autenticação | JWT Bearer tokens, gestão de sessões multi-dispositivo |
| Tempo real | WebSocket `/ws/locations` para atualizações de posição |
| Armazenamento de ficheiros | Supabase Storage em produção; pastas locais servidas estaticamente em desenvolvimento |

---

### Modelos de Dados (principais)

- **Vendor** — conta do vendedor (nome, email, produto, foto, cor do pin, coordenadas atuais, estado do Premium, `deleted_at` para contas eliminadas)
- **Route** — sessão de rastreio (pontos GPS, duração, distância em metros)
- **PaidWeek** — registo de pagamento (intervalo de datas, o que foi comprado, URL do recibo Stripe). Conserva também os pagamentos dos antigos planos de visibilidade, por obrigação fiscal
- **Story** — media efémero do vendedor (foto/vídeo com expiração)
- **VendorSession** — sessões ativas por dispositivo (token, user-agent)

---

## Premium

Há **dois estados** possíveis para um vendedor: **gratuito** ou **Premium**.

O plano gratuito é o que põe o vendedor no mapa — aparecer não se paga. O
**Premium** é opcional e é o que o faz destacar-se lá dentro: custa
**19,99 €** num **pagamento único** de 30 dias (sem renovação automática), e
comprar com o Premium ainda ativo soma os dias ao período em curso.

> Os antigos planos de visibilidade (semanal / quinzenal / mensal) foram
> descontinuados. O checkout e o webhook só aceitam `premium`, e as colunas
> `subscription_*` saíram do modelo `Vendor` — ver `OBSOLETE_VENDOR_COLUMNS`
> em `backend/app/database.py` para as largar de uma base de dados existente.
> O histórico de faturação desses planos mantém-se em `paid_weeks`.

| Vantagem | Sem Premium | Com Premium |
|---|---|---|
| Destaque no mapa | Pin normal | Pin com estrela, na app e no site |
| Raio de alcance | 300 m | 1 km |
| Produtos | Nome e preço | Nome, preço e fotografia |

O raio de alcance é aplicado pelo servidor: `GET /vendors/?lat=&lng=` devolve
apenas os vendedores ao alcance de quem procura. Sem `lat`/`lng` não há
distância que se possa medir e não se filtra nada — é preferível a um mapa
vazio para quem recusou a geolocalização.

| Endpoint | Descrição |
|---|---|
| `POST /vendors/{id}/create-checkout-session` | Compra 30 dias de Premium (Stripe Checkout). `plan` é opcional e só aceita `premium` |
| `GET /vendors/?lat=&lng=` | Mapa com o raio de alcance aplicado; cada vendedor traz `is_premium` |
| `POST /vendors/{id}/activate-premium` | **Admin.** Credita 30 dias sem passar pelo Stripe (ex.: transferência bancária) |
| `POST /admin/vendors/{id}/revoke-premium` | **Admin.** Retira o Premium (devoluções e estornos). Não tira ninguém do mapa |

Os limites e o preço são ajustáveis por variáveis de ambiente
(`PREMIUM_PRICE_EUR`, `FREE_REACH_RADIUS_M`, `PREMIUM_REACH_RADIUS_M`) — ver
`.env.example`.

O Premium não inclui avisos de proximidade por email: quem procura vendedores
está no site, com o mapa aberto e os vendedores à vista, e não precisa de ser
chamado de volta.

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
   - `RESEND_API_KEY` e `RESEND_FROM` — envio de emails via Resend (opcional)
   - `STRIPE_API_KEY` — pagamentos (opcional)
   - `PREMIUM_PRICE_EUR` — preço do Premium em euros (opcional; por omissão 19,99). Não são precisos price IDs: o montante é definido no backend
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

## Proteção de Dados (RGPD)

O vendedor exerce dois direitos diretamente, sem depender de suporte:

| Direito | Como | Endpoint |
|---|---|---|
| Portabilidade (art. 20.º) | App: *Perfil → Os teus dados*. Web: `/eliminar-conta` | `GET /vendors/me/export` |
| Apagamento (art. 17.º) | Idem, com confirmação da palavra-passe | `DELETE /vendors/me` |

A eliminação apaga de forma irreversível o perfil, os trajetos GPS, os produtos,
as stories e os ficheiros correspondentes no armazenamento, e termina todas as
sessões. Subsiste apenas o registo de pagamentos (`paid_weeks`), sem dados
pessoais associados: a lei fiscal portuguesa obriga a conservar os documentos de
faturação durante 10 anos e o RGPD (art. 17.º, n.º 3, al. b)) ressalva
expressamente essa obrigação. A conta deixa de autenticar e o email fica livre
para um novo registo.

> A página `/eliminar-conta` é acessível sem instalar a app — requisito
> obrigatório da Google Play para qualquer aplicação com contas de utilizador.

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
