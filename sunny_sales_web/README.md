# Sunny Sales - Web

Aplicação web em React utilizando Vite.

## Âmbito do site

O site é dedicado **exclusivamente ao banhista** e tem apenas estas páginas:

- `/` — página inicial com o mapa de vendedores em tempo real
- `/sustentabilidade` — Praia Sustentável
- `/sobre-projeto` — Sobre o Projeto
- `/faqs` — perguntas frequentes dos banhistas
- `/contacto` — formulário de contacto
- páginas legais no rodapé (privacidade, termos, aviso legal, cookies)

Não existe início de sessão, criação de conta, nem qualquer área de vendedor
na web — a gestão de vendedores vive na aplicação móvel. Ao adicionar páginas
novas, mantém este âmbito.

## Desenvolvimento

```bash
npm install
npm run dev
```

Defina `VITE_BASE_URL` para apontar para o backend (por omissão `http://localhost:8000`).

### Mapas

O estilo pretendido é o **Voyager da CARTO**, que passou a exigir chave de API:
sem chave, os tiles vêm carimbados com "API KEY REQUIRED".

1. Pede uma chave gratuita em <https://carto.com/basemaps/apikey> (o plano
   gratuito cobre 5 milhões de tiles por mês).
2. Define `VITE_CARTO_API_KEY` com essa chave.

Sem a variável definida, os mapas caem automaticamente para os tiles do
OpenStreetMap, para a app nunca ficar sem mapa.

**Onde definir a variável** (o Vite injeta o valor durante o `npm run build`,
por isso tem de existir no momento da compilação):

- *Local*: copia `.env.example` para `.env.local` e preenche a chave.
- *Railway (web)*: nas variáveis do serviço — o `start.sh` corre o
  `npm run build` no deploy, por isso basta redeployar depois de a adicionar.
- *Mobile (Capacitor)*: cria `mobile/.env.local` antes de
  `npm run build && npm run cap:sync`; o valor fica embutido no bundle da app.
- *Mobile (APK do GitHub Actions)*: define o secret `CARTO_API_KEY` no
  repositório (Settings → Secrets and variables → Actions). O workflow
  `android-build.yml` passa-o ao `npm run build`; sem ele a APK sai com os
  tiles do OpenStreetMap e o mapa da app fica diferente do mapa do site.

A chave fica visível no bundle do frontend (como qualquer chave de mapas do lado
do cliente), por isso convém restringi-la por domínio no painel da CARTO, se a
opção estiver disponível.
