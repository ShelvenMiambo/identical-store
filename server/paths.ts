import path from "path";

/**
 * Pasta onde os uploads (imagens de produtos, comprovativos, etc.) são guardados.
 *
 * Em produção no Railway aponta para um **Volume persistente** através da variável
 * ASSETS_DIR (ex.: ASSETS_DIR=/data). Sem ela, usa-se a pasta local `attached_assets/`
 * (bom para desenvolvimento).
 *
 * O URL público dos ficheiros mantém-se sempre `/attached_assets/<ficheiro>`,
 * servido por express.static a partir desta pasta — ver server/index.ts.
 */
export const ASSETS_DIR =
    process.env.ASSETS_DIR || path.join(process.cwd(), "attached_assets");

/** Prefixo público pelo qual os ficheiros guardados são servidos. */
export const ASSETS_URL_PREFIX = "/attached_assets";
