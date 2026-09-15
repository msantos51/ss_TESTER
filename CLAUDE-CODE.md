# Instruções para o Claude Code — aplicar o novo logótipo

Cola isto no Claude Code, com a pasta `drop-in/` acessível (por omissão, assume-se que está em
`~/Downloads/drop-in/` — ajusta o caminho se a colocaste noutro sítio).

---

## Tarefa

Substituir os ficheiros de ícone/logótipo do repo `msantos51/ss_TESTER` pelos novos, e atualizar as
referências no HTML. Os ficheiros novos estão em `<CAMINHO>/drop-in/` numa árvore que espelha a do
repo, por isso os caminhos de destino são os mesmos que os de origem.

**Não alteres nenhuma cor, token CSS, `theme-color`, componente ou lógica.** A paleta já está
correta (`--brand-blue: #2f8ee0`, `--brand-yellow: #ffa723` em `mobile/src/index.css` e
`sunny_sales_web/src/index.css`). Esta tarefa é só ficheiros de imagem e as tags que os referenciam.

## Passo 1 — Site (`sunny_sales_web/public/`)

Copia, substituindo:

| Origem | Destino |
|---|---|
| `drop-in/sunny_sales_web/public/logosite.png` | `sunny_sales_web/public/logosite.png` |
| `drop-in/sunny_sales_web/public/logosite-nav.png` | `sunny_sales_web/public/logosite-nav.png` |
| `drop-in/sunny_sales_web/public/favicon.svg` | `sunny_sales_web/public/favicon.svg` (novo) |
| `drop-in/sunny_sales_web/public/og-image.png` | `sunny_sales_web/public/og-image.png` (novo) |

Em `sunny_sales_web/index.html`, no `<head>`:

1. Acrescenta o favicon SVG **antes** da tag `<link rel="icon">` de PNG que já existe:
   ```html
   <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
   ```
2. Aponta o `og:image` para a nova imagem e declara as dimensões (a atual aponta para o
   `logosite.png`, que é quadrado e fica mal cortado nas partilhas):
   ```html
   <meta property="og:image" content="/og-image.png" />
   <meta property="og:image:width" content="1200" />
   <meta property="og:image:height" content="630" />
   ```
   Se já existirem `og:image:width` / `og:image:height`, atualiza-os em vez de duplicar.
3. Se houver `<meta name="twitter:card" content="summary">`, muda para `summary_large_image`. Se
   houver `twitter:image` a apontar para o `logosite.png`, aponta-o a `/og-image.png`.

Não toques nas tags `apple-touch-icon` nem `theme-color` — o ficheiro que o apple-touch usa
(`logosite.png`) já foi substituído e o `#EDF5FA` é o `--canvas` do site, que está correto.

## Passo 2 — App Capacitor (`mobile/public/`)

| Origem | Destino |
|---|---|
| `drop-in/mobile/public/logo-icon.png` | `mobile/public/logo-icon.png` |
| `drop-in/mobile/public/favicon.svg` | `mobile/public/favicon.svg` (novo) |

Em `mobile/index.html`, acrescenta antes do `<link rel="icon">` de PNG existente:
```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```
Deixa o `favicon.ico` e o `theme-color: #1863A3` como estão (`#1863A3` é o `--ink` da app, é
deliberado e tem contraste 6,26:1 com branco).

## Passo 3 — Android nativo (`mobile/android/app/src/main/res/`)

Copia toda a árvore `drop-in/mobile/android/app/src/main/res/` para
`mobile/android/app/src/main/res/`, substituindo. São 17 ficheiros:

- `mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/ic_launcher_foreground.png` — 108dp por densidade
- `mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/ic_launcher.png` — 48dp, ícone legado
- `mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/ic_launcher_round.png` — 48dp, recortado em círculo
- `drawable-v24/ic_launcher_foreground.xml` — vector drawable, é o que o Android 8+ usa
- `values/ic_launcher_background.xml` — passa o fundo adaptativo a `#FFFFFF`

Não mexas em `mipmap-anydpi-v26/ic_launcher.xml` nem em `ic_launcher_round.xml` — já apontam para
`@drawable/ic_launcher_foreground` e `@color/ic_launcher_background`, que é o que queremos.

Depois:
```bash
cd mobile && npx cap sync android
```

## Passo 4 — Verificação

Antes de dar por terminado, confirma:

- [ ] `grep -rn "logosite\|logo-icon\|og:image\|favicon" sunny_sales_web/index.html mobile/index.html` —
      todas as referências apontam para ficheiros que existem.
- [ ] `git status` lista apenas ficheiros de imagem, os dois `index.html`, e os dois XML do Android.
      **Se aparecer qualquer `.css`, `.jsx` ou `.ts` modificado, reverte — não era para mexer.**
- [ ] `git diff -- '*.html'` mostra só linhas de `<link>` e `<meta>`. Nenhuma cor alterada.
- [ ] Build do site e da app passam sem erros.
- [ ] Nenhum ficheiro `.png` novo ficou fora dos caminhos listados acima.

## Contexto (não é preciso ler para executar)

`drop-in/ONDE-COLOCAR.md` tem a mesma informação em formato de tabela. A geometria exata do
logótipo, as regras de utilização e as variantes de cor acessíveis estão em
`design_handoff_sunny_sales/logo/LOGO.md`, junto dos SVG de origem.

O favicon é um desenho diferente da marca completa — dois arcos em vez de três, traço mais grosso e
sem pernas — porque a marca completa deixa de ler abaixo de 24px. Isto é intencional; não o
substituas por uma versão reduzida do `logo-mark.svg`.
