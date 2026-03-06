/**
 * media.ts — Helper para gerir ficheiros no Cloudinary e local (attached_assets/)
 *
 * Usado para apagar imagens órfãs quando:
 *  - Um produto é eliminado ou as suas imagens são substituídas
 *  - Uma coleção é eliminada ou a sua capa é substituída
 *  - Um slide do slideshow é removido
 *  - Um comprovativo de pagamento é confirmado
 */

import fs from "fs";
import path from "path";

/**
 * Extrai o public_id de uma URL do Cloudinary.
 * Exemplo de URL: https://res.cloudinary.com/drn08btzl/image/upload/v1234567890/identical/foto.jpg
 * Resultado:      identical/foto
 */
function extractCloudinaryPublicId(url: string): string | null {
    try {
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

/**
 * Apaga uma lista de URLs de imagens, seja do Cloudinary ou do armazenamento local.
 * - URLs do Cloudinary (res.cloudinary.com): apagadas via API
 * - URLs locais (/attached_assets/...): apagadas do sistema de ficheiros
 * - Outros URLs externos: ignorados (não foram carregados por nós)
 *
 * Nunca lança erro — falhas são registadas mas não param o fluxo principal.
 */
export async function deleteImages(urls: string[]): Promise<void> {
    if (!urls || urls.length === 0) return;

    const cloudinaryUrls = urls.filter((u) => u && u.includes("res.cloudinary.com"));
    const localUrls = urls.filter((u) => u && u.startsWith("/attached_assets/"));

    // ── Apagar do Cloudinary ──
    if (cloudinaryUrls.length > 0 && process.env.CLOUDINARY_CLOUD_NAME) {
        try {
            const { v2: cloudinary } = await import("cloudinary");
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            });

            for (const url of cloudinaryUrls) {
                const publicId = extractCloudinaryPublicId(url);
                if (!publicId) {
                    console.warn(`⚠️ [Media] Não foi possível extrair public_id de: ${url}`);
                    continue;
                }
                try {
                    await cloudinary.uploader.destroy(publicId);
                    console.log(`🗑️ [Cloudinary] Apagado: ${publicId}`);
                } catch (err: any) {
                    console.error(`⚠️ [Cloudinary] Erro ao apagar ${publicId}:`, err.message);
                }
            }
        } catch (err: any) {
            console.error("⚠️ [Cloudinary] Erro ao inicializar:", err.message);
        }
    }

    // ── Apagar localmente ──
    for (const url of localUrls) {
        try {
            const filePath = path.join(process.cwd(), url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ [Local] Apagado: ${url}`);
            }
        } catch (err: any) {
            console.error(`⚠️ [Local] Erro ao apagar ${url}:`, err.message);
        }
    }
}

/**
 * Determina qual a pasta do Cloudinary baseada no tipo de upload.
 * Mantém os ficheiros organizados e facilita limpezas manuais.
 */
export function getCloudinaryFolder(type: "produto" | "colecao" | "slideshow" | "comprovativo"): string {
    const folders: Record<string, string> = {
        produto: "identical/produtos",
        colecao: "identical/colecoes",
        slideshow: "identical/slideshow",
        comprovativo: "identical/comprovativos",
    };
    return folders[type] ?? "identical";
}
