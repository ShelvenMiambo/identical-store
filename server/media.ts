/**
 * media.ts — Helper para apagar ficheiros guardados localmente (Volume do Railway).
 *
 * Usado para apagar imagens órfãs quando:
 *  - Um produto é eliminado ou as suas imagens são substituídas
 *  - Uma coleção é eliminada ou a sua capa é substituída
 *  - Um slide do slideshow é removido
 *  - Um comprovativo de pagamento é confirmado
 *
 * As imagens vivem no Volume do Railway (ASSETS_DIR) e são servidas em
 * /attached_assets/<ficheiro>. URLs externos (ex.: Cloudinary legado que ainda
 * não foi migrado) são ignorados — não podemos apagá-los e não nos pertencem.
 */

import fs from "fs";
import path from "path";
import { ASSETS_DIR, ASSETS_URL_PREFIX } from "./paths";

/**
 * Apaga uma lista de URLs de imagens guardadas localmente.
 * - URLs locais (/attached_assets/...): apagadas do Volume/sistema de ficheiros
 * - Qualquer outro URL externo (http(s)://...): ignorado
 *
 * Nunca lança erro — falhas são registadas mas não param o fluxo principal.
 */
export async function deleteImages(urls: string[]): Promise<void> {
    if (!urls || urls.length === 0) return;

    const localUrls = urls.filter(
        (u) => u && u.startsWith(ASSETS_URL_PREFIX + "/"),
    );

    for (const url of localUrls) {
        try {
            // /attached_assets/foo.jpg -> <ASSETS_DIR>/foo.jpg
            const name = url.slice(ASSETS_URL_PREFIX.length + 1);
            const filePath = path.join(ASSETS_DIR, name);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ [Media] Apagado: ${url}`);
            }
        } catch (err: any) {
            console.error(`⚠️ [Media] Erro ao apagar ${url}:`, err.message);
        }
    }
}
