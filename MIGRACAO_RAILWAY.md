# Migração para o Railway (BD + imagens próprias)

Objetivo: correr **tudo** no Railway e reduzir dependências externas ao mínimo.

| Antes | Depois |
|-------|--------|
| Base de dados: **Neon** | **Postgres do Railway** |
| Imagens: **Cloudinary** | **Volume do Railway** (servidas em `/attached_assets/...`) |
| Email: **Resend** | **Resend** (mantido — o Railway bloqueia SMTP, email tem de ser HTTP) |
| Pagamentos: **PaySuite** | **PaySuite** (mantido — é a gateway de mobile money) |

O código já foi alterado: driver `pg` em vez de Neon, uploads para `ASSETS_DIR`, Cloudinary removido.

---

## 1. Provisionar o Postgres no Railway

1. No projeto do Railway → **New** → **Database** → **Add PostgreSQL**.
2. Abre o serviço Postgres → separador **Variables** → copia o **`DATABASE_URL`**.
   - Usa de preferência o URL **privado** (`...railway.internal`) para o serviço da app
     (mais rápido e sem SSL). Para ligares a partir do teu PC usa o URL **público**
     (tem `?sslmode=require` ou usa a porta do proxy).

## 2. Variáveis de ambiente do serviço da app

No serviço da **app** (não no Postgres) → **Variables**, define:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}   # referencia o serviço Postgres do Railway
ASSETS_DIR=/data                          # pasta do Volume (passo 3)
SESSION_SECRET=<uma_string_longa_aleatoria>
RESEND_API_KEY=<a_tua_chave_resend>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<password_forte>
ADMIN_EMAIL=<o_teu_email>
PAYSUITE_API_KEY=<a_tua_chave_paysuite>
# PORT é fornecido automaticamente pelo Railway — não definir.
```

> Já **não** é preciso `CLOUDINARY_*`.

## 3. Criar o Volume (para as imagens persistirem)

1. No serviço da app → **Settings** → **Volumes** → **New Volume**.
2. **Mount path:** `/data`
3. Confirma que `ASSETS_DIR=/data` (passo 2). É aqui que ficam as imagens carregadas
   e os comprovativos. Sem volume, os ficheiros perder-se-iam a cada redeploy.

## 4. Migrar os dados do Neon → Railway

Precisas dos dois URLs: o do Neon (atual) e o público do Railway.

```sh
# 1) Exportar do Neon
pg_dump "<URL_NEON>" --no-owner --no-privileges -Fc -f loja.dump

# 2) Importar para o Railway (URL público do Postgres)
pg_restore --no-owner --no-privileges -d "<URL_PUBLICO_RAILWAY>" loja.dump
```

Se não tiveres `pg_dump`/`pg_restore`, instala o cliente do PostgreSQL (mesma major
version da BD). Em alternativa, se a loja ainda não tem dados que valha a pena guardar,
podes saltar este passo: o servidor cria as tabelas sozinho no arranque (auto-migrations)
e o admin é criado a partir das variáveis `ADMIN_*`.

## 5. Deploy

O Railway usa o `package.json`:
- **Build:** `npm run build`
- **Start:** `npm start`

Liga o repositório `ShelvenMiambo/identical-store` (branch `main`) e faz deploy.

## 6. Migrar as imagens do Cloudinary → Volume (uma vez)

Só necessário se já tens imagens hospedadas no Cloudinary.

1. Define a variável `MIGRATE_IMAGES_ON_BOOT=1` no serviço da app.
2. Faz **Redeploy**.
3. Acompanha os **Deploy Logs** até veres `🎉 Migração de imagens concluída`.
4. **Remove** a variável `MIGRATE_IMAGES_ON_BOOT` (para não correr a cada arranque).

A rotina baixa cada imagem do Cloudinary para o Volume e reescreve os URLs na BD.
É idempotente — se algo falhar a meio, basta correr outra vez.

## 7. Verificar

- [ ] Login do admin funciona (`/auth`)
- [ ] Produtos e imagens aparecem (URLs `/attached_assets/...`)
- [ ] Criar/editar produto com upload de imagem → imagem fica visível após redeploy
- [ ] Checkout + envio de comprovativo
- [ ] Email de recuperação de password chega (Resend)
- [ ] Pagamento PaySuite (se aplicável)

## Depois de confirmar

- Podes desligar/apagar a base de dados do **Neon** e a conta do **Cloudinary**.
- Mantêm-se externos apenas: **Resend** (email) e **PaySuite** (pagamentos).
