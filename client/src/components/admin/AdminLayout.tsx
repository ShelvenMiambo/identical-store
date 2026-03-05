
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Package, ShoppingBag, List, Ticket, LayoutDashboard, LogOut, User, Users, Settings, ImageIcon, BarChart3 } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  user?: any;
  onLogout?: () => void;
}

export function AdminLayout({ children, user, onLogout }: AdminLayoutProps) {
  const [location] = useLocation();

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Admin Header */}
      <header className="bg-slate-900 dark:bg-slate-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Admin Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold">IDENTICAL Admin</h1>
                <p className="text-xs text-slate-400">Painel de Administração</p>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  Ver Site
                </Button>
              </Link>

              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{user.nome}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onLogout}
                    className="text-white hover:bg-white/10"
                    title="Sair"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`gap-2 ${isActive ? 'bg-slate-900 text-white hover:bg-slate-800' : ''}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} IDENTICAL - Painel Administrativo
          </p>
        </div>
      </footer>
    </div>
  );
}
