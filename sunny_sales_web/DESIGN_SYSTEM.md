# Sunny Sales — Design System "Canvas / Painéis", em verão

Tokens centralizados em [`src/index.css`](src/index.css) (`:root`). Este documento
descreve **como usar cada token**. Nenhuma página deve introduzir cores, tamanhos
de fonte ou sombras fora desta lista.

## 0. Conceito

O site é uma **tela de areia lavada** (`--canvas`) sobre a qual flutuam
**painéis brancos arredondados** com sombra difusa. A profundidade vem da
sombra, não de bordas de 1px. São só quatro camadas:

1. **A tela** — areia `#FAF3E6`, sem fotografias nem texturas. Por cima dela,
   uma **camada fixa de atmosfera** (`body::before`): halo de sol no canto
   superior, maré azul a entrar pela base. É decorativa, não tem eventos de
   rato e não entra no fluxo;
2. **Painéis brancos** de cantos grandes (`--radius-panel`, 22px) — a barra
   lateral de pesquisa, o mapa, a lista de vendedores, os cartões das páginas
   internas, os blocos das páginas legais;
3. **Controlos** — segmentos, opções e chips em areia clara
   (`--surface-alt`), com o estado selecionado a **maré** (preenchido nos
   segmentos, contornado nas opções);
4. **Uma ação principal de mar profundo** por ecrã (`--ink`) — "Ver o mapa" na
   entrada, "Aplicar" na folha de filtros, "Enviar" no Contacto.

Sobre o mapa, tudo o que é controlo (vista, zoom, localizar, meteorologia,
filtros) flutua em **pastilhas brancas** com `--shadow-float`, nunca colado
às arestas.

**O verão faz-se com luz, não com mais cor.** O vocabulário decorativo é
curto e repete-se de propósito: o **fio de sol** (`--grad-sun`, 3–4px no topo
de um painel ou à esquerda de um accordion), o **halo de sol** (um círculo
radial dourado no canto de um bloco escuro, sempre por baixo do texto) e a
**lavagem quente** nos heroes brancos. Nada disto leva texto por cima nem
altera o fundo contra o qual o contraste é medido.

## 1. Paleta

| Token | Valor | Uso |
|---|---|---|
| `--canvas` / `--canvas-deep` | `#FAF3E6` / `#F2E5D1` | **Tela de areia** de fundo de todo o site (body) e o seu tom mais fundo (ex.: o "404"). Separação painel/tela: 1,10:1. |
| `--surface` | `#ffffff` | **Painéis brancos** (sem borda, com `--shadow-sm`). |
| `--surface-alt` / `--surface-hover` | `#F5EDE0` / `#EDE3D2` | Preenchimento de chips, segmentos, campos e botões-ícone; o segundo é o hover. |
| `--accent` / `--primary` / `--secondary` | `#0C7383` | **Maré da marca** — estado selecionado, badges, ícones de marca. Texto por cima: **`--on-accent`** (5,53:1). Como **texto** sobre branco dá 5,53:1 e sobre chip 4,76:1 — AA nos dois. |
| `--on-accent` | `#ffffff` | Texto branco sobre superfícies de maré. |
| `--accent-hover` / `--primary-hover` / `--primary-dark` / `--accent-text` | `#0A5D6B` | Hover (tom mais fundo) das superfícies de maré; e a variante para **texto** de acento sobre claro (7,52:1). |
| `--primary-bright` | `#2BA6B8` | Turquesa de água rasa. **Só decoração** — glows, gradientes, aros. Dá 2,9:1: nunca texto, nunca preenchimento de botão. |
| `--accent-soft` / `--primary-light-solid` | `rgba(12,115,131,.12)` / `#D8F0F6` | Tints de maré: item de lista ativo, chips de produto, chips de ícone. |
| `--ink` / `--ink-hover` | `#123B45` / `#0B2830` | **Ação principal** (botão de mar profundo, 12,09:1). No máximo **um** por ecrã. |
| `--coral` / `--coral-hover` | `#CF3C18` / `#A82C14` | **Só o que é acionável e urgente** (4,87:1 com branco): o botão de localização do mapa e o botão de filtros quando há um filtro ativo. Em mais nenhum sítio. |
| `--forest` | `#1D5C3A` | **Presença de vendedores** (7,94:1): cor por omissão dos pins do mapa. |
| `--gold` / `--amber` | `#FFC24A` | O sol: informação, nunca ação. **Sempre como fundo**, com `--text` por cima (9,95:1). Nunca com texto branco — daria 1,61:1. |
| `--gold-strong` / `--amber-strong` | `#7A5200` | A variante para usar como **texto** dourado sobre branco (6,92:1). |
| `--grad-dark` | gradiente `#0E5A68 → #123B45 → #0A333C` | **Blocos escuros de destaque** (banners/CTAs finais) com texto branco (≥7,8:1 em qualquer ponto do gradiente). |
| `--grad-sun` | gradiente `#FFD37A → #F5941F` | **Fio de sol** decorativo: 3–4px no topo de um painel, sublinhado dos títulos de secção, margem esquerda de um accordion aberto. Nunca leva texto por cima. |
| `--glow-sun` / `--glow-sea` | radiais translúcidos | Halos decorativos das camadas de atmosfera. Somam-se ao `body::before`, por isso são fracos de propósito. |
| `--text` | `#1A2327` | Títulos e texto principal (15,99:1 sobre branco, 14,48:1 sobre areia). |
| `--text-secondary` | `#4A585F` | Parágrafos de apoio (7,36 / 6,67:1). |
| `--text-muted` | `#606D74` | Legendas, contadores e metadados (5,33 / 4,83:1 — AA também sobre a areia e sobre os chips). |
| `--border` / `--border-strong` | `rgba(30,22,10,.07)` / `.14` | Hairlines mornas. Só onde a sombra não chega (divisórias internas, contorno de checkbox). |
| `--blue` / `--sky` / `--focus-ring` | `#0F6E93` | Apenas funcional: links utilitários, "a tua posição" no mapa e o anel de foco (5,72:1 sobre branco, 5,27:1 sobre areia). |
| `--success` / `--warning` / `--error` | `#15803d` / `#b45309` / `#b91c1c` | Apenas estados funcionais (validação, avisos), com fundos rgba translúcidos; todos AA sobre branco. |

**Regra de ouro:** mar profundo = "a ação desta página" (um só por ecrã);
coral = "faz isto agora" (um só visível de cada vez); maré = seleção, estados
ativos e blocos de destaque; verde palmeira = "há aqui um vendedor"; sol =
informação, nunca ação. Dentro de um bloco escuro o botão inverte para
**pílula branca com texto de maré**. Header e rodapé são barras translúcidas
mornas com blur; o header só ganha linha e sombra depois de rolar, e o rodapé
traz um fio de espuma (sol → água) no topo.

**Sobre a areia, cuidado com o ciano.** A tela é amarelada: um turquesa
translúcido por cima dela vira verde-lodo. As lavagens frias do site usam
azul (`rgba(31,133,190,…)`), não `--primary-bright`.

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
| Segmento | `.segmented` + `.segmented-opt` (ativo = maré preenchida) | `Home.css` |
| Opção selecionável | `.option-list` + `.option-card` + `.option-card-mark` (ativo = contorno de maré) | `Home.css` |
| Chips de filtro ativo | `.filter-chips` + `.filter-chip` (remove ao clicar) | `Home.css` |
| Botões de painel | `.panel-btn` + `.panel-btn-primary` (mar profundo) / `.panel-btn-ghost` (areia) | `Home.css` |
| Vista Mapa/Lista | `.map-toolbar` + `.map-toolbar-btn` (pastilha flutuante) | `Home.css` |
| Lista de vendedores | `.vendors-panel`, `.vendor-item` (ativo = `--accent-soft`) | `Home.css` |
| Folha de filtros (mobile) | `.filter-sheet` + `.filter-option` / `.filter-distance-opt` / `.filter-apply-btn` | `Home.css` |
| Botões de conteúdo | `.hero-pill` + `.hero-pill-primary` / `.hero-pill-ghost` · `.nav-cta` | `Home.css` / `index.css` |
| Hero card interno | `.info-hero` + `.info-hero-title/-lead` | `InfoPage.css` |
| Badges/Chips | `.info-badge` (+ `.info-badge-sky`) | `InfoPage.css` |
| Cards de conteúdo | `.info-card`, `.info-cards` (grelha) | `InfoPage.css` |
| Accordion (FAQs) | `.faq-item` (`<details>`) + `.faq-q`/`.faq-a` | `FAQ.css` |
| Timeline numerada | `.info-timeline` (números em círculos de maré) | `InfoPage.css` |
| Banner escuro | `.info-banner` (`--grad-dark` + halo de sol) + `.info-banner-btn` | `InfoPage.css` |
| Inputs | `.contacto-input/-label/-error` — fundo `--surface-alt`, foco com contorno de maré | `Contacto.css` |
| Fio de sol | `::before` de 3–4px com `--grad-sun` | `.info-hero`, `.contacto-form-wrap`, `.landing-step`, `.info-card`, `.home-stat`, `.faq-item[open]` |
| Halo de sol | `::before`/`::after` radial dourado, `z-index: 0`, conteúdo em `z-index: 1` | `.landing-hero`, `.landing-banner`, `.info-banner`, `.info-cta`, `.home-final` |

Sem imagens decorativas: os heroes das páginas internas são painéis brancos
apenas com texto e badges; o único `<img>` do layout é o logótipo da navbar
(fotos de perfil/produtos dos vendedores são conteúdo, não decoração). Os
enfeites de verão são **só gradientes CSS** — nenhum ficheiro novo, nenhuma
caixa nova no fluxo.

## 5. Acessibilidade

- Foco visível: `outline: 2px solid var(--focus-ring)` (azul-mar `#0F6E93`,
  +2px offset) em todos os elementos interativos — ≥4,9:1 sobre branco, areia
  e chips.
- Alvos de toque ≥48×48px em mobile (≥44px é o mínimo legal, não o alvo).
- Contraste: o site é usado num telemóvel ao sol, onde o mínimo AA não chega.
  `--text`, `--text-secondary` e `--text-muted` garantem AA **sobre os três
  fundos claros** (branco, areia e chips) — e não só sobre branco, porque a
  tela deixou de ser quase-branca. A maré `--accent` (#0C7383) dá **5,53:1**
  com texto branco, o verde palmeira **7,94:1** e o coral **4,87:1**. Não usar
  cinzentos mais claros do que `--text-muted` para texto informativo, nem
  texto de maré dentro de blocos de maré (usar `--on-accent`).
- Decoração nunca altera o fundo de leitura: os halos e as lavagens quentes
  são de baixa opacidade e ficam **por baixo** do texto (`z-index: 0` contra
  `z-index: 1`), por isso o contraste continua a medir-se contra `--canvas`,
  `--surface` ou `--grad-dark`, conforme o caso.
- `--primary-bright` e `--gold` não passam AA como texto (2,9:1 e 1,61:1) e
  por isso estão marcados como **só fundo/decoração** na tabela da secção 1.
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

## 6. Mapa da app do vendedor

O ecrã do mapa da app móvel (`mobile/src/pages/MapTab.jsx` +
`mobile/src/styles/MapTab.css`) segue **este** sistema, e não a paleta
areia/oceano do resto da app: é o mesmo mapa que os banhistas veem no site,
por isso fala a mesma língua visual — pastilhas e painéis brancos com
`--shadow-float` e `--radius-panel` sobre o mapa, tipografia Inter, uma única
ação âncora (`--ink`, ou `--coral` quando é urgente parar a partilha),
dourado só como fundo de informação e o pin do vendedor desenhado como o
marcador de posição do site (círculo na cor do perfil, anel branco de 3px,
seta de direção e halo a pulsar enquanto emite).

O que **não** atravessa para lá é a atmosfera: o halo de sol e a lavagem de
maré vivem no `body` do site e não têm equivalente na app, onde o mapa ocupa
o ecrã inteiro e não há tela por baixo para pintar.

Os tokens são **reproduzidos** lá com o prefixo `--site-` (a app não importa
o CSS do site), por isso uma mudança de paleta aqui tem de ser copiada para
`mobile/src/styles/MapTab.css`. Os restantes separadores da app — Produtos,
Trajetos, Conta, planos — mantêm os seus próprios tokens.
