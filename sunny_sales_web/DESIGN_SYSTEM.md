# Sunny Sales — Design System "Vidro & Maré"

Tokens centralizados em [`src/index.css`](src/index.css) (`:root`). Este documento
descreve **como usar cada token**. Nenhuma página deve introduzir cores, tamanhos
de fonte ou sombras fora desta lista.

## 0. Conceito

O site é uma **tela cor de areia** (`--canvas`, White Cloud) sobre a qual
flutuam **painéis brancos arredondados** com sombra difusa e **superfícies de
vidro** com blur. A profundidade vem da sombra, não de bordas de 1px. São
cinco camadas:

1. **A tela** — areia `#FFF9F4`, sem fotografias nem texturas;
2. **O ambiente** — só no hero da entrada: uma aguarela de teal, sol e azul
   (`--grad-ambient`) por baixo de tudo. É o que dá cor para o vidro filtrar;
   sem ela, a cápsula de navegação leria como um retângulo branco;
3. **Painéis brancos** de cantos grandes (`--radius-panel`, 22px) — a barra
   lateral de pesquisa, o mapa, a lista de vendedores, os cartões das páginas
   internas, os blocos das páginas legais;
4. **Vidro** (`--glass` / `--glass-strong` / `--glass-thick` + `--glass-blur`
   + `--glass-ring`) — a cápsula de navegação, a tab bar, o rodapé e tudo o
   que flutua sobre o mapa;
5. **Uma ação principal Sky Blue** por ecrã (`--ink`) — "Ver o mapa agora" na
   entrada, "Aplicar" na folha de filtros, "Enviar" no Contacto.

Sobre o mapa, tudo o que é controlo (vista, zoom, localizar, meteorologia,
filtros) flutua em **pastilhas de vidro** com `--shadow-float`, nunca colado
às arestas.

**Regra do vidro:** toda a superfície de vidro tem de ter um plano B opaco
(`--glass-solid`) atrás de `@supports not (backdrop-filter: …)`. Sem isso,
num WebView antigo o vidro fica num branco translúcido sem blur — um borrão
ilegível em vez de uma barra.

## 0.1. Navegação

| | Desktop (>768px) | Telemóvel (≤768px) |
|---|---|---|
| Forma | **Cápsula de vidro** centrada (`--capsule-max`, 1240px) que flutua a `--gutter` do topo e encolhe ao rolar | Cápsula compacta só com marca e Instagram + **tab bar fixa em baixo** |
| Destinos | Os cinco links dentro da cápsula + CTA "Abrir mapa" | Os mesmos cinco na tab bar, com ícone e rótulo curto |
| Item ativo | Pastilha `--accent-soft` com texto `--accent-text` | Pastilha `--accent-soft` + rótulo Sky Blue |
| Menu escondido | — | **Nenhum.** Não há hamburger: os destinos estão sempre à vista |

A lista de destinos vive num sítio só — `DESTINATIONS` em
[`src/App.jsx`](src/App.jsx) — e alimenta as duas navegações.

**`--tabbar-h`** é 0 em desktop e a altura real da tab bar (com a safe area
lá dentro) em telemóvel. Tudo o que se encosta ao fundo do ecrã reserva esta
folga: o `.container`, a altura do mapa (`.map-area`), o painel de vendedores
e o rodapé. A tab bar tem `height: var(--tabbar-h)` fixa — se crescesse com o
conteúdo, o token mentiria e o conteúdo ficaria por baixo dela.

Em telemóvel o rodapé **deixa de ser barra fixa** e passa a fechar a página:
58px de rodapé fixo mais 76px de tab bar gastavam um quinto do ecrã em cromo
permanente. A folga para a tab bar é dada em `padding-bottom` e não em
`margin-bottom` — a margem colapsava para fora do `.wrapper` e o rodapé
acabava por baixo da barra, sem forma de rolar até ele.

## 1. Paleta

As quatro cores da marca são as da paleta de verão. **O papel de cada uma é
decidido pelo contraste que aguenta**, não pelo gosto — o site é usado num
telemóvel ao sol.

| Token | Valor | Uso |
|---|---|---|
| `--canvas` / `--canvas-deep` | `#FFF9F4` / `#F7EFE7` | **Tela** de fundo de todo o site (body) e o seu tom mais fundo (ex.: o "404"). É o White Cloud da paleta. |
| `--surface` | `#ffffff` | **Painéis brancos** (sem borda, com `--shadow-sm`). |
| `--surface-alt` / `--surface-hover` | `#F4EDE6` / `#EBE1D7` | Preenchimento neutro de chips, segmentos, campos e botões-ícone; o segundo é o hover. |
| `--accent` / `--primary` / `--ink` | `#005F73` | **Sky Blue** — a única cor da paleta que aguenta texto pequeno (**7,28:1** com branco). Ações, links, botão principal, texto do item ativo. |
| `--on-accent` | `#ffffff` | Texto branco sobre superfícies Sky Blue. |
| `--accent-hover` / `--ink-hover` | `#00485A` | Hover (tom mais escuro) das superfícies Sky Blue. |
| `--teal` | `#0A9396` | **Teal Ocean** — 3,7:1 com branco: chega para **superfícies, ícones e texto grande**, nunca para corpo. |
| `--teal-text` | `#077C80` | O teal escurecido para usar como **texto** sobre a tela (4,8:1). |
| `--accent-soft` | `rgba(10,147,150,.12)` | Tinte de teal: item de navegação ativo, item de lista ativo, chips. |
| `--gold` / `--amber` | `#EE9B00` | **Summer Sun** — informação e "ao vivo", nunca ação. **Sempre como fundo**, com `--gold-ink` (`#2A1A00`, 8,1:1) por cima. Nunca com texto branco: daria 2,26:1. |
| `--gold-strong` | `#8A5A00` | A variante para usar como **texto** dourado sobre branco (5,9:1). |
| `--coral` / `--coral-hover` | `#BB3E03` / `#9A3303` | **Só o que é acionável e urgente** (5,58:1 com branco): o botão de localização do mapa e o botão de filtros quando há um filtro ativo. Em mais nenhum sítio. |
| `--forest` | `#1D5C3A` | **Presença de vendedores** (7,94:1): cor por omissão dos pins do mapa. Não muda com a paleta — é lida contra os tiles, não contra a tela. |
| `--glass` / `--glass-strong` / `--glass-thick` | `rgba(255,255,255,.72/.82)` / `rgba(255,253,250,.93)` | **Vidro.** `--glass` para a cápsula e o rodapé, `--glass-strong` para o que flutua sobre o mapa, `--glass-thick` para a tab bar (por baixo dela passa texto a rolar). |
| `--glass-blur` / `--glass-ring` / `--glass-solid` | `saturate(180%) blur(18px)` / anel interior branco / `#FFFDFB` | O blur, a aresta de vidro e o **plano B opaco** obrigatório. |
| `--grad-dark` | gradiente `#005F73 → #00323F` | **Blocos de destaque** (banners/CTAs finais) com texto branco. |
| `--grad-ambient` | três radiais (teal, sol, azul) | A aguarela por baixo do vidro, só no hero da entrada. |
| `--text` | `#06272F` | Títulos e texto principal (15,6:1 sobre a tela). |
| `--text-secondary` | `#3E6A72` | Parágrafos de apoio (5,7:1). |
| `--text-muted` | `#55767D` | Legendas, contadores e metadados (4,7:1). |
| `--border` / `--border-strong` | `rgba(6,39,47,.08)` / `.15` | Hairlines. Só onde a sombra não chega (divisórias internas, contorno de checkbox). |
| `--blue` / `--sky` | `#1078a0` | Apenas funcional: links utilitários e "a tua posição" no mapa (AA sobre branco). |
| `--success` / `--warning` / `--error` | `#15803d` / `#b45309` / `#b91c1c` | Apenas estados funcionais (validação, avisos), com fundos rgba translúcidos; todos AA sobre branco. |

**Regra de ouro:** Sky Blue = "a ação desta página" (um botão cheio por ecrã) e
tudo o que é texto pequeno colorido; Teal Ocean = seleção e estados ativos,
como tinte ou superfície, **nunca com texto branco por cima**; Summer Sun =
"há vendedores ativos agora", sempre como fundo com tinta escura; coral =
"faz isto agora" (um só visível de cada vez); verde floresta = "há aqui um
vendedor". Dentro de um bloco Sky Blue o botão inverte para **pílula branca
com texto Sky Blue**. A cápsula e a tab bar são vidro; a cápsula só fica com
o vidro mais denso depois de rolar.

## 2. Tipografia

**A letra é a do sistema**: SF Pro no iPhone e no Mac (`-apple-system`), com a
**Inter** variável (100–900, self-hosted em `/fonts`) a servir de recurso em
Android, Windows e Linux. É a mesma forma em todo o lado e não custa um
round-trip a um CDN de fontes.

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
hover; o item ativo é uma pastilha de tinte teal com texto Sky Blue (não um
sublinhado, e não teal cheio: a 14px isso reprovaria AA). Rótulos da tab bar:
0.6875rem, peso 600.

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
| Timeline numerada | `.info-timeline` (números em círculos Sky Blue) | `InfoPage.css` |
| Banner de destaque | `.info-banner` (`--grad-dark`) + `.info-banner-btn` | `InfoPage.css` |
| Inputs | `.contacto-input/-label/-error` — fundo `--surface-alt`, foco com contorno Sky Blue | `Contacto.css` |
| Cápsula de navegação | `.navbar` (+ `.navbar--scrolled`) · `.nav-link` · `.nav-cta-map` | `index.css` / `Landing.css` |
| Tab bar (telemóvel) | `.tabbar` + `.tab-link` / `.tab-link-pill` / `.tab-link-label` | `index.css` |

Sem imagens decorativas: os heroes das páginas internas são painéis brancos
apenas com texto e badges; o único `<img>` do layout é o logótipo da navbar
(fotos de perfil/produtos dos vendedores são conteúdo, não decoração).

## 5. Acessibilidade

- Foco visível: `outline: 2px solid var(--focus-ring)` (teal escuro `#1078a0`,
  +2px offset) em todos os elementos interativos.
- Alvos de toque ≥48×48px em mobile (≥44px é o mínimo legal, não o alvo).
- Contraste: o site é usado num telemóvel ao sol, onde o mínimo AA não chega.
  `--text` (15,6:1), `--text-secondary` (5,7:1) e `--text-muted` (4,7:1)
  garantem AA sobre a tela; o Sky Blue `--accent` (#005F73) dá **7,28:1** com
  texto branco, o verde floresta **7,94:1** e o coral **5,58:1**.
  **O Teal Ocean (#0A9396) dá 3,7:1**: serve para superfícies, ícones e texto
  grande, nunca para corpo — como texto usa-se `--teal-text`. **O Summer Sun
  (#EE9B00) dá 2,26:1**: é sempre fundo, com `--gold-ink` por cima. Não usar
  cinzentos mais claros do que `--text-muted` para texto informativo, nem
  texto Sky Blue dentro de blocos Sky Blue (usar `--on-accent`).
- Cores dos pins do mapa: a lista fechada em `PinColorPicker.jsx` é a única
  fonte válida. Todas dão ≥6:1 contra os tiles do mapa — o fundo real contra o
  qual um pin é lido. Não adicionar cores sem verificar isso, e note-se que a
  mudança de paleta **não** lhes tocou: são a identidade de vendedores que já
  escolheram a sua cor.
- Alvos de toque no mapa: ≥48px; o botão de localização é de 64px por ser a
  única ação da página e ter de ser acertado com o polegar, de pé, com uma mão.
- Ícones sem texto visível têm sempre `aria-label`; decorativos usam
  `aria-hidden="true"`.
- `color-scheme: light` ativo — controlos nativos (selects, scrollbars)
  rendem em modo claro.
- `prefers-reduced-motion`: todas as animações e transições são reduzidas a
  ~0ms (ver `index.css`); o spinner do botão de localização abranda em vez de
  desaparecer.

## 6. A app do vendedor

A app (`mobile/`) segue **esta direção** — a mesma paleta de verão, o mesmo
vidro e a mesma tela de areia — mas **mantém a navegação que já tinha**: os
quatro separadores de `components/TabBar.jsx` (Mapa, Produtos, Trajetos,
Conta), a mesma estrutura e o mesmo comportamento. Só o material da barra
mudou, de branco sólido para vidro.

Duas coisas continuam diferentes de propósito:

- **A letra.** A app usa Manrope; o site usa a do sistema. São produtos
  diferentes, com públicos diferentes, e trocar a Manrope obrigaria a rever
  dez ecrãs de vendedor que não estão nesta alteração.
- **As cores dos pins** (`components/PinColorPicker.jsx`) — ver secção 5.

O ecrã do mapa (`mobile/src/pages/MapTab.jsx` + `mobile/src/styles/MapTab.css`)
é o caso especial: é o mesmo mapa que os banhistas veem no site, por isso fala
a mesma língua visual — pastilhas de vidro com `--site-shadow-float` e
`--site-radius-panel` sobre o mapa, letra do sistema, uma única ação âncora
(`--site-ink`, ou `--site-coral` quando é urgente parar a partilha), dourado
só como fundo de informação e o pin do vendedor desenhado como o marcador de
posição do site (círculo na cor do perfil, anel branco de 3px, seta de direção
e halo a pulsar enquanto emite).

Os tokens do site são **reproduzidos** lá com o prefixo `--site-` (a app não
importa o CSS do site), por isso uma mudança de paleta aqui tem de ser copiada
para `mobile/src/styles/MapTab.css`. Os tokens gerais da app vivem em
`mobile/src/index.css`.
