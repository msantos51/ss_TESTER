# Sunny Sales — Design System

Tokens centralizados em [`src/index.css`](src/index.css) (`:root`). Este documento
descreve **como usar cada token**. Nenhuma página deve introduzir cores, tamanhos
de fonte ou sombras fora desta lista.

## 1. Paleta

| Token | Valor | Uso |
|---|---|---|
| `--primary` | `#0e7f94` (teal do logótipo) | Acentos de marca: ícones, links, números de passos, estados ativos, foco. AA (4.69:1) sobre branco. |
| `--primary-dark` | `#0a5464` | Texto teal sobre fundos teal claros (`--primary-light-solid`). |
| `--primary-bright` | `#18a8c0` | Teal vivo do logótipo — **apenas decorativo** (pontos, ilustrações), nunca texto. |
| `--primary-light` / `--primary-light-solid` | teal a 8% / `#e9f4f6` | Fundos suaves de chips e ícones. |
| `--secondary` | `#f5b301` (amarelo) | **Ação primária** — CTA "Explorar Mapa", submissão de formulários, plano em destaque — e micro-indicadores (pontos, badges). Texto sobre amarelo: sempre `--ink` (10.3:1). |
| `--ink` | `#0f0f0f` | Texto principal e **ações de navegação secundárias** (botão do header, botões utilitários). |
| `--navy` | `#0d2b39` (azul-marinho) | Fundo de **blocos institucionais de contraste** (painel "Para Vendedores", banners finais). Texto branco: 14.8:1. |
| `--text-secondary` | `#6b7280` | Texto de apoio. 4.83:1 sobre branco (AA). |
| `--text-muted` | `#71717a` | Legendas e metadados. 4.83:1 sobre branco (AA). |
| `--border` / `--border-strong` | `#ececec` / `#e2e2e2` | Bordas de 1px; a forte só em hover/inputs. |
| `--success` / `--warning` / `--error` | verdes/âmbar/vermelho | Apenas estados funcionais (validação, avisos). |

**Regra de ouro:** amarelo = "faz isto agora"; preto = "navega/ferramenta";
teal = identidade e acentos; navy = secção escura institucional. Se um ecrã
tiver dois botões amarelos lado a lado, um deles está errado.

## 2. Tipografia

Família única: **Inter** (pesos 400–700 + 650 para títulos hero).

| Token | Tamanho | Uso |
|---|---|---|
| `--fs-display` | 40→58px | H1 do hero da Home (peso 650) |
| `--fs-h1` | 32→44px | H1 do hero das páginas internas (peso 650) |
| `--fs-h2` | 28→32px | Títulos de secção (peso 600) |
| `--fs-h3` | 20→24px | Subtítulos e cabeçalhos de card (peso 600) |
| `--fs-lead` | 17→20px | Parágrafo de apoio sob um título (cor `--text-secondary`) |
| `--fs-body` | 16px | Corpo |
| `--fs-body-sm` | 15px | Corpo compacto (cards, listas) |
| `--fs-caption` | 13px | Legendas, labels, eyebrows uppercase |

Hierarquia dos heroes internos: título `--fs-h1` 650 + lead `--fs-lead`
`--text-secondary` + chips `--fs-caption`. Igual em Sobre o Projeto, Praia
Sustentável, Planos, Como Funciona, FAQs e Contacto.

## 3. Espaçamento, raios e sombras

- Escala de espaço: `--space-xs` 8 · `--space-sm` 12 · `--space-md` 16 ·
  `--space-lg` 24 · `--space-xl` 32 · `--space-2xl` 48.
- Ritmo vertical de secções da Home: `--section-pad` (`clamp(4rem, 8vw, 7rem)`)
  aplicado como padding-top de todas as secções.
- Raios: `--radius-sm` 10 · `--radius-md` 12 (botões/inputs) · `--radius-lg` 16
  (cards) · `--radius-2xl` 20 (heroes) · `--radius-full` (pills).
- Sombras: `--shadow-xs`→`--shadow-lg`, quase impercetíveis; hover de card =
  `--shadow-md` + `translateY(-2px)`.

## 4. Componentes partilhados (classes CSS)

| Componente | Classes | Onde vive |
|---|---|---|
| Botões | `.hero-pill` (base) + `.hero-pill-primary` (amarelo) / `.hero-pill-ghost` (outline) · `.nav-cta` (preto, header) | `Home.css` / `index.css` |
| Hero card interno | `.info-hero.info-hero--media` + `.info-hero-content/-title/-lead/-media` | `InfoPage.css` |
| Badges/Chips | `.info-badge` (+ `.info-badge-sky`) | `InfoPage.css` |
| Cards de conteúdo | `.info-card`, `.info-cards` (grelha) | `InfoPage.css` |
| Accordion (FAQs) | `.faq-item` (`<details>`) + `.faq-q`/`.faq-a` | `FAQ.css` |
| Tabs segmentadas | `.faq-tabs` + `.faq-tab` | `FAQ.css` |
| Timeline numerada | `.info-timeline` | `InfoPage.css` |
| Banner escuro | `.info-banner` (navy) + `.info-banner-btn` (amarelo) | `InfoPage.css` |
| Inputs | `.contacto-input/-label/-error` (Contacto) · `.vd-form-input` (dashboard) | páginas respetivas |
| Toggle | `.vendor-switch` | `VendorDashboard.css` |
| StatCard | `.vd-stat-card` (+ `.vd-skeleton` no loading) | `VendorDashboard.css` |

As imagens hero das páginas internas usam todas o mesmo tratamento:
grelha `1.05fr/0.95fr`, `min-height: 320px`, `object-fit: cover`, overlay
branco suave à esquerda e fonte Unsplash com `auto=format` (WebP/AVIF).

## 5. Acessibilidade

- Foco visível: `outline: 2px solid var(--focus-ring)` (+2px offset) em todos
  os elementos interativos.
- Alvos de toque ≥44×44px em mobile.
- Contraste mínimo AA garantido pelos tokens de texto — não usar cinzentos
  mais claros do que `--text-muted` para texto informativo.
- Ícones sem texto visível têm sempre `aria-label`; decorativos usam
  `aria-hidden="true"`.
