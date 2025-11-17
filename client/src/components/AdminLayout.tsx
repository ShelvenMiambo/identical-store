import { Link, useLocation } from "wouter";
import { Package, ShoppingBag, Ticket, List, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AdminLayoutProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

const navItems = [
  { path: "/admin/produtos", label: "Produtos", icon: Package },
  { path: "/admin/colecoes", label: "Coleções", icon: List },
  { path: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { path: "/admin/cupons", label: "Cupões", icon: Ticket },
];

export function AdminLayout({ user, onLogout, children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        data-testid="button-mobile-menu"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40 
          w-64 h-screen bg-card border-r border-border
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="mb-8 pt-2">
            <Link href="/" data-testid="link-home">
              <h1 className="text-2xl font-bold">ID≠NTICAL</h1>
              <p className="text-sm text-muted-foreground">Admin Panel</p>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path} data-testid={`link-${item.label.toLowerCase()}`}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{user?.nome || user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={onLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
