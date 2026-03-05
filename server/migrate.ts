/**
 * Script de migração manual para adicionar colunas em falta
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

        // Garantir que metodo_pagamento existe (pode já existir)
        await sql`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT;
    `;
        console.log('✅ metodo_pagamento garantido na tabela orders');

        console.log('🎉 Migrations concluídas com sucesso!');
    } catch (err: any) {
        console.error('❌ Erro na migration:', err.message);
        process.exit(1);
    }
}

migrate();
