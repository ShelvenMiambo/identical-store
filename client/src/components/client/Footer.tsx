import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Instagram, Facebook, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-xl tracking-tight">IDENTICAL</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Streetwear moçambicano autêntico. Valorizamos a cultura urbana, autenticidade e a influência da arte e música das ruas.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover-elevate active-elevate-2 p-2 rounded-md"
                data-testid="link-instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover-elevate active-elevate-2 p-2 rounded-md"
                data-testid="link-facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Links Rápidos</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/loja">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-loja">
                  Loja
                </a>
              </Link>
              <Link href="/colecoes">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-colecoes">
                  Coleções
                </a>
              </Link>
              <Link href="/faq">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-faq">
                  FAQ
                </a>
              </Link>
              <Link href="/contacto">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-contacto">
                  Contacto
                </a>
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Legal</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/termos">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-termos">
                  Termos e Condições
                </a>
              </Link>
              <Link href="/privacidade">
                <a className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-privacidade">
                  Política de Privacidade
                </a>
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Newsletter</h4>
            <p className="text-sm text-muted-foreground">
              Receba novidades sobre lançamentos e ofertas exclusivas.
            </p>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                // Newsletter signup logic
              }}
            >
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

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} IDENTICAL. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Pagamentos aceites:</span>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="font-medium">M-Pesa</span>
                <span className="font-medium">e-Mola</span>
                <span className="font-medium">Cartão</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
