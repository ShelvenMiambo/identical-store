/**
 * Script de migração manual para adicionar colunas e tabelas em falta.
 * Executar: npx tsx server/migrate.ts
 */
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log('🔄 A correr migrations...');

  try {
    // Adicionar comprovante_url à tabela orders (se não existir)
    await sql`
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS comprovante_url TEXT;
        `;
    console.log('✅ comprovante_url adicionado à tabela orders');

    // Garantir que metodo_pagamento existe
    await sql`
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT;
        `;
    console.log('✅ metodo_pagamento garantido na tabela orders');

    // Criar tabela site_settings para persistir configurações do site
    // (substitui o armazenamento em memória RAM que se perdia a cada reinício do servidor)
    await sql`
            CREATE TABLE IF NOT EXISTS site_settings (
                id            INTEGER PRIMARY KEY DEFAULT 1,
                hero_title    TEXT NOT NULL DEFAULT 'Be Different, Be Classic',
                hero_subtitle TEXT NOT NULL DEFAULT 'Streetwear moçambicano autêntico. Raízes urbanas com forte identidade local.',
                banners       TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
                highlights    JSONB NOT NULL DEFAULT '[]'::JSONB,
                updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `;
    console.log('✅ Tabela site_settings criada (ou já existia)');

    // Inserir linha padrão se não existir (id=1 é o único registo de settings)
    await sql`
            INSERT INTO site_settings (id) VALUES (1)
            ON CONFLICT (id) DO NOTHING;
        `;
    console.log('✅ Linha padrão de site_settings garantida');

    // Criar tabela order_history para histórico permanente de pedidos
    // Pedidos entregues/cancelados ficam aqui para sempre, mesmo após apagados da tabela orders
    await sql`
            CREATE TABLE IF NOT EXISTS order_history (
                id                VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
                order_id          VARCHAR NOT NULL,
                nome_cliente      TEXT NOT NULL,
                telefone_cliente  TEXT NOT NULL,
                email_cliente     TEXT,
                endereco_entrega  TEXT,
                provincia_entrega TEXT,
                metodo_pagamento  TEXT,
                subtotal          DECIMAL(10,2),
                desconto          DECIMAL(10,2) DEFAULT 0,
                total             DECIMAL(10,2) NOT NULL,
                status_final      TEXT NOT NULL,
                itens             JSONB NOT NULL DEFAULT '[]'::JSONB,
                data_pedido       TIMESTAMP NOT NULL,
                data_finalizacao  TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `;
    console.log('✅ Tabela order_history criada (ou já existia)');

    console.log('🎉 Migrations concluídas com sucesso!');
  } catch (err: any) {
    console.error('❌ Erro na migration:', err.message);
    process.exit(1);
  }
}

migrate();
