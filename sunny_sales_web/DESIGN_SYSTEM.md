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
2. **O gradiente do site** (`--grad-site`, em `body::before`) — a **diagonal
   mar → sol**, com as quatro cores da paleta pela ordem em que se veem na
   praia: Sky Blue no vértice superior esquerdo, Teal Ocean a abrir, a tela de
   areia a atravessar o meio, a duna e o Summer Sun a fechar o canto inferior
   direito. Está **fixa ao ecrã e presente em todas as páginas**. É o que dá
   cor para o vidro filtrar — sem ela a cápsula de navegação leria como um
   retângulo branco — e é o que fecha o fundo da página. **É a única camada de
   ambiente:** o hero da entrada não tem outra por cima (ver 1.1);
3. **Painéis brancos** de cantos grandes (`--radius-panel`, 22px) — a barra
   lateral de pesquisa, o mapa, a lista de vendedores, os cartões das páginas
   internas, os blocos das páginas legais;
4. **Vidro** (`--glass` / `--glass-strong` / `--glass-thick` + `--glass-blur`
   + `--glass-ring`) — a cápsula de navegação, a folha do menu de telemóvel,
   o rodapé e tudo o que flutua sobre o mapa;
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
| `--glass` / `--glass-strong` / `--glass-thick` | `rgba(255,255,255,.72/.82)` / `rgba(255,253,250,.93)` | **Vidro.** `--glass` para a cápsula e o rodapé, `--glass-strong` para o que flutua sobre o mapa, `--glass-thick` para a folha do menu (por baixo dela passa o conteúdo da página). |
| `--glass-blur` / `--glass-ring` / `--glass-solid` | `saturate(180%) blur(18px)` / anel interior branco / `#FFFDFB` | O blur, a aresta de vidro e o **plano B opaco** obrigatório. |
| `--grad-dark` | gradiente `#005F73 → #00323F` | **Blocos de destaque** (banners/CTAs finais) com texto branco. |
| `--grad-site` | diagonal a 146° (Sky Blue → Teal Ocean → areia → duna → Summer Sun) + um foco de sol no canto | **O gradiente do site**, em `body::before`: fixo ao ecrã, em todas as páginas. Alfas de 0,06 a 0,32, travados pelo teto de contraste da secção 5. A faixa do meio (46%→58%) é areia lisa: é o descanso entre o azul e o amarelo. |
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
com texto Sky Blue**. A cápsula e a folha do menu são vidro; a cápsula só
fica com o vidro mais denso depois de rolar.

## 1.1. Tinta em cima do gradiente

O gradiente é fixo ao **ecrã**, não à página: ao rolar, qualquer linha de texto
passa por qualquer ponto dele. Não há cantos seguros, e por isso há duas regras
que andam juntas:

- **A tinta mais clara autorizada em cima do fundo é `--text-secondary`.**
  `--text-muted` só é AA sobre a tela lisa — em cima do azul cai para 3,6:1.
  Continua a ser a tinta das legendas **dentro dos painéis brancos**, que é
  onde vive quase todo o texto pequeno do site. As duas exceções que assentam
  direto no fundo — as legendas das estatísticas da entrada e a mensagem do
  rodapé — usam `--text-secondary`.
- **Os alfas de `--grad-site` têm um teto.** Estão travados onde o ponto mais
  carregado (azul a 0,17 num vértice, sol a 0,24 no oposto) ainda dá ≥4,5:1 a
  `--text-secondary`. Subir um alfa sem refazer essa conta parte o AA em todas
  as páginas ao mesmo tempo.

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
| Timeline numerada | `.info-timeline` (números em círculos Sky Blue) | `InfoPage.css` |
| Banner de destaque | `.info-banner` (`--grad-dark`) + `.info-banner-btn` | `InfoPage.css` |
| Inputs | `.contacto-input/-label/-error` — fundo `--surface-alt`, foco com contorno Sky Blue | `Contacto.css` |
| Cápsula de navegação | `.navbar` (+ `.navbar--scrolled`) · `.nav-link` · `.nav-cta-map` · `.nav-burger` | `index.css` / `Landing.css` |
| Folha do menu (telemóvel) | `.nav-menu` + `.nav-menu-backdrop` / `.nav-menu-link` / `.nav-menu-icon` / `.nav-menu-divider` | `MobileMenu.css` |

Sem imagens decorativas: os heroes das páginas internas são painéis brancos
apenas com texto e badges; o único `<img>` do layout é o logótipo da navbar
(fotos de perfil/produtos dos vendedores são conteúdo, não decoração).

## 5. Acessibilidade

- Foco visível: `outline: 2px solid var(--focus-ring)` (teal escuro `#1078a0`,
  +2px offset) em todos os elementos interativos.
- Alvos de toque ≥48×48px em mobile (≥44px é o mínimo legal, não o alvo).
- A folha do menu é um `role="dialog"` com `aria-modal`: o foco entra nela ao
  abrir, o `Tab` circula lá dentro, `Escape` fecha, o foco volta ao botão (que
  anuncia o estado em `aria-expanded`) e o `body` não rola por baixo dela.
- Contraste: o site é usado num telemóvel ao sol, onde o mínimo AA não chega.
  `--text` (15,6:1), `--text-secondary` (5,7:1) e `--text-muted` (4,7:1)
  garantem AA sobre a tela — mas sobre o **gradiente** já não: ver a regra da
  tinta em 1.1, que é a que fixa o teto dos alfas de `--grad-site`;
  o Sky Blue `--accent` (#005F73) dá **7,28:1** com
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
