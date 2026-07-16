# Relatório — Melhorias de design, acessibilidade e performance

Branch: `claude/sunny-sales-design-system-5fl9v1` · Data: 2026-07-16

Âmbito: exclusivamente design visual, responsividade, acessibilidade e
performance de frontend. **Sem alterações** a textos de conteúdo, fluxos de
autenticação, pagamentos, integrações de backend ou à lógica do mapa/Leaflet.
(No backend só foi tocado o *serving* de ficheiros estáticos — cache headers.)

## 1. Commits por tema

| Tema | Commit |
|---|---|
| Design system — tokens | `Design system: tokens centralizados (teal + amarelo + navy) e escala tipográfica` |
| Design system — componentes | `Design system: hero card único nas páginas internas e destaque do plano popular` |
| Página a página | `Página a página: dashboard, mapa, contacto e FAQs` |
| Responsividade | `Responsividade: alvos de toque 44px e correção de overflow em ecrãs estreitos` |
| Acessibilidade | `Acessibilidade: skip link, landmarks, teclado e labels em português` |
| Performance | `Performance: fonte self-hosted, imagens otimizadas, meta por rota e cache` |
| Entregáveis | `Entregáveis: robots.txt e relatório de melhorias` |

## 2. Lighthouse (antes → depois)

Medido em build de produção local (`vite preview`), Lighthouse 12.8, headless
Chromium. Valores absolutos em produção variam com a rede; o delta é o que conta.

| Métrica | Mobile antes | Mobile depois | Desktop antes | Desktop depois |
|---|---|---|---|---|
| Performance | 77 | **99** | 90 | **100** |
| Acessibilidade | 94 | **100** | 94 | **100** |
| Best practices | 96 | **100** | 96 | **100** |
| SEO | 92 | **100** | 92 | **100** |
| LCP | 4,0 s | **2,1 s** | 0,8 s | **0,5 s** |
| FCP | 1,7 s | **1,4 s** | 0,4 s | 0,4 s |
| CLS | ~0 | **0** | 0,001 | **0** |

Principais causas do ganho: logótipo da navbar passou de 443 KB para 2,4 KB
(o LCP mobile era dominado por ele), fonte Inter self-hosted (elimina 2
ligações a domínios Google no caminho crítico), e 6 MB de PNG órfãos fora do
build publicado.

## 3. Antes / depois (resumo visual)

- **Paleta**: UI quase monocromática (preto sobre branco) → paleta da marca
  documentada: **teal do logótipo** (#0e7f94) em acentos/ícones/estados
  ativos, **amarelo** (#f5b301) reservado a ações primárias, **azul-marinho**
  (#0d2b39) nos blocos escuros institucionais, cinzentos AA. Regras de uso em
  `DESIGN_SYSTEM.md`.
- **Heroes internos**: os títulos hero de Sobre o Projeto/Planos tinham CSS
  próprio clonado; agora as 6 páginas internas usam o mesmo padrão
  `.info-hero` (título 32→44 px peso 650, lead 17→20 px, chips iguais, imagem
  com o mesmo crop/overlay) — ficheiro `SobreProjeto.css` e ~600 linhas de CSS
  duplicado eliminados.
- **Planos**: cartão "Mais Popular" com borda amarela 2 px, sombra e elevação
  próprias; CTA do plano em amarelo; "≈ €/dia" mais legível.
- **Dashboard**: skeletons animados no "Resumo de hoje" e na atividade
  (antes: travessões estáticos), estado vazio ilustrado, avatar com iniciais
  (primeiro+último nome), item ativo da sidebar com barra teal.
- **Mapa**: skeleton com grelha e indicador "A carregar o mapa…" que desvanece
  quando os tiles chegam — sem "página em branco" e sem bloquear interação.
- **Contacto**: erros inline acessíveis (aria-invalid/describedby +
  role=alert), foco automático no primeiro erro, limite de 1000 caracteres com
  contador que muda para âmbar perto do limite.
- **Legais**: largura de leitura 760 px e tipografia da escala comum.
- Screenshots antes/depois de todas as rotas em mobile/desktop foram gerados
  durante o trabalho (18 + 18 imagens; não versionados no repo).

## 4. Acessibilidade

- Contraste: `--text-muted` #9ca3af (2,5:1 ✗) → #71717a (4,83:1 ✓); textos da
  secção escura reforçados; todos os pares de texto dos tokens cumprem AA.
- Foco visível consistente (`--focus-ring` teal) incluindo accordion (summary),
  tabs, lista de vendedores do mapa; skip link "Saltar para o conteúdo"
  compatível com HashRouter; landmark `main` + `nav` com aria-label.
- Teclado: accordion abre com Enter, lista de vendedores com Enter/Espaço,
  tabs com aria-pressed; ordem de foco lógica verificada.
- Ícones sem texto com aria-label (Instagram, perfil, menu, localizar, fechar,
  filtros) e botões +/- do Leaflet etiquetados em português.
- Alvos de toque ≥44×44 px em mobile (header, zoom do mapa, fechos, rodapé —
  por dimensão ou por área de toque expandida).
- Imagens informativas com alt descritivo; decorativas com alt vazio.

## 5. Performance — detalhe

- **Fonte**: Inter variável self-hosted (`/fonts`, 48+85 KB, latin/latin-ext),
  `font-display: swap`, preload do subset latin; sem pedidos a
  fonts.googleapis.com.
- **Imagens**: heroes com `srcset` 480–1400 px + `sizes` (Unsplash
  `auto=format` entrega WebP/AVIF); componente único `HeroImage`; heroes são o
  LCP das páginas internas → prioridade alta (estão no viewport inicial;
  contentor já reserva altura → CLS 0); logótipos otimizados; navbar com
  `width/height` explícitos.
- **Cache**: `/assets` (nomes com hash do Vite) → `public, max-age=31536000,
  immutable`; `index.html` → `no-cache`; restantes estáticos → 7 dias.
- **Code-splitting por rota** já existia (React.lazy + Suspense) — mantido.
- **robots.txt** adicionado (o fallback SPA devolvia HTML, invalidando-o).

## 6. HashRouter → BrowserRouter (avaliação pedida)

O backend **já suporta** BrowserRouter: o catch-all em `backend/app/main.py`
devolve `index.html` para caminhos desconhecidos. A migração não foi feita
neste conjunto de alterações porque (1) todos os links partilhados até hoje
usam `#/rota` e precisariam de redirecionamento client-side, (2) há pelo menos
um href hardcoded `#/vendor-register` e integrações que apontam para URLs com
hash, e (3) o ganho de SEO real exigiria também pre-render/SSR — os crawlers
que não executam JS continuariam a ver uma página vazia. Como alternativa foi
implementado `PageMeta` (title/description/OG por rota). Se quiserem migrar
mais tarde: trocar `HashRouter` por `BrowserRouter`, adicionar um redirect de
`location.hash` no arranque, e atualizar os href com hash — o servidor não
precisa de mudanças.

## 7. Como validar

```bash
cd sunny_sales_web
npm install
npm run build && npm run preview   # http://localhost:4173
npm run lint                       # sem erros
```

Verificações já efetuadas: build e lint limpos; sem overflow horizontal em
320/375/480/768/1024/1366 px nas 8 rotas principais; skip link e accordion
testados por teclado; títulos por rota e fonte local confirmados no preview.
