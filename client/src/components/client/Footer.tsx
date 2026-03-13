import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

/* ── Ícones SVG ──────────────────────────────────────────────────── */
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const WhatsAppIcon = ({ size = "h-5 w-5" }: { size?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={size}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.18 8.18 0 0 0 4.78 1.52V6.83a4.85 4.85 0 0 1-1.01-.14z" />
  </svg>
);

const INSTAGRAM_URL = "https://www.instagram.com/identical_oficial?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";
const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/BtwDDZiZVraC9PbzeTsfWU";
const WHATSAPP_DIRECT_URL = "https://wa.me/258848755045";
const TIKTOK_URL = "https://www.tiktok.com/@identical.oficial?_t=ZN-8uVZI4apvrq&_r=1";

export function Footer() {
  return (
    <footer className="bg-card border-t mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">

        {/* ── Linha principal: 3 colunas em desktop, empilha em mobile ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

          {/* ── Col 1: Marca + Redes Sociais ── */}
          <div className="space-y-4">
            <h3 className="font-bold text-xl tracking-tight">
              ID<span style={{ fontSize: '1.2em', lineHeight: 1 }}>≠</span>NTICAL
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Streetwear moçambicano autêntico. Valorizamos a cultura urbana, autenticidade e a influência da arte e música das ruas.
            </p>

            {/* Ícones redes sociais */}
            <div className="flex gap-3">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                className="hover-elevate p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-instagram" title="Instagram">
                <InstagramIcon />
              </a>
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer"
                className="hover-elevate p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-tiktok" title="TikTok">
                <TikTokIcon />
              </a>
              <a href={WHATSAPP_DIRECT_URL} target="_blank" rel="noopener noreferrer"
                className="hover-elevate p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-whatsapp-direct" title="WhatsApp">
                <WhatsAppIcon />
              </a>
            </div>

            {/* Grupo WhatsApp */}
            <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors border rounded-full px-3 py-1.5 hover:border-foreground/30"
              data-testid="link-whatsapp-group">
              <WhatsAppIcon size="h-4 w-4" />
              <span>Entrar no grupo WhatsApp</span>
            </a>
          </div>

          {/* ── Col 2: Links Rápidos + Legal — HORIZONTAIS lado a lado ── */}
          <div className="grid grid-cols-2 gap-6">
            {/* Links Rápidos */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm uppercase tracking-wider">Links Rápidos</h4>
              <nav className="flex flex-col gap-2.5">
                <Link href="/loja">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-loja">Loja</a>
                </Link>
                <Link href="/colecoes">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-colecoes">Coleções</a>
                </Link>
                <Link href="/localizar-pedido">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-track">🔎 Localizar Pedido</a>
                </Link>
                <Link href="/faq">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-faq">FAQ</a>
                </Link>
                <Link href="/guia-tamanhos">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-guia-tamanhos">📏 Guia de Tamanhos</a>
                </Link>
                <Link href="/contacto">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-contacto">Contacto</a>
                </Link>
              </nav>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm uppercase tracking-wider">Legal</h4>
              <nav className="flex flex-col gap-2.5">
                <Link href="/termos">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-termos">Termos e Condições</a>
                </Link>
                <Link href="/privacidade">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-privacidade">Política de Privacidade</a>
                </Link>
              </nav>
            </div>
          </div>

          {/* ── Col 3: Newsletter ── */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Newsletter</h4>
            <p className="text-sm text-muted-foreground">
              Receba novidades sobre lançamentos e ofertas exclusivas.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Seu email"
                className="flex-1"
                data-testid="input-newsletter-email"
              />
              <Button type="submit" data-testid="button-newsletter-submit">
                <Mail className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* ── Barra inferior ── */}
        <div className="mt-10 pt-6 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">

            {/* Copyright */}
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              &copy; {new Date().getFullYear()} ID<span style={{ fontSize: '1.05em', lineHeight: 1 }}>≠</span>NTICAL. Todos os direitos reservados.
            </p>

            {/* Pagamentos */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Pagamentos:</span>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span className="font-medium">M-Pesa</span>
                <span className="text-muted-foreground/50">·</span>
                <span className="font-medium">e-Mola</span>
                <span className="text-muted-foreground/50">·</span>
                <span className="font-medium">Conta Bancária</span>
              </div>
            </div>
          </div>

          {/* Crédito do criador — discreto */}
          <p className="mt-3 text-center text-[11px] text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors">
            Criado por{" "}
            <a
              href="https://shelvenmiambo-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              data-testid="link-portfolio"
            >
              Shelven Miambo
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
