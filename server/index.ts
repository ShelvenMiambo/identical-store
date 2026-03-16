import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createAdminRuntime } from "./create-admin-runtime";
import { storage } from "./storage";
import path from "path";

const app = express();

// Servir arquivos estáticos da pasta attached_assets
app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));

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
  // Garante que todas as colunas/tabelas estão criadas na BD antes de abrir o servidor.
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL!);

    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS comprovante_url TEXT`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT`;
    await sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        hero_title TEXT NOT NULL DEFAULT 'Be Different, Be Classic',
        hero_subtitle TEXT NOT NULL DEFAULT 'Streetwear moçambicano autêntico. Raízes urbanas com forte identidade local.',
        banners TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        highlights JSONB NOT NULL DEFAULT '[]'::JSONB,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`;
    await sql`INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`;
    await sql`
      CREATE TABLE IF NOT EXISTS order_history (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        order_id VARCHAR NOT NULL, nome_cliente TEXT NOT NULL,
        telefone_cliente TEXT NOT NULL, email_cliente TEXT,
        endereco_entrega TEXT, provincia_entrega TEXT, metodo_pagamento TEXT,
        subtotal DECIMAL(10,2), desconto DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL, status_final TEXT NOT NULL,
        itens JSONB NOT NULL DEFAULT '[]'::JSONB,
        data_pedido TIMESTAMP NOT NULL, data_finalizacao TIMESTAMP NOT NULL DEFAULT NOW()
      )`;
    await sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS payment_contacts JSONB NOT NULL DEFAULT '{"mpesa":"","emola":"","mbim":""}'::JSONB`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS preco_promocional DECIMAL(10,2)`;

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
  });
})();
