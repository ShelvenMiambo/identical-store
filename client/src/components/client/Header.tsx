import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import logoMain from "@assets/Imagem WhatsApp 2025-11-10 às 18.29.32_92ebaa02_1763061428729.jpg";

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  user?: any;
}

export function Header({ cartItemCount = 0, onCartClick, user }: HeaderProps) {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Loja", href: "/loja" },
    { label: "Coleções", href: "/colecoes" },
    { label: "Sobre", href: "/sobre" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-md border-b shadow-sm" : "bg-background/80 backdrop-blur-sm"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center hover-elevate active-elevate-2 rounded-md px-2 py-1" data-testid="link-home">
              <span className="font-bold text-xl md:text-3xl tracking-tight">
                ID<span style={{fontSize: '1.2em', lineHeight: 1}}>≠</span>NTICAL
              </span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={`text-sm font-medium uppercase tracking-wider transition-colors hover-elevate px-3 py-2 rounded-md ${location === item.href ? "text-foreground" : "text-muted-foreground"
                    }`}
                  data-testid={`link-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* User Account */}
            {user ? (
              <Link href="/conta">
                <Button variant="ghost" size="icon" className="relative" data-testid="button-user-account">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="hidden md:flex" data-testid="link-auth">
                  Entrar
                </Button>
              </Link>
            )}

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onCartClick}
              data-testid="button-cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-cart-count"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-6 mt-8">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <a
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-lg font-semibold uppercase tracking-wider hover-elevate px-4 py-2 rounded-md block ${location === item.href ? "text-foreground" : "text-muted-foreground"
                          }`}
                        data-testid={`mobile-link-${item.label.toLowerCase()}`}
                      >
                        {item.label}
                      </a>
                    </Link>
                  ))}
                  {!user && (
                    <Link href="/auth">
                      <a
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-semibold uppercase tracking-wider text-primary hover-elevate px-4 py-2 rounded-md block"
                        data-testid="mobile-link-auth"
                      >
                        Entrar
                      </a>
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
