# Sunny Sales — Design System "Areia Branca / Teal"

Tokens centralizados em [`src/index.css`](src/index.css) (`:root`). Este documento
descreve **como usar cada token**. Nenhuma página deve introduzir cores, tamanhos
de fonte ou sombras fora desta lista.

## 0. Conceito

Todo o site assenta sobre um **fundo branco puro**, sem fotografias nem texturas —
limpo, simples e profissional, ao estilo dos UI kits de viagens minimalistas.
Sobre ele existem apenas três coisas:

1. **Texto escuro** (petróleo) diretamente sobre o branco (títulos, corpo);
2. **Cartões brancos** com borda subtil e sombra suave — cards, formulários,
   painéis, navbar, rodapé; chips e hovers num cinzento-verde muito claro;
3. **Blocos e botões teal** (verde-água da marca) com texto branco — CTAs,
   estados ativos e banners de destaque.

Não há imagens decorativas: a paleta é branco/petróleo com **uma** cor de
marca (teal), inspirada nos UI de viagem de referência.

## 1. Paleta

| Token | Valor | Uso |
|---|---|---|
| (fundo global) | `#ffffff` | Fundo branco em todo o site (body). |
| `--bg` / `--bg-deep` / `--bg-raised` | `#ffffff` / `#f1f5f4` / `#ffffff` | Fundo de página e tint claro para zonas de apoio. |
| `--surface` / `--surface-alt` | `#ffffff` / `#f2f6f5` | **Cartões brancos** (com `--border` + sombra) e cinzento claro para chips, ícones e hovers. |
| `--accent` / `--primary` / `--secondary` / `--ink` | `#2b7c6d` | **Teal da marca** — CTAs sólidos, badges, item de menu ativo, blocos de destaque. Texto sobre estes fundos: **`--on-accent`**. |
| `--on-accent` | `#ffffff` | Texto branco sobre superfícies teal. |
| `--accent-hover` / `--primary-hover` | `#236457` | Hover (tom mais escuro) dos botões teal. |
| `--primary-dark` | `#1e5a4f` | Teal escuro: texto/números de destaque sobre branco e botões brancos sobre blocos teal. |
| `--primary-light` / `--primary-light-solid` | `rgba(43,124,109,0.1)` / `#e6f1ee` | Tints claros de teal para fundos de chips/ícones/hovers. |
| `--grad-dark` | gradiente `#2b7c6d → #1e5a4f` | **Blocos teal de destaque** (banners/CTAs finais) com texto branco. |
| `--text` | `#1b2c33` | Títulos e texto principal sobre branco. |
| `--text-secondary` | `#475a62` | Parágrafos de apoio. |
| `--text-muted` | `#64787f` | Legendas e metadados. |
| `--border` / `--border-strong` | `rgba(27,44,51,0.10)` / `0.18` | Bordas de 1px sobre claro; a forte em hover/inputs/outlines. |
| `--blue` / `--teal` / `--sky` | `#1d6a5c` | Apenas funcional: links utilitários e "a tua posição" no mapa (AA sobre branco). |
| `--success` / `--warning` / `--error` | `#15803d` / `#b45309` / `#b91c1c` | Apenas estados funcionais (validação, avisos), com fundos rgba translúcidos; todos AA sobre branco. |

**Regra de ouro:** teal = "faz isto agora" (nunca dois CTAs teal sólidos lado a
lado); cartão branco = conteúdo; dentro de um bloco teal o botão inverte para
**pílula branca com texto teal**. Header e rodapé são barras brancas
translúcidas com blur; na Home o header começa transparente sobre o hero e
ganha fundo ao rolar.

## 2. Tipografia

Família única: **Inter** (variável 100–900, self-hosted).

| Token | Tamanho | Uso |
|---|---|---|
| (hero Home) | `clamp(3.1rem, 11vw, 9.5rem)` | Título "SUNNY SALES" em **CAIXA ALTA**, peso 800, petróleo escuro, uma linha (duas em mobile) |
| (eyebrow) | 13→16px | Linha acima do título do hero: uppercase, tracking `0.34em`, cor teal |
| `--fs-h1` | 32→44px | H1 do hero das páginas internas (peso 800) |
| `--fs-h2` | 28→32px | Títulos de secção (peso 700) |
| `--fs-h3` | 20→24px | Subtítulos e cabeçalhos de card (peso 600–700) |
| `--fs-lead` | 17→20px | Parágrafo de apoio sob um título (peso 400) |
| `--fs-body` | 16px | Corpo (peso 400) |
| `--fs-body-sm` | 15px | Corpo compacto (cards, listas) |
| `--fs-caption` | 13px | Legendas, labels, eyebrows uppercase |

Menu de navegação: itens em **UPPERCASE**, 0.78rem, peso 600, tracking `0.08em`;
item ativo com sublinhado fino de 2px teal.

## 3. Espaçamento, raios e sombras

- Escala de espaço: `--space-xs` 8 · `--space-sm` 12 · `--space-md` 16 ·
  `--space-lg` 24 · `--space-xl` 32 · `--space-2xl` 48.
- Raios: `--radius-sm` 10 · `--radius-md` 12 (inputs) · `--radius-lg` 16
  (cards) · `--radius-2xl` 20 (heroes) · **`--radius-btn` = `--radius-full`
  (todos os botões são pílulas)**.
- Sombras: `--shadow-xs`→`--shadow-lg` (rgba petróleo muito suave, para
  destacar cartões brancos sobre branco); `--shadow-accent` para CTAs teal em
  destaque.

## 4. Componentes partilhados (classes CSS)

| Componente | Classes | Onde vive |
|---|---|---|
| Botões | `.hero-pill` (base pílula) + `.hero-pill-primary` (teal sólido, texto branco) / `.hero-pill-ghost` (contorno cinzento sobre branco) · `.nav-cta` (pílula teal, header) | `Home.css` / `index.css` |
| Hero card interno | `.info-hero` + `.info-hero-title/-lead` (cartão branco, sem imagem) | `InfoPage.css` |
| Badges/Chips | `.info-badge` (+ `.info-badge-sky`) | `InfoPage.css` |
| Cards de conteúdo | `.info-card`, `.info-cards` (grelha) | `InfoPage.css` |
| Destaques claros | `.home-stat` (Home) · `.pv-plan-badge` (Planos) | páginas respetivas |
| Accordion (FAQs) | `.faq-item` (`<details>`) + `.faq-q`/`.faq-a` | `FAQ.css` |
| Tabs segmentadas | `.faq-tabs` + `.faq-tab` (ativa = cartão branco + traço teal) | `FAQ.css` |
| Timeline numerada | `.info-timeline` (números em círculos teal) | `InfoPage.css` |
| Banner teal | `.info-banner` (`--grad-dark`) + `.info-banner-btn` (pílula branca, texto teal) | `InfoPage.css` |
| Inputs | `.contacto-input/-label/-error` (Contacto) · `.vd-form-input` (dashboard) — fundos claros, foco teal | páginas respetivas |
| Toggle | `.vendor-switch` | `VendorDashboard.css` |
| StatCard | `.vd-stat-card` (+ `.vd-skeleton` no loading) | `VendorDashboard.css` |

Sem imagens decorativas: os heroes das páginas internas são cartões brancos
apenas com texto e badges; o único `<img>` do layout é o logótipo da navbar
(fotos de perfil/produtos dos vendedores são conteúdo, não decoração).

## 5. Acessibilidade

- Foco visível: `outline: 2px solid var(--focus-ring)` (teal escuro `#1d6a5c`,
  +2px offset) em todos os elementos interativos.
- Alvos de toque ≥44×44px em mobile.
- Contraste mínimo AA: `--text`, `--text-secondary` e `--text-muted` garantem
  AA sobre branco; o teal `--accent` (#2b7c6d) garante ≥4.5:1 com texto branco
  nos botões e blocos; não usar cinzentos mais claros do que `--text-muted`
  para texto informativo, nem texto teal dentro de blocos teal (usar
  `--on-accent`).
- Ícones sem texto visível têm sempre `aria-label`; decorativos usam
  `aria-hidden="true"`.
- `color-scheme: light` ativo — controlos nativos (selects, scrollbars)
  rendem em modo claro.
- `prefers-reduced-motion`: animações do hero e indicador de scroll desativados.
