# Tarefas — Migrar a loja "identical-store" para o Railway

## Contexto (lê primeiro)
App full-stack: React+Vite (`client/`) + Express (`server/`) + Postgres (Drizzle ORM).
Repo: `github.com/ShelvenMiambo/identical-store`, branch `main`. Hospedada no **Railway**.
Pasta de trabalho: `C:/Users/User/Music/identical-store-main` (repo git próprio, branch `main`).

**Objetivo:** correr tudo no Railway e reduzir dependências externas.
- Base de dados: Neon → **Postgres do Railway**
- Imagens: Cloudinary → **Volume do Railway** (servidas em `/attached_assets/...`)
- **Manter** Resend (email — o Railway bloqueia SMTP) e PaySuite (pagamentos).
- Os dados atuais são de teste → **não** é preciso migrar dados nem imagens antigas.

As alterações de código JÁ FORAM FEITAS. As tarefas A são só para **verificar** que estão
aplicadas; as tarefas B, C e D é que faltam mesmo.

---

## A. Verificar alterações de código (já feitas)
- [ ] `server/db.ts` usa `drizzle-orm/node-postgres` + `pg` (Pool), exporta `pool` e `db`. NÃO importa `@neondatabase/serverless`.
- [ ] `server/migrate.ts` usa `pool.query(...)` (não `neon`).
- [ ] `server/index.ts`: auto-migrations usam `pool.query`; static serve usa `ASSETS_DIR`; tem bloco de migração de imagens atrás de `MIGRATE_IMAGES_ON_BOOT`.
- [ ] `server/paths.ts` existe e exporta `ASSETS_DIR` (= `process.env.ASSETS_DIR || attached_assets`) e `ASSETS_URL_PREFIX` (`/attached_assets`).
- [ ] `server/media.ts` só apaga ficheiros locais (sem Cloudinary).
- [ ] `server/routes.ts`: endpoints `/api/admin/upload-base64` e `/api/upload/comprovativo` guardam em `ASSETS_DIR` (sem Cloudinary).
- [ ] `server/storage-pg.ts`: o `connect-pg-simple` usa o `pool` partilhado.
- [ ] `package.json`: SEM `cloudinary` e SEM `@neondatabase/serverless`; COM `pg` e `@types/pg`.
- [ ] Correr `npm install` e depois `npm run build` → deve terminar sem erros.
      (Nota: `npx tsc` mostra 7 erros PRÉ-EXISTENTES em `storage.ts`/`routes.ts` que NÃO afetam o build do Railway. Ignorar.)

## B. Configurar o Railway (dashboard)
- [ ] No projeto Railway: **New → Database → Add PostgreSQL**.
- [ ] No serviço da app: **Settings → Volumes → New Volume**, mount path `/data`.
- [ ] No serviço da app → **Variables**, definir:
  - [ ] `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
  - [ ] `ASSETS_DIR` = `/data`
  - [ ] `SESSION_SECRET` = (string longa aleatória)
  - [ ] `RESEND_API_KEY` = (chave Resend existente)
  - [ ] `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL`
  - [ ] `PAYSUITE_API_KEY`
  - [ ] **Apagar** todas as `CLOUDINARY_*` e o `DATABASE_URL` antigo do Neon.
  - [ ] NÃO definir `PORT` (o Railway fornece).

## C. Deploy
- [ ] Commit das alterações: `git add -A && git commit -m "feat: migrar BD e imagens para o Railway (remove Neon e Cloudinary)"`
- [ ] Push: `git push origin main`
- [ ] O Railway faz redeploy automático. Confirmar nos **Deploy Logs**:
  - [ ] `✅ Migrations automáticas concluídas`
  - [ ] `Admin user created successfully!` (ou "Admin user already exists")
  - [ ] `serving on port ...`

## D. Verificar no site
- [ ] Login do admin em `/auth` com as credenciais `ADMIN_*`.
- [ ] Criar um produto com upload de imagem → a imagem aparece (URL `/attached_assets/...`).
- [ ] Fazer **Redeploy** e confirmar que a imagem criada CONTINUA visível (prova que o Volume persiste).
- [ ] Checkout + envio de comprovativo funciona.
- [ ] Email de recuperação de password chega (testa em `/auth` → esqueci a password).

## E. (Opcional) Bug pré-existente do email
No webhook do PaySuite (`server/routes.ts`, ~linha 414) é chamada `enviarEmailPagamentoConfirmado`,
que NÃO existe em `server/email.ts` (está dentro de try/catch, por isso só falha o email,
não o pedido).
- [ ] Criar a função `enviarEmailPagamentoConfirmado(order)` em `server/email.ts`
      (semelhante a `enviarEmailConfirmacaoPedido`, mas com texto de "pagamento confirmado").

## Depois de tudo confirmado
- [ ] Apagar/desligar a base de dados do **Neon** e a conta do **Cloudinary** (já não são usadas).
