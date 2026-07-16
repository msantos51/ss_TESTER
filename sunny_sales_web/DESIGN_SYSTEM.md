# Sunny Sales — Design System "Dark Sport / Premium"

Tokens centralizados em [`src/index.css`](src/index.css) (`:root`). Este documento
descreve **como usar cada token**. Nenhuma página deve introduzir cores, tamanhos
de fonte ou sombras fora desta lista.

## 1. Paleta

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#10151c` (azul-petróleo/carvão) | Fundo principal do site (body, navbar). |
| `--bg-deep` / `--bg-raised` | `#0b0f15` / `#1a212b` | Extremos dos gradientes subtis do hero e de secções de destaque. |
| `--surface` / `--surface-alt` | `#1a212b` / `#232d3a` | Fundo de cards e painéis; o alt para chips, ícones e hovers. |
| `--accent` / `--secondary` | `#ef4136` (vermelho-alaranjado) | **Ação primária** — CTAs sólidos ("Explorar Mapa", submissões, plano em destaque) — e detalhes: sublinhado do item de menu ativo, ícones, badges, pontos. Texto sobre o acento: sempre `#fff`. |
| `--accent-hover` | `#d63527` | Hover (leve escurecimento) dos botões de acento. |
| `--accent-text` / `--primary-dark` | `#ff8d84` | Texto/ícones de acento sobre fundo escuro (AA). |
| `--primary` | alias de `--accent` | Compatibilidade: ícones, links, estados ativos, foco. |
| `--ink` | alias de `--accent` | Compatibilidade: botões sólidos legados ficam no acento. Para texto escuro sobre fundos claros residuais usar `--ink-on-light` (`#151b22`). |
| `--navy` | `#151d27` | Painéis escuros institucionais (ligeiramente mais claros que o fundo). |
| `--text` | `#f5f5f5` | Títulos e texto principal sobre fundo escuro. |
| `--text-secondary` | `#c9ced6` | Parágrafos de apoio. |
| `--text-muted` | `#98a2ae` | Legendas e metadados. |
| `--border` / `--border-strong` | `#262f3a` / `#364253` | Bordas de 1px sobre escuro; a forte em hover/inputs/outlines. |
| `--blue` / `--teal` / `--sky` | `#5cc0d4` | Apenas funcional: links utilitários e "a tua posição" no mapa. |
| `--success` / `--warning` / `--error` | verdes/âmbar/vermelho claros | Apenas estados funcionais (validação, avisos), com fundos rgba translúcidos. |

**Regra de ouro:** vermelho-alaranjado = "faz isto agora" + detalhes de marca;
branco/quase-branco = texto e outlines; os fundos são sempre tons escuros de
azul-petróleo/carvão com gradientes subtis (`--grad-dark`). Se um ecrã tiver
dois botões sólidos de acento lado a lado, um deles está errado.

## 2. Tipografia

Família única: **Inter** (variável 100–900, self-hosted).

| Token | Tamanho | Uso |
|---|---|---|
| `--fs-display` | 48→64px | H1 do hero da Home (peso **800**, tracking -0.03em) |
| `--fs-h1` | 32→44px | H1 do hero das páginas internas (peso 800) |
| `--fs-h2` | 28→32px | Títulos de secção (peso 700) |
| `--fs-h3` | 20→24px | Subtítulos e cabeçalhos de card (peso 600–700) |
| `--fs-lead` | 17→20px | Parágrafo de apoio sob um título (cor `--text-secondary`, peso 400) |
| `--fs-body` | 16px | Corpo (peso 400) |
| `--fs-body-sm` | 15px | Corpo compacto (cards, listas) |
| `--fs-caption` | 13px | Legendas, labels, eyebrows uppercase |

Menu de navegação: itens em **UPPERCASE**, 0.78rem, peso 600, tracking `0.08em`;
item ativo com sublinhado fino de 2px em `--accent`.

## 3. Espaçamento, raios e sombras

- Escala de espaço: `--space-xs` 8 · `--space-sm` 12 · `--space-md` 16 ·
  `--space-lg` 24 · `--space-xl` 32 · `--space-2xl` 48.
- Ritmo vertical de secções da Home: `--section-pad` (`clamp(4rem, 8vw, 7rem)`)
  aplicado como padding-top de todas as secções.
- Raios: `--radius-sm` 10 · `--radius-md` 12 (inputs) · `--radius-lg` 16
  (cards) · `--radius-2xl` 20 (heroes) · **`--radius-btn` = `--radius-full`
  (todos os botões são pílulas)**.
- Sombras: `--shadow-xs`→`--shadow-lg` (profundas, rgba(0,0,0,0.3+));
  `--shadow-accent` para CTAs de acento em destaque.

## 4. Componentes partilhados (classes CSS)

| Componente | Classes | Onde vive |
|---|---|---|
| Botões | `.hero-pill` (base pílula) + `.hero-pill-primary` (acento sólido, texto branco) / `.hero-pill-ghost` (outline branco/transparente) · `.nav-cta` (pílula de acento, header) | `Home.css` / `index.css` |
| Hero card interno | `.info-hero.info-hero--media` + `.info-hero-content/-title/-lead/-media` (gradiente escuro a separar texto/foto) | `InfoPage.css` |
| Badges/Chips | `.info-badge` (+ `.info-badge-sky`) | `InfoPage.css` |
| Cards de conteúdo | `.info-card`, `.info-cards` (grelha) | `InfoPage.css` |
| Accordion (FAQs) | `.faq-item` (`<details>`) + `.faq-q`/`.faq-a` | `FAQ.css` |
| Tabs segmentadas | `.faq-tabs` + `.faq-tab` (ativa com traço de acento) | `FAQ.css` |
| Timeline numerada | `.info-timeline` (números em acento) | `InfoPage.css` |
| Banner escuro | `.info-banner` (`--grad-dark`) + `.info-banner-btn` (pílula de acento) | `InfoPage.css` |
| Inputs | `.contacto-input/-label/-error` (Contacto) · `.vd-form-input` (dashboard) — fundos `--surface-alt`, texto claro | páginas respetivas |
| Toggle | `.vendor-switch` | `VendorDashboard.css` |
| StatCard | `.vd-stat-card` (+ `.vd-skeleton` no loading) | `VendorDashboard.css` |

As imagens hero das páginas internas usam todas o mesmo tratamento:
grelha `1.05fr/0.95fr`, `min-height: 320px`, `object-fit: cover`, gradiente
escuro suave à esquerda (transição para o card) e fonte Unsplash com
`auto=format` (WebP/AVIF).

## 5. Acessibilidade

- Foco visível: `outline: 2px solid var(--focus-ring)` (`#ff8d84`, +2px offset)
  em todos os elementos interativos.
- Alvos de toque ≥44×44px em mobile.
- Contraste mínimo AA garantido pelos tokens de texto sobre os fundos escuros —
  não usar cinzentos mais escuros do que `--text-muted` para texto informativo.
- Ícones sem texto visível têm sempre `aria-label`; decorativos usam
  `aria-hidden="true"`.
- `color-scheme: dark` ativo — controlos nativos (selects, scrollbars)
  rendem em modo escuro.
