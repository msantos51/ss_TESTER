# Sunny Sales — Design System "Vidro & Maré"

Tokens centralizados em [`src/index.css`](src/index.css) (`:root`). Este documento
descreve **como usar cada token**. Nenhuma página deve introduzir cores, tamanhos
de fonte ou sombras fora desta lista.

## 0. Conceito

O site é uma **tela branca lisa** (`--canvas`, `#ffffff`) sobre a qual
flutuam **painéis brancos arredondados** com sombra difusa e **superfícies de
vidro** com blur. A profundidade vem da sombra, não de bordas de 1px nem de um
tom de fundo diferente. São quatro camadas:

1. **A tela** — branco `#ffffff`, sem fotografias, texturas nem gradiente;
2. **Painéis brancos** de cantos grandes (`--radius-panel`, 22px) — a barra
   lateral de pesquisa, o mapa, a lista de vendedores, os cartões das páginas
   internas, os blocos das páginas legais;
3. **Vidro** (`--glass` / `--glass-strong` / `--glass-thick` + `--glass-blur`
   + `--glass-ring`) — a cápsula de navegação, a folha do menu de telemóvel,
   o rodapé e tudo o que flutua sobre o mapa;
4. **Uma ação principal azul-profundo** por ecrã (`--ink`) — "Ver o mapa agora" na
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
| Forma | **Cápsula de vidro** centrada (`--capsule-max`, 1240px) que flutua a `--gutter` do topo e encolhe ao rolar | A mesma cápsula, compacta: marca + CTA "Abrir mapa" + **botão de menu** |
| Destinos | Os quatro links dentro da cápsula + CTA "Abrir mapa" | Os mesmos quatro na **folha do menu**, com ícone, mais o Instagram |
| Item ativo | Pastilha `--accent-soft` com texto `--accent-text` | A mesma pastilha, na linha da folha |
| Menu escondido | — | **Sim:** folha de vidro por baixo da cápsula (`.nav-burger` → `MobileMenu`) |

A lista de destinos vive num sítio só — `DESTINATIONS` em
[`src/App.jsx`](src/App.jsx) — e alimenta as duas navegações. O mapa não está
lá: tem o seu próprio CTA na cápsula, visível em qualquer largura, porque é a
razão de ser do site e quem chega por QR code não o deve ir buscar dentro de
um menu. Abaixo de 360px sai o nome escrito da marca (fica o símbolo; o nome
continua no DOM, senão o link para a entrada ficava sem nome acessível).

**A folha do menu** ([`src/components/MobileMenu.jsx`](src/components/MobileMenu.jsx))
é modal, porque tapa o conteúdo: escurece o fundo, prende o `Tab` lá dentro,
fecha com `Escape`, com um toque no fundo, ao escolher um destino e ao passar
a desktop, e devolve sempre o foco ao botão que a abriu. Só é montada quando
está aberta. Não pode viver dentro da `.navbar`: o `backdrop-filter` do vidro
faz da cápsula o bloco de referência de tudo o que é `position: fixed` lá
dentro, e a folha deixaria de se posicionar em relação ao ecrã.

Em telemóvel o rodapé **deixa de ser barra fixa** e passa a fechar a página:
uma barra fixa de 58px num ecrã pequeno é cromo permanente a roubar conteúdo,
e os links do rodapé não são o que se vem cá fazer.

## 1. Paleta

A marca tem **duas cores**: **Azul `#37B4DB`** e **Amarelo `#EAC928`**. Nenhuma
das duas aguenta texto pequeno sobre branco (2,41:1 e 1,63:1), por isso a marca
vive nas **superfícies** e cada cor tem uma **variante escurecida da mesma
matiz** para quando é preciso tinta. **O papel de cada tom é decidido pelo
contraste que aguenta**, não pelo gosto — o site é usado num telemóvel ao sol.

| Token | Valor | Uso |
|---|---|---|
| `--canvas` / `--canvas-deep` | `#ffffff` / `#ECF2F4` | **Tela** de fundo de todo o site (body), branca lisa, e o seu tom mais fundo (ex.: o "404"). |
| `--surface` | `#ffffff` | **Painéis brancos** (sem borda, com `--shadow-sm`). |
| `--surface-alt` / `--surface-hover` | `#ECF2F4` / `#E0EAEE` | Preenchimento neutro de chips, segmentos, campos e botões-ícone; o segundo é o hover. Cinzentos **frios**, tirados da matiz do azul. |
| `--brand-blue` / `--blue-bright` | `#37B4DB` | **O azul da marca.** 2,41:1 com branco — só superfícies, tintes, gradientes, pins e realces sobre escuro. **Nunca texto pequeno sobre branco.** |
| `--blue-mid` / `--teal` | `#1F8BAD` | 3,92:1 — ícones, contornos e texto grande sobre a tela. |
| `--blue-text` / `--teal-text` / `--accent-text` | `#1A7693` | O azul como **texto pequeno** sobre branco (5,18:1). |
| `--accent` / `--primary` / `--ink` / `--blue-deep` | `#176882` | **A tinta das ações** — o azul da marca escurecido até dar **6,29:1** com branco. Botões, links, botão principal, texto do item ativo. |
| `--on-accent` | `#ffffff` | Texto branco sobre as superfícies `--ink`. |
| `--accent-hover` / `--ink-hover` / `--blue-deeper` | `#135468` | Hover (tom mais escuro) das superfícies `--ink` (8,41:1). |
| `--blue-darkest` / `--primary-dark` | `#0E3F4E` | Blocos escuros e o fim dos gradientes (11,4:1). |
| `--accent-soft` | `rgba(55,180,219,.12)` | Tinte do azul da marca: item de navegação ativo, item de lista ativo, chips. |
| `--gold` / `--amber` | `#EAC928` | **O amarelo da marca** — informação e "ao vivo", nunca ação. **Sempre como fundo**, com `--gold-ink` (`#2E2705`, 9,15:1) por cima. Nunca com texto branco: daria 1,63:1. |
| `--gold-strong` / `--amber-strong` | `#79660C` | A variante para usar como **texto** amarelo sobre branco (5,65:1). |
| `--coral` / `--coral-hover` | `#BB3E03` / `#9A3303` | **Só o que é acionável e urgente** (5,58:1 com branco): o botão de filtros quando há um filtro ativo. Em mais nenhum sítio. Não é cor de marca — é o sinal de urgência, e continua distinto do amarelo. |
| `--forest` | `#1D5C3A` | **Presença de vendedores** (7,94:1): cor por omissão dos pins do mapa. Não muda com a paleta — é lida contra os tiles, não contra a tela. |
| `--glass` / `--glass-strong` / `--glass-thick` | `rgba(255,255,255,.72/.82)` / `rgba(253,254,255,.93)` | **Vidro.** `--glass` para a cápsula e o rodapé, `--glass-strong` para o que flutua sobre o mapa, `--glass-thick` para a folha do menu (por baixo dela passa o conteúdo da página). |
| `--glass-blur` / `--glass-ring` / `--glass-solid` | `saturate(180%) blur(18px)` / anel interior branco / `#FDFEFF` | O blur, a aresta de vidro e o **plano B opaco** obrigatório. |
| `--grad-dark` | gradiente `#176882 → #0E3F4E` | **Blocos de destaque** (banners/CTAs finais) com texto branco. |
| `--grad-sea` / `--grad-sun` | `#37B4DB → #176882` / `#EAC928 → #C3A513` | Gradientes decorativos das duas cores da marca. |
| `--text` | `#0B313D` | Títulos e texto principal (13,8:1 sobre a tela). |
| `--text-secondary` | `#44616A` | Parágrafos de apoio (6,6:1). |
| `--text-muted` | `#547783` | Legendas, contadores e metadados (4,8:1). |
| `--border` / `--border-strong` | `rgba(11,49,61,.08)` / `.15` | Hairlines. Só onde a sombra não chega (divisórias internas, contorno de checkbox). |
| `--blue` / `--sky` / `--focus-ring` | `#1A7693` | Apenas funcional: links utilitários, "a tua posição" no mapa, o botão de localização e o anel de foco (5,18:1 sobre branco). |
| `--success` / `--warning` / `--error` | `#15803d` / `#b45309` / `#b91c1c` | Apenas estados funcionais (validação, avisos), com fundos rgba translúcidos; todos AA sobre branco. |

**Regra de ouro:** `--ink` (#176882) = "a ação desta página" (um botão cheio
por ecrã) e tudo o que é texto pequeno colorido; o **azul da marca** (#37B4DB)
= seleção e estados ativos, como tinte ou superfície, **nunca com texto branco
nem texto pequeno por cima**; o **amarelo da marca** (#EAC928) = "há vendedores
ativos agora", sempre como fundo com tinta escura; coral = "faz isto agora" (um
só visível de cada vez); verde floresta = "há aqui um vendedor". Dentro de um
bloco `--ink` o botão inverte para **pílula branca com texto `--ink`**. A cápsula e a folha do menu são vidro; a cápsula só
fica com o vidro mais denso depois de rolar.

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
hover; o item ativo é uma pastilha de tinte azul com texto `--ink` (não um
sublinhado, e não teal cheio: a 14px isso reprovaria AA). Linhas da folha do
menu: `--fs-body`, peso 500 (600 no destino atual), em alvos de 52px.

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
| Timeline numerada | `.info-timeline` (números em círculos `--ink`) | `InfoPage.css` |
| Banner de destaque | `.info-banner` (`--grad-dark`) + `.info-banner-btn` | `InfoPage.css` |
| Inputs | `.contacto-input/-label/-error` — fundo `--surface-alt`, foco com contorno `--ink` | `Contacto.css` |
| Cápsula de navegação | `.navbar` (+ `.navbar--scrolled`) · `.nav-link` · `.nav-cta-map` · `.nav-burger` | `index.css` / `Landing.css` |
| Folha do menu (telemóvel) | `.nav-menu` + `.nav-menu-backdrop` / `.nav-menu-link` / `.nav-menu-icon` / `.nav-menu-divider` | `MobileMenu.css` |

Sem imagens decorativas: os heroes das páginas internas são painéis brancos
apenas com texto e badges; o único `<img>` do layout é o logótipo da navbar
(fotos de perfil/produtos dos vendedores são conteúdo, não decoração).

## 5. Acessibilidade

- Foco visível: `outline: 2px solid var(--focus-ring)` (azul de tinta
  `#1A7693`, 5,18:1 sobre branco, +2px offset) em todos os elementos
  interativos.
- Alvos de toque ≥48×48px em mobile (≥44px é o mínimo legal, não o alvo).
- A folha do menu é um `role="dialog"` com `aria-modal`: o foco entra nela ao
  abrir, o `Tab` circula lá dentro, `Escape` fecha, o foco volta ao botão (que
  anuncia o estado em `aria-expanded`) e o `body` não rola por baixo dela.
- Contraste: o site é usado num telemóvel ao sol, onde o mínimo AA não chega.
  `--text` (13,8:1), `--text-secondary` (6,6:1) e `--text-muted` (4,8:1)
  garantem AA sobre a tela branca, em qualquer parte do site — não há
  gradiente a variar o fundo. O `--accent` (#176882) dá **6,29:1** com
  texto branco, o verde floresta **7,94:1** e o coral **5,58:1**.
  **O azul da marca (#37B4DB) dá 2,41:1** e **o amarelo da marca (#EAC928)
  dá 1,63:1**: ambos são superfície, nunca texto sobre branco. Como texto
  usam-se `--blue-text` (#1A7693, 5,18:1) e `--gold-strong` (#79660C, 5,65:1);
  para ícones e texto grande, `--blue-mid` (#1F8BAD, 3,92:1). Não usar
  cinzentos mais claros do que `--text-muted` para texto informativo, nem
  texto `--ink` dentro de blocos `--ink` (usar `--on-accent`).
- Cores dos pins do mapa: a lista fechada em `PinColorPicker.jsx` é a única
  fonte válida e acompanha a paleta — é agora verde floresta, o amarelo e o
  azul da marca, o azul-profundo, o coral e a noite. Contra os tiles do mapa
  (o fundo real contra o qual um pin é lido) o verde dá 6,7:1, a noite 13,8:1,
  o azul-profundo 5,3:1 e o coral 4,7:1; **o amarelo (1,4:1) e o azul claro
  (2,0:1) não se separam dos tiles por si** — quem os lê é o anel branco de
  2px e a sombra do pin. Não adicionar cores sem verificar isto. Os vendedores
  que já tinham uma cor guardada continuam a vê-la (e selecionada) como
  amostra extra: a cor deles é identidade, não tema.
- Alvos de toque no mapa: ≥48px; o botão de localização usa exatamente esse
  mínimo — as pontas do alvo no seu ícone são amarelas (`--gold`) sobre o
  azul funcional (`--blue`), os anéis mantêm-se brancos.
- Ícones sem texto visível têm sempre `aria-label`; decorativos usam
  `aria-hidden="true"`.
- `color-scheme: light` ativo — controlos nativos (selects, scrollbars)
  rendem em modo claro.
- `prefers-reduced-motion`: todas as animações e transições são reduzidas a
  ~0ms (ver `index.css`); o spinner do botão de localização abranda em vez de
  desaparecer.

## 6. A app do vendedor

A app (`mobile/`) segue **esta direção** — a mesma paleta (azul #37B4DB e
amarelo #EAC928), o mesmo vidro e os mesmos neutros frios — mas **mantém a
navegação que já tinha**: os
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
