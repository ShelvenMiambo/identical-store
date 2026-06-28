import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from '@shared/schema';

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não está definido no .env');
}

const connectionString = process.env.DATABASE_URL;

// O Postgres interno do Railway (*.railway.internal) NÃO usa SSL.
// Ligações públicas (proxy do Railway, ou bases externas tipo Neon) usam SSL —
// ativado pelo ?sslmode=require no URL ou definindo PGSSL=true.
// Aceitamos o certificado do proxy (rejectUnauthorized: false).
const needsSsl =
    /sslmode=require/i.test(connectionString) || process.env.PGSSL === 'true';

export const pool = new Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
