# ✅ Checklist de Lançamento — Sunny Sales

Guia passo a passo para publicar a aplicação com **GitHub + Railway** (backend e site)
e **GitHub Actions → Google Play** (app Android). Escrito para quem não é programador:
segue pela ordem e não precisas de mexer no código.

> 💡 Regra de ouro: **as chaves secretas vivem só no painel do Railway** (secção
> "Variables"), **nunca** dentro do código nem no GitHub.

---

## 1. Base de dados (PostgreSQL no Railway)

- [ ] No Railway: **New → Database → PostgreSQL**.
- [ ] Copiar o valor `DATABASE_URL` que o Railway gera.
- [ ] Colar esse valor nas **Variables** do serviço da app (ver secção 3).

> ⚠️ Sem isto, a app usa uma base de dados local (SQLite) que **apaga tudo a cada
> reinício**. Não serve para produção.

---

## 2. Armazenamento de ficheiros (Supabase)

As fotos (perfil, produtos, stories) e documentos **não podem** ficar no disco do
Railway, porque esse disco é temporário e apaga-se a cada atualização.

- [ ] No Supabase, ir a **Project Settings → API**.
- [ ] Copiar o **Project URL** → variável `SUPABASE_URL`.
- [ ] Copiar a **service_role key** → variável `SUPABASE_SERVICE_ROLE_KEY`.

> 🔒 A `service_role key` é MUITO sensível. Só entra nas Variables do Railway,
> nunca no código nem em mensagens.

---

## 3. Variáveis de ambiente a definir no Railway

No serviço da app, abrir **Variables** e definir:

### Obrigatórias
- [ ] `SECRET_KEY` — assina as sessões. Gerar uma com:
      `python -c "import secrets; print(secrets.token_hex(32))"`
- [ ] `ADMIN_TOKEN` — palavra-passe dos endpoints de administração. Usar um valor
      longo e aleatório (pode ser gerado da mesma forma que o `SECRET_KEY`).
- [ ] `DATABASE_URL` — da secção 1.
- [ ] `ALLOWED_ORIGINS` — o domínio do site, ex: `https://o-teu-dominio.com`
- [ ] `ALLOWED_HOSTS` — o domínio sem `https://`, ex: `o-teu-dominio.com`
- [ ] `BASE_APP_URL` — o domínio do site, ex: `https://o-teu-dominio.com`

### Email (Resend)
- [ ] `RESEND_API_KEY` — chave da conta Resend.
- [ ] `RESEND_FROM` — ex: `Sunny Sales <onboarding@resend.dev>`
- [ ] `CONTACT_EMAIL_TO` — email que recebe os contactos, ex: `sunnysales.geral@gmail.com`

### Pagamentos (Stripe)
- [ ] `STRIPE_API_KEY` — chave secreta da conta Stripe (em produção, a que começa por `sk_live_`).
- [ ] `STRIPE_WEBHOOK_SECRET` — do webhook criado no Stripe (ver secção 4).
- [ ] `SUCCESS_URL` — ex: `https://o-teu-dominio.com/dashboard`
- [ ] `CANCEL_URL` — ex: `https://o-teu-dominio.com/premium`

### Armazenamento (Supabase) — da secção 2
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

### Opcionais
- [ ] `SENTRY_DSN` — se quiseres receber relatórios de erros (deixar vazio desliga).
- [ ] `SENTRY_ENVIRONMENT` — ex: `production`
- [ ] `SENTRY_TRACES_SAMPLE_RATE` — ex: `0.0`
- [ ] `FREE_REACH_RADIUS_M` / `PREMIUM_REACH_RADIUS_M` — raios do mapa (têm valores por omissão).

---

## 4. Webhook do Stripe

O pagamento Premium precisa de avisar o backend quando é concluído.

- [ ] No Stripe: **Developers → Webhooks → Add endpoint**.
- [ ] URL do endpoint: `https://o-teu-dominio.com/stripe/webhook`
- [ ] Copiar o **Signing secret** do webhook → variável `STRIPE_WEBHOOK_SECRET`.
- [ ] Confirmar que estás a usar as chaves **live** (produção), não as de teste.

---

## 5. Ligar o GitHub ao Railway

- [ ] No Railway: **New Project → Deploy from GitHub repo → escolher `ss_tester`**.
- [ ] O Railway deteta o `Procfile` e o `requirements.txt` automaticamente.
- [ ] A partir daqui, cada envio para o GitHub publica sozinho no Railway.

> O `start.sh` compila o site e arranca o servidor. Site e API ficam na mesma
> morada, por isso não é preciso configurar domínios separados.

---

## 6. Domínio

- [ ] No Railway, secção **Settings → Networking**, gerar/associar o domínio.
- [ ] Confirmar que `ALLOWED_ORIGINS`, `ALLOWED_HOSTS`, `BASE_APP_URL`, `SUCCESS_URL`
      e `CANCEL_URL` usam esse domínio final.

---

## 7. App Android (separada do Railway)

A app móvel é compilada no GitHub, não hospedada no Railway.

- [ ] Confirmar que o segredo `CARTO_API_KEY` está definido em
      **GitHub → Settings → Secrets and variables → Actions** (usado pelo build).
- [ ] Correr o workflow `android-build.yml` para gerar o ficheiro da app.
- [ ] Submeter esse ficheiro (`.aab`) na Google Play Console.

---

## 8. Verificação final (depois do deploy)

- [ ] Abrir o site — carrega sem erros.
- [ ] `https://o-teu-dominio.com/api/status` responde OK.
- [ ] Criar uma conta de teste e confirmar que recebes o email de confirmação.
- [ ] Fazer login e editar o perfil (guarda corretamente).
- [ ] Carregar uma foto e confirmar que aparece depois de reiniciar a app
      (prova que está a usar o Supabase, não o disco temporário).
- [ ] Fazer um pagamento de teste no Stripe e confirmar que o Premium ativa.

---

## Lembretes de segurança

- 🔑 Chaves reais → só no Railway (e nos Secrets do GitHub para o Android). Nunca no código.
- ♻️ Se alguma chave for exposta por engano, gera uma nova no serviço respetivo
  (Stripe, Resend, Supabase...) para invalidar a antiga.
- 🗄️ Faz cópias de segurança da base de dados de vez em quando (o Railway permite backups).
