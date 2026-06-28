import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createAdminRuntime } from "./create-admin-runtime";
import { storage } from "./storage";
import path from "path";
import { ASSETS_DIR, ASSETS_URL_PREFIX } from "./paths";

const app = express();

// Servir ficheiros estáticos da pasta de uploads (Volume do Railway em produção)
app.use(ASSETS_URL_PREFIX, express.static(ASSETS_DIR));

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  limit: '25mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: '25mb' }));

// Serve static files from attached_assets

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // ── Auto-migrations ao iniciar ──────────────────────────────────────────
  // Cria TODAS as tabelas base (IF NOT EXISTS) antes das migrações incrementais.
  // Isto torna o app auto-bootstrapping numa BD completamente nova (ex: Railway Postgres fresco).
  try {
    const { pool } = await import('./db');

    // ── 1. Tabelas base (schema completo) ───────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        nome TEXT NOT NULL,
        telefone TEXT,
        endereco TEXT,
        cidade TEXT,
        provincia TEXT,
        is_admin BOOLEAN NOT NULL DEFAULT false,
        reset_token TEXT,
        reset_token_expiry TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS collections (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        nome TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        descricao TEXT,
        imagem TEXT,
        ativo BOOLEAN NOT NULL DEFAULT true,
        ordem INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        nome TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        descricao TEXT,
        ativo BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        nome TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        descricao TEXT,
        preco DECIMAL(10,2) NOT NULL,
        preco_promocional DECIMAL(10,2),
        collection_id VARCHAR REFERENCES collections(id),
        category_id VARCHAR REFERENCES categories(id),
        imagens TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        tamanhos TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        cores TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        estoque INTEGER NOT NULL DEFAULT 0,
        views INTEGER NOT NULL DEFAULT 0,
        destaque BOOLEAN NOT NULL DEFAULT false,
        novo BOOLEAN NOT NULL DEFAULT false,
        ativo BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR REFERENCES users(id),
        status TEXT NOT NULL DEFAULT 'pendente',
        subtotal DECIMAL(10,2) NOT NULL,
        desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        nome_cliente TEXT NOT NULL,
        email_cliente TEXT NOT NULL,
        telefone_cliente TEXT NOT NULL,
        endereco_entrega TEXT NOT NULL,
        cidade_entrega TEXT NOT NULL,
        provincia_entrega TEXT NOT NULL,
        metodo_pagamento TEXT,
        comprovante_url TEXT,
        paysuite_transaction_id TEXT,
        paysuite_status TEXT,
        cupom_codigo TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        order_id VARCHAR NOT NULL REFERENCES orders(id),
        product_id VARCHAR NOT NULL REFERENCES products(id),
        nome_produto TEXT NOT NULL,
        preco_produto DECIMAL(10,2) NOT NULL,
        quantidade INTEGER NOT NULL,
        tamanho TEXT NOT NULL,
        cor TEXT NOT NULL,
        imagem_produto TEXT NOT NULL
      )`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        codigo TEXT NOT NULL UNIQUE,
        tipo TEXT NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        minimo_compra DECIMAL(10,2),
        usos INTEGER NOT NULL DEFAULT 0,
        limite_usos INTEGER,
        ativo BOOLEAN NOT NULL DEFAULT true,
        data_inicio TIMESTAMP NOT NULL,
        data_fim TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        hero_title TEXT NOT NULL DEFAULT 'Be Different, Be Classic',
        hero_subtitle TEXT NOT NULL DEFAULT 'Streetwear moçambicano autêntico. Raízes urbanas com forte identidade local.',
        banners TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        highlights JSONB NOT NULL DEFAULT '[]'::JSONB,
        payment_contacts JSONB NOT NULL DEFAULT '{"mpesa":"","emola":"","mbim":""}'::JSONB,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`);

    await pool.query(`INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_history (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        order_id VARCHAR NOT NULL,
        nome_cliente TEXT NOT NULL,
        telefone_cliente TEXT NOT NULL,
        email_cliente TEXT,
        endereco_entrega TEXT,
        provincia_entrega TEXT,
        metodo_pagamento TEXT,
        subtotal DECIMAL(10,2),
        desconto DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        status_final TEXT NOT NULL,
        itens JSONB NOT NULL DEFAULT '[]'::JSONB,
        data_pedido TIMESTAMP NOT NULL,
        data_finalizacao TIMESTAMP NOT NULL DEFAULT NOW()
      )`);

    // ── 2. Migrações incrementais (colunas adicionadas posteriormente) ───
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS comprovante_url TEXT`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT`);
    await pool.query(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS payment_contacts JSONB NOT NULL DEFAULT '{"mpesa":"","emola":"","mbim":""}'::JSONB`);
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS preco_promocional DECIMAL(10,2)`);

    log('✅ Migrations automáticas concluídas');
  } catch (err: any) {
    // Ignorar erros de coluna já existente (código 42701)
    if (!err.message?.includes('already exists')) {
      log(`⚠️ Erro em migration: ${err.message}`);
    } else {
      log('✅ Migrations: colunas já existiam');
    }
  }
  // ────────────────────────────────────────────────────────────────────────

  const server = await registerRoutes(app);

  // Criar usuário admin automaticamente
  await createAdminRuntime(storage);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error("[Express Error Handler]:", err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);

    // Migração única das imagens Cloudinary -> Volume (só corre se a flag estiver definida).
    // Não bloqueia o arranque; ver server/migrate-images.ts para instruções.
    if (process.env.MIGRATE_IMAGES_ON_BOOT) {
      import('./migrate-images')
        .then(({ migrateImages }) => migrateImages())
        .catch((err) => log(`⚠️ Migração de imagens falhou: ${err.message}`));
    }
  });
})();
