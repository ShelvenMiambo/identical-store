/**
 * migrate-images.ts — Migração única das imagens do Cloudinary para o Volume do Railway.
 *
 * Porquê arranque: os ficheiros têm de ser escritos DENTRO do container do Railway,
 * onde o Volume (ASSETS_DIR) está montado. Por isso esta rotina corre no boot do
 * servidor, mas só quando a variável MIGRATE_IMAGES_ON_BOOT está definida.
 *
 * Como usar (uma vez):
 *   1. No Railway, define MIGRATE_IMAGES_ON_BOOT=1 e faz redeploy.
 *   2. Vê os logs até apareceer "🎉 Migração de imagens concluída".
 *   3. Remove a variável MIGRATE_IMAGES_ON_BOOT (para não correr a cada arranque).
 *
 * É idempotente: URLs que já não são do Cloudinary são ignorados, por isso correr
 * novamente não faz mal e retoma de onde parou.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pool } from "./db";
import { ASSETS_DIR, ASSETS_URL_PREFIX } from "./paths";

const CLOUDINARY_RE = /https?:\/\/res\.cloudinary\.com\/[^\s"'\\)]+/g;

// Cache: URL do Cloudinary -> novo URL local (/attached_assets/...)
const downloaded = new Map<string, string>();

function extFromContentType(ct: string | null, url: string): string {
    if (ct) {
        if (ct.includes("jpeg") || ct.includes("jpg")) return ".jpg";
        if (ct.includes("png")) return ".png";
        if (ct.includes("webp")) return ".webp";
        if (ct.includes("gif")) return ".gif";
        if (ct.includes("avif")) return ".avif";
        if (ct.includes("pdf")) return ".pdf";
        if (ct.includes("svg")) return ".svg";
    }
    const m = url.match(/\.([a-zA-Z0-9]{2,5})(?:$|\?)/);
    return m ? "." + m[1].toLowerCase() : ".jpg";
}

/** Descarrega um URL do Cloudinary para o Volume e devolve o novo URL local. */
async function downloadOne(url: string): Promise<string> {
    const cached = downloaded.get(url);
    if (cached) return cached;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} ao baixar ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());

    const ext = extFromContentType(res.headers.get("content-type"), url);
    const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 12);
    const name = `migrated_${hash}${ext}`;

    if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
    fs.writeFileSync(path.join(ASSETS_DIR, name), buf);

    const newUrl = `${ASSETS_URL_PREFIX}/${name}`;
    downloaded.set(url, newUrl);
    console.log(`  ⬇️  ${url}\n      -> ${newUrl}`);
    return newUrl;
}

/** Substitui todos os URLs do Cloudinary num texto (JSON ou simples) pelos locais. */
async function rewriteText(value: string): Promise<{ changed: boolean; value: string }> {
    const matches = value.match(CLOUDINARY_RE);
    if (!matches) return { changed: false, value };
    let out = value;
    for (const url of Array.from(new Set(matches))) {
        const local = await downloadOne(url);
        out = out.split(url).join(local);
    }
    return { changed: out !== value, value: out };
}

export async function migrateImages(): Promise<void> {
    console.log("🖼️  A migrar imagens do Cloudinary para o Volume (ASSETS_DIR =", ASSETS_DIR, ")");
    let count = 0;

    // products.imagens (text[])
    {
        const { rows } = await pool.query<{ id: string; imagens: string[] }>(
            `SELECT id, imagens FROM products WHERE array_to_string(imagens, ',') LIKE '%res.cloudinary.com%'`,
        );
        for (const row of rows) {
            const novos: string[] = [];
            let changed = false;
            for (const u of row.imagens || []) {
                if (u && CLOUDINARY_RE.test(u)) { CLOUDINARY_RE.lastIndex = 0; const n = await downloadOne(u); novos.push(n); changed = true; }
                else novos.push(u);
            }
            if (changed) { await pool.query(`UPDATE products SET imagens=$1 WHERE id=$2`, [novos, row.id]); count++; }
        }
    }

    // collections.imagem (text)
    {
        const { rows } = await pool.query<{ id: string; imagem: string }>(
            `SELECT id, imagem FROM collections WHERE imagem LIKE '%res.cloudinary.com%'`,
        );
        for (const row of rows) {
            const local = await downloadOne(row.imagem);
            await pool.query(`UPDATE collections SET imagem=$1 WHERE id=$2`, [local, row.id]);
            count++;
        }
    }

    // orders.comprovante_url (text)
    {
        const { rows } = await pool.query<{ id: string; comprovante_url: string }>(
            `SELECT id, comprovante_url FROM orders WHERE comprovante_url LIKE '%res.cloudinary.com%'`,
        );
        for (const row of rows) {
            const local = await downloadOne(row.comprovante_url);
            await pool.query(`UPDATE orders SET comprovante_url=$1 WHERE id=$2`, [local, row.id]);
            count++;
        }
    }

    // order_items.imagem_produto (text)
    {
        const { rows } = await pool.query<{ id: string; imagem_produto: string }>(
            `SELECT id, imagem_produto FROM order_items WHERE imagem_produto LIKE '%res.cloudinary.com%'`,
        );
        for (const row of rows) {
            const local = await downloadOne(row.imagem_produto);
            await pool.query(`UPDATE order_items SET imagem_produto=$1 WHERE id=$2`, [local, row.id]);
            count++;
        }
    }

    // order_history.itens (jsonb) — reescrever no texto JSON
    {
        const { rows } = await pool.query<{ id: string; itens: any }>(
            `SELECT id, itens FROM order_history WHERE itens::text LIKE '%res.cloudinary.com%'`,
        );
        for (const row of rows) {
            const { changed, value } = await rewriteText(JSON.stringify(row.itens));
            if (changed) { await pool.query(`UPDATE order_history SET itens=$1::jsonb WHERE id=$2`, [value, row.id]); count++; }
        }
    }

    // site_settings.banners (text[]) + highlights (jsonb)
    {
        const { rows } = await pool.query<{ id: number; banners: string[]; highlights: any }>(
            `SELECT id, banners, highlights FROM site_settings`,
        );
        for (const row of rows) {
            // banners
            const novos: string[] = [];
            let bannersChanged = false;
            for (const u of row.banners || []) {
                if (u && u.includes("res.cloudinary.com")) { novos.push(await downloadOne(u)); bannersChanged = true; }
                else novos.push(u);
            }
            if (bannersChanged) { await pool.query(`UPDATE site_settings SET banners=$1 WHERE id=$2`, [novos, row.id]); count++; }

            // highlights
            const h = await rewriteText(JSON.stringify(row.highlights ?? []));
            if (h.changed) { await pool.query(`UPDATE site_settings SET highlights=$1::jsonb WHERE id=$2`, [h.value, row.id]); count++; }
        }
    }

    console.log(`🎉 Migração de imagens concluída. ${downloaded.size} ficheiro(s) baixado(s), ${count} registo(s) atualizado(s).`);
}
