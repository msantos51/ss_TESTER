# Onde colocar cada ficheiro

Copia cada pasta para a raiz do repo `msantos51/ss_TESTER` — os caminhos aqui já são os do repo.

## Site — `sunny_sales_web/public/`
| Ficheiro | Notas |
|---|---|
| `logosite.png` | Substitui. 512×512, fundo branco opaco (o apple-touch-icon não pode ser transparente). |
| `logosite-nav.png` | Substitui. Só a marca, fundo transparente, 100×128. |
| `favicon.svg` | Novo. Versão simplificada, legível a 16px. |
| `og-image.png` | Novo. 1200×630, fundo `#0E3A47`. |

Em `sunny_sales_web/index.html`, troca as três linhas do ícone e a imagem social:
```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="icon" type="image/png" href="/logosite.png" />
<link rel="apple-touch-icon" href="/logosite.png" />
<meta property="og:image" content="/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```
O `twitter:card` pode passar a `summary_large_image` agora que a imagem é 1200×630.

## App Capacitor — `mobile/public/`
| Ficheiro | Notas |
|---|---|
| `logo-icon.png` | Substitui. 512×512, fundo branco. |
| `favicon.svg` | Novo. |

Em `mobile/index.html`, acrescenta o SVG antes do PNG:
```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="icon" type="image/png" href="/logo-icon.png" />
```
O `favicon.ico` que lá está pode ficar — o SVG e o PNG cobrem os browsers atuais.

## Android nativo — `mobile/android/app/src/main/res/`
| Ficheiro | Notas |
|---|---|
| `mipmap-*/ic_launcher_foreground.png` | Substitui nas 5 densidades. 108dp, marca a 55% (dentro do círculo de segurança). |
| `mipmap-*/ic_launcher.png` | Substitui. Ícone legado, 48dp, fundo branco. |
| `mipmap-*/ic_launcher_round.png` | Substitui. Igual, recortado em círculo. |
| `drawable-v24/ic_launcher_foreground.xml` | Substitui. Vetor — é este que o `mipmap-anydpi-v26/ic_launcher.xml` usa no Android 8+. |
| `values/ic_launcher_background.xml` | Substitui. Passa o fundo adaptativo a `#FFFFFF`. |

Depois: `cd mobile && npx cap sync android`.

## A paleta não precisa de mexer
Verificado no repo: `--brand-blue: #2f8ee0` e `--brand-yellow: #ffa723` já são as cores da marca
em `mobile/src/index.css` e `sunny_sales_web/src/index.css`. O `#1863A3` é o azul escurecido para
contraste (6,26:1 com branco) e os `#955900` / `#241500` / `#FFDBA4` são as variantes acessíveis do
amarelo. Deixa tudo como está — os `theme-color` de cada produto também, que correspondem ao fundo
respetivo (`--ink` na app, `--canvas` no site).
