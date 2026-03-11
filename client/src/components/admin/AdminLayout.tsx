import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Package, ShoppingBag, List, Ticket, LayoutDashboard,
  LogOut, Users, Settings, BarChart3, Menu, X, ChevronRight
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
  user?: any;
  onLogout?: () => void;
}

export function AdminLayout({ children, user, onLogout }: AdminLayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingBag },
    { label: "Produtos", href: "/admin/produtos", icon: Package },
    { label: "Categorias", href: "/admin/categorias", icon: List },
    { label: "Coleções", href: "/admin/colecoes", icon: List },
    { label: "Utilizadores", href: "/admin/utilizadores", icon: Users },
    { label: "Configurações", href: "/admin/configuracoes", icon: Settings },
    { label: "Relatórios", href: "/admin/relatorios", icon: BarChart3 },
  ];

  const NavItem = ({ item, onClick }: { item: typeof navItems[0]; onClick?: () => void }) => {
    const isActive = location === item.href;
    const Icon = item.icon;
    return (
      <Link href={item.href} key={item.href}>
        <a
          onClick={onClick}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                        ${isActive
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span>{item.label}</span>
          {isActive && <ChevronRight className="h-3 w-3 ml-auto opacity-50" />}
        </a>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* ── Header ── */}
      <header className="bg-slate-900 dark:bg-black text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/10 p-1.5 sm:p-2 rounded-lg">
                <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold leading-none">
                  ID<span className="text-orange-400">≠</span>ntical
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 leading-none mt-0.5">Admin</p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 text-xs sm:text-sm hidden sm:flex">
                  Ver Site
                </Button>
              </Link>

              {user && (
                <div className="hidden md:flex items-center gap-2 text-right">
                  <div>
                    <p className="text-xs font-medium truncate max-w-[120px]">{user.nome}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</p>
                  </div>
                </div>
              )}

              <Button variant="ghost" size="icon" onClick={onLogout}
                className="text-white hover:bg-white/10 h-8 w-8 sm:h-9 sm:w-9" title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>

              {/* Mobile hamburger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon"
                    className="lg:hidden text-white hover:bg-white/10 h-8 w-8">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 bg-slate-900 border-slate-800 p-0">
                  <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/10 p-1.5 rounded-lg">
                        <LayoutDashboard className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-white font-bold text-sm">
                        ID<span className="text-orange-400">≠</span>ntical Admin
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}
                      className="text-slate-400 hover:text-white hover:bg-white/10 h-7 w-7">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {user && (
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-white text-sm font-medium">{user.nome}</p>
                      <p className="text-slate-400 text-xs">{user.email}</p>
                    </div>
                  )}

                  <nav className="p-3 space-y-1">
                    {navItems.map(item => (
                      <NavItem key={item.href} item={item} onClick={() => setMobileOpen(false)} />
                    ))}
                  </nav>

                  <div className="absolute bottom-4 left-0 right-0 px-4 space-y-2">
                    <Link href="/">
                      <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-300 hover:bg-white/10"
                        onClick={() => setMobileOpen(false)}>
                        Ver Site
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm" className="w-full" onClick={onLogout}>
                      <LogOut className="h-4 w-4 mr-2" /> Sair
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* ── Desktop horizontal nav ── */}
      <nav className="hidden lg:block bg-slate-800 border-b border-slate-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2 overflow-x-auto scrollbar-hide">
            {navItems.map(item => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1.5 whitespace-nowrap text-xs
                                            ${isActive
                        ? "bg-white text-slate-900 hover:bg-white/90"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="px-3 sm:px-6 lg:px-8 py-5 sm:py-8 max-w-7xl mx-auto">
        {children}
      </main>

      <footer className="bg-white dark:bg-slate-800 border-t mt-12 py-4">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ID≠ntical — Painel Administrativo
        </p>
      </footer>
    </div>
  );
}
