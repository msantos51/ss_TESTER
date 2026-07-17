# Sunny Sales — Design System "Oceano / Editorial"

Tokens centralizados em [`src/index.css`](src/index.css) (`:root`). Este documento
descreve **como usar cada token**. Nenhuma página deve introduzir cores, tamanhos
de fonte ou sombras fora desta lista.

## 0. Conceito

Todo o site assenta sobre uma **fotografia de oceano turquesa** (vista aérea,
`public/ocean-bg.webp`, gerada proceduralmente) fixa atrás do conteúdo, com um
véu escuro por cima para garantir contraste — ao estilo das landings editoriais
de vela/viagens. Sobre ela existem apenas três coisas:

1. **Texto branco** diretamente sobre a imagem (títulos de página, hero);
2. **Caixas pretas** (petróleo quase preto, translúcidas) com texto branco —
   cards, formulários, painéis, navbar, rodapé;
3. **Caixas brancas** com texto quase preto — botões/CTAs e destaques.

Não há cores decorativas: a paleta é branco/preto sobre o turquesa da fotografia.

## 1. Paleta

| Token | Valor | Uso |
|---|---|---|
| (fundo global) | `body::before` com `ocean-bg.webp` + véu escuro | Fotografia fixa atrás de todo o site; véu em gradiente vertical (0.26–0.52). |
| `--bg` / `--bg-deep` / `--bg-raised` | `#061a21` / `#04141a` / `#0b222b` | Tons de petróleo escuro: cor de reserva do body enquanto a foto carrega, painéis do mapa. |
| `--surface` / `--surface-alt` | `rgba(6,18,23,0.88)` / `rgba(20,38,46,0.92)` | **Caixas pretas** translúcidas: cards e painéis; o alt para chips, ícones e hovers. |
| `--accent` / `--primary` / `--secondary` / `--ink` | `#ffffff` | **Caixas brancas / ação primária** — CTAs sólidos, badges, item de menu ativo, destaques. Texto sobre estes fundos: **`--on-accent`**. |
| `--on-accent` / `--ink-on-light` | `#0d1519` | Texto quase preto sobre superfícies brancas. |
| `--accent-hover` | `#dbe6e9` | Hover (leve tom frio) dos botões brancos. |
| `--navy` | `#0d1a20` | Painéis escuros institucionais. |
| `--text` | `#ffffff` | Títulos e texto principal — sobre caixas pretas e sobre a fotografia (o véu garante o contraste). |
| `--text-secondary` | `#cddade` | Parágrafos de apoio. |
| `--text-muted` | `#9db1b7` | Legendas e metadados. |
| `--border` / `--border-strong` | `rgba(255,255,255,0.12)` / `0.24` | Bordas de 1px sobre escuro; a forte em hover/inputs/outlines. |
| `--blue` / `--teal` / `--sky` | `#7fd8e4` | Apenas funcional: links utilitários e "a tua posição" no mapa. |
| `--success` / `--warning` / `--error` | verdes/âmbar/vermelho claros | Apenas estados funcionais (validação, avisos), com fundos rgba translúcidos. |

**Regra de ouro:** caixa branca = "faz isto agora" (nunca dois CTAs brancos
sólidos lado a lado); caixa preta = conteúdo; texto direto na fotografia =
branco puro, de preferência grande e com peso. Header e rodapé são caixas
pretas translúcidas com blur; na Home o header começa transparente sobre o
hero e ganha fundo ao rolar.

## 2. Tipografia

Família única: **Inter** (variável 100–900, self-hosted).

| Token | Tamanho | Uso |
|---|---|---|
| (hero Home) | `clamp(3.1rem, 11vw, 9.5rem)` | Título "SUNNY SALES" em **CAIXA ALTA**, peso 800, branco, uma linha (duas em mobile) |
| (eyebrow) | 13→16px | Linha acima do título do hero: uppercase, tracking `0.34em` |
| `--fs-h1` | 32→44px | H1 do hero das páginas internas (peso 800) |
| `--fs-h2` | 28→32px | Títulos de secção (peso 700) |
| `--fs-h3` | 20→24px | Subtítulos e cabeçalhos de card (peso 600–700) |
| `--fs-lead` | 17→20px | Parágrafo de apoio sob um título (peso 400) |
| `--fs-body` | 16px | Corpo (peso 400) |
| `--fs-body-sm` | 15px | Corpo compacto (cards, listas) |
| `--fs-caption` | 13px | Legendas, labels, eyebrows uppercase |

Menu de navegação: itens em **UPPERCASE**, 0.78rem, peso 600, tracking `0.08em`;
item ativo com sublinhado fino de 2px branco.

## 3. Espaçamento, raios e sombras

- Escala de espaço: `--space-xs` 8 · `--space-sm` 12 · `--space-md` 16 ·
  `--space-lg` 24 · `--space-xl` 32 · `--space-2xl` 48.
- Raios: `--radius-sm` 10 · `--radius-md` 12 (inputs) · `--radius-lg` 16
  (cards) · `--radius-2xl` 20 (heroes) · **`--radius-btn` = `--radius-full`
  (todos os botões são pílulas)**.
- Sombras: `--shadow-xs`→`--shadow-lg` (rgba petróleo profundo, para assentar
  as caixas na fotografia); `--shadow-accent` para CTAs brancos em destaque.

## 4. Componentes partilhados (classes CSS)

| Componente | Classes | Onde vive |
|---|---|---|
| Botões | `.hero-pill` (base pílula) + `.hero-pill-primary` (branco sólido, texto quase preto) / `.hero-pill-ghost` (outline branco + blur sobre a foto) · `.nav-cta` (pílula branca, header) | `Home.css` / `index.css` |
| Hero card interno | `.info-hero.info-hero--media` + `.info-hero-content/-title/-lead/-media` (caixa preta a separar texto/foto) | `InfoPage.css` |
| Badges/Chips | `.info-badge` (+ `.info-badge-sky`) | `InfoPage.css` |
| Cards de conteúdo | `.info-card`, `.info-cards` (grelha) | `InfoPage.css` |
| Caixas brancas de destaque | `.home-stat` (Home) · `.pv-plan-badge` (Planos) | páginas respetivas |
| Accordion (FAQs) | `.faq-item` (`<details>`) + `.faq-q`/`.faq-a` | `FAQ.css` |
| Tabs segmentadas | `.faq-tabs` + `.faq-tab` (ativa = caixa branca) | `FAQ.css` |
| Timeline numerada | `.info-timeline` (números em círculos brancos) | `InfoPage.css` |
| Banner escuro | `.info-banner` (`--grad-dark`) + `.info-banner-btn` (pílula branca) | `InfoPage.css` |
| Inputs | `.contacto-input/-label/-error` (Contacto) · `.vd-form-input` (dashboard) — fundos escuros, texto claro | páginas respetivas |
| Toggle | `.vendor-switch` | `VendorDashboard.css` |
| StatCard | `.vd-stat-card` (+ `.vd-skeleton` no loading) | `VendorDashboard.css` |

As imagens hero das páginas internas usam todas o mesmo tratamento:
grelha `1.05fr/0.95fr`, `min-height: 320px`, `object-fit: cover`, gradiente
escuro suave à esquerda (transição para o card) e fonte Unsplash com
`auto=format` (WebP/AVIF).

A fotografia de fundo tem duas variantes (`ocean-bg.webp` 2400px ≈ 92 KB e
`ocean-bg-mobile.webp` 1200px ≈ 41 KB, trocadas aos 768px) e é pré-carregada
no `index.html` por ser o elemento LCP.

## 5. Acessibilidade

- Foco visível: `outline: 2px solid var(--focus-ring)` (branco, +2px offset)
  em todos os elementos interativos.
- Alvos de toque ≥44×44px em mobile.
- Contraste mínimo AA: o véu escuro sobre a fotografia garante o contraste do
  texto branco direto na imagem; dentro das caixas os tokens de texto já o
  garantem — não usar cinzentos mais escuros do que `--text-muted` para texto
  informativo, nem texto branco dentro de caixas brancas (usar `--on-accent`).
- Ícones sem texto visível têm sempre `aria-label`; decorativos usam
  `aria-hidden="true"`.
- `color-scheme: dark` ativo — controlos nativos (selects, scrollbars)
  rendem em modo escuro.
- `prefers-reduced-motion`: animações do hero e indicador de scroll desativados.
