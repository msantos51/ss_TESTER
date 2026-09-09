# Sunny Sales — Design System "Canvas / Painéis"

Tokens centralizados em [`src/index.css`](src/index.css) (`:root`). Este documento
descreve **como usar cada token**. Nenhuma página deve introduzir cores, tamanhos
de fonte ou sombras fora desta lista.

## 0. Conceito

O site é uma **tela cinzenta muito clara** (`--canvas`) sobre a qual flutuam
**painéis brancos arredondados** com sombra difusa. A profundidade vem da
sombra, não de bordas de 1px. São só quatro camadas:

1. **A tela** — cinzento `#f4f5f7`, sem fotografias nem texturas;
2. **Painéis brancos** de cantos grandes (`--radius-panel`, 22px) — a barra
   lateral de pesquisa, o mapa, a lista de vendedores, os cartões das páginas
   internas, os blocos das páginas legais;
3. **Controlos** — segmentos, opções e chips em cinzento muito claro
   (`--surface-alt`), com o estado selecionado a **teal** (preenchido nos
   segmentos, contornado nas opções);
4. **Uma ação principal preta** por ecrã (`--ink`) — "Ver no mapa" na Home,
   "Aplicar" na folha de filtros, "Enviar" no Contacto.

Sobre o mapa, tudo o que é controlo (vista, zoom, localizar, meteorologia,
filtros) flutua em **pastilhas brancas** com `--shadow-float`, nunca colado
às arestas.

## 1. Paleta

| Token | Valor | Uso |
|---|---|---|
| `--canvas` / `--canvas-deep` | `#f4f5f7` / `#eceef2` | **Tela** de fundo de todo o site (body) e o seu tom mais fundo (ex.: o "404"). |
| `--surface` | `#ffffff` | **Painéis brancos** (sem borda, com `--shadow-sm`). |
| `--surface-alt` / `--surface-hover` | `#f1f3f6` / `#e8ebf0` | Preenchimento neutro de chips, segmentos, campos e botões-ícone; o segundo é o hover. |
| `--accent` / `--primary` / `--secondary` | `#0F5F6E` | **Teal da marca** — estado selecionado, badges, ícones de marca, blocos de destaque. Texto por cima: **`--on-accent`** (7,29:1). |
| `--on-accent` | `#ffffff` | Texto branco sobre superfícies teal. |
| `--accent-hover` / `--primary-hover` / `--primary-dark` | `#0B4A56` | Hover (tom mais escuro) das superfícies teal. |
| `--accent-soft` / `--primary-light-solid` | `rgba(15,95,110,.12)` / `#dceef1` | Tints de teal: item de lista ativo, chips de produto, chips de ícone. |
| `--ink` / `--ink-hover` | `#14181f` / `#000000` | **Ação principal** (botão preto). No máximo **um** por ecrã. |
| `--coral` / `--coral-hover` | `#C9371B` / `#A82C14` | **Só o que é acionável e urgente** (5,19:1 com branco): o botão de localização do mapa e o botão de filtros quando há um filtro ativo. Em mais nenhum sítio. |
| `--forest` | `#1D5C3A` | **Presença de vendedores** (7,94:1): cor por omissão dos pins do mapa. |
| `--gold` / `--amber` | `#E8B21F` | Informação, nunca ação. **Sempre como fundo**, com `--text` por cima (8,95:1). Nunca com texto branco — daria 1,61:1. |
| `--gold-strong` / `--amber-strong` | `#7A5B06` | A variante para usar como **texto** dourado sobre branco. |
| `--grad-dark` | gradiente `#0F5F6E → #0B4A56` | **Blocos teal de destaque** (banners/CTAs finais) com texto branco. |
| `--text` | `#12191f` | Títulos e texto principal. |
| `--text-secondary` | `#46545f` | Parágrafos de apoio. |
| `--text-muted` | `#6b7885` | Legendas, contadores e metadados. |
| `--border` / `--border-strong` | `rgba(18,25,31,.07)` / `.13` | Hairlines. Só onde a sombra não chega (divisórias internas, contorno de checkbox). |
| `--blue` / `--sky` | `#1078a0` | Apenas funcional: links utilitários e "a tua posição" no mapa (AA sobre branco). |
| `--success` / `--warning` / `--error` | `#15803d` / `#b45309` / `#b91c1c` | Apenas estados funcionais (validação, avisos), com fundos rgba translúcidos; todos AA sobre branco. |

**Regra de ouro:** preto = "a ação desta página" (um só por ecrã); coral =
"faz isto agora" (um só visível de cada vez); teal = seleção, estados ativos e
blocos de destaque; verde floresta = "há aqui um vendedor"; dourado =
informação, nunca ação. Dentro de um bloco teal o botão inverte para **pílula
branca com texto teal**. Header e rodapé são barras translúcidas com blur; o
header só ganha linha e sombra depois de rolar.

## 2. Tipografia

Família única: **Inter** (variável 100–900, self-hosted).

| Token | Tamanho | Uso |
|---|---|---|
| `--fs-display` | 40→60px | Títulos de hero de página inteira (peso 800) |
| `--fs-h1` | 32→44px | H1 do hero das páginas internas (peso 800) |
| `--fs-h2` | 28→32px | Títulos de secção (peso 700) |
| `--fs-h3` | 20→24px | Subtítulos e cabeçalhos de painel (peso 600–700) |
| `--fs-lead` | 17→20px | Parágrafo de apoio sob um título (peso 400) |
| `--fs-body` | 16px | Corpo (peso 400) |
| `--fs-body-sm` | 15px | Corpo compacto (cards, listas) |
| `--fs-caption` | 13px | Legendas, labels de filtro, contadores |

Títulos com `letter-spacing` negativo (−0.02 a −0.03em); nada em caixa alta.
Menu de navegação: **caixa normal**, 0.9rem, peso 500, pastilha cinzenta em
hover; o item ativo é uma pastilha preenchida (não um sublinhado).

## 3. Espaçamento, raios e sombras

- Escala de espaço: `--space-xs` 8 · `--space-sm` 12 · `--space-md` 16 ·
  `--space-lg` 24 · `--space-xl` 32 · `--space-2xl` 48 · `--gutter` 16
  (folga entre os painéis flutuantes e as margens da tela).
- Raios: `--radius-sm` 12 · `--radius-control` 14 (campos, opções, zoom) ·
  `--radius-lg` 18 · `--radius-panel` 22 (**painéis**) · `--radius-2xl` 28
  (heroes) · **`--radius-btn` = `--radius-full` (todos os botões são
  pílulas)**.
- Sombras: `--shadow-xs`→`--shadow-lg`, em duas camadas (um contacto curto
  que substitui a borda de 1px + uma difusão longa que levanta o painel);
  **`--shadow-float`** para o que flutua sobre o mapa, onde o fundo é
  imprevisível.

## 4. Componentes partilhados (classes CSS)

| Componente | Classes | Onde vive |
|---|---|---|
| Painel de pesquisa (Home) | `.search-panel` + `-head/-title/-count/-actions` | `Home.css` |
| Segmento | `.segmented` + `.segmented-opt` (ativo = teal preenchido) | `Home.css` |
| Opção selecionável | `.option-list` + `.option-card` + `.option-card-mark` (ativo = contorno teal) | `Home.css` |
| Chips de filtro ativo | `.filter-chips` + `.filter-chip` (remove ao clicar) | `Home.css` |
| Botões de painel | `.panel-btn` + `.panel-btn-primary` (preto) / `.panel-btn-ghost` (cinzento) | `Home.css` |
| Vista Mapa/Lista | `.map-toolbar` + `.map-toolbar-btn` (pastilha flutuante) | `Home.css` |
| Lista de vendedores | `.vendors-panel`, `.vendor-item` (ativo = `--accent-soft`) | `Home.css` |
| Folha de filtros (mobile) | `.filter-sheet` + `.filter-option` / `.filter-distance-opt` / `.filter-apply-btn` | `Home.css` |
| Botões de conteúdo | `.hero-pill` + `.hero-pill-primary` / `.hero-pill-ghost` · `.nav-cta` | `Home.css` / `index.css` |
| Hero card interno | `.info-hero` + `.info-hero-title/-lead` | `InfoPage.css` |
| Badges/Chips | `.info-badge` (+ `.info-badge-sky`) | `InfoPage.css` |
| Cards de conteúdo | `.info-card`, `.info-cards` (grelha) | `InfoPage.css` |
| Accordion (FAQs) | `.faq-item` (`<details>`) + `.faq-q`/`.faq-a` | `FAQ.css` |
| Timeline numerada | `.info-timeline` (números em círculos teal) | `InfoPage.css` |
| Banner teal | `.info-banner` (`--grad-dark`) + `.info-banner-btn` | `InfoPage.css` |
| Inputs | `.contacto-input/-label/-error` — fundo `--surface-alt`, foco com contorno teal | `Contacto.css` |

Sem imagens decorativas: os heroes das páginas internas são painéis brancos
apenas com texto e badges; o único `<img>` do layout é o logótipo da navbar
(fotos de perfil/produtos dos vendedores são conteúdo, não decoração).

## 5. Acessibilidade

- Foco visível: `outline: 2px solid var(--focus-ring)` (teal escuro `#1078a0`,
  +2px offset) em todos os elementos interativos.
- Alvos de toque ≥48×48px em mobile (≥44px é o mínimo legal, não o alvo).
- Contraste: o site é usado num telemóvel ao sol, onde o mínimo AA não chega.
  `--text`, `--text-secondary` e `--text-muted` garantem AA sobre branco; o
  teal `--accent` (#0F5F6E) dá **7,29:1** com texto branco, o verde floresta
  **7,94:1** e o coral **5,19:1**. Não usar cinzentos mais claros do que
  `--text-muted` para texto informativo, nem texto teal dentro de blocos teal
  (usar `--on-accent`).
- Cores dos pins do mapa: a lista fechada em `PinColorPicker.jsx` é a única
  fonte válida. Todas dão ≥6:1 contra os tiles do mapa (`#e6e9ee`) — o fundo
  real contra o qual um pin é lido. Não adicionar cores sem verificar isso.
- Alvos de toque no mapa: ≥48px; o botão de localização é de 64px por ser a
  única ação da página e ter de ser acertado com o polegar, de pé, com uma mão.
- Ícones sem texto visível têm sempre `aria-label`; decorativos usam
  `aria-hidden="true"`.
- `color-scheme: light` ativo — controlos nativos (selects, scrollbars)
  rendem em modo claro.
- `prefers-reduced-motion`: todas as animações e transições são reduzidas a
  ~0ms (ver `index.css`); o spinner do botão de localização abranda em vez de
  desaparecer.
