import { Switch, Route, useLocation } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { CartItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Layouts
import { Header } from "@/components/client/Header";
import { Footer } from "@/components/client/Footer";
import { CartDrawer } from "@/components/client/CartDrawer";
import { AdminLayout } from "@/components/admin/AdminLayout";

// Pages - Cliente
import HomePage from "@/pages/client/home-page";
import CollectionsPage from "@/pages/client/collections-page";
import ProductPage from "@/pages/client/product-page";
import CheckoutPage from "@/pages/client/checkout-page";
import AuthPage from "@/pages/client/auth-page";
import UserAccountPage from "@/pages/client/user-account-page";
import AboutPage from "@/pages/client/about-page";
import FAQPage from "@/pages/client/faq-page";
import ContactPage from "@/pages/client/contact-page";
import PrivacyPage from "@/pages/client/privacy-page";
import TermsPage from "@/pages/client/terms-page";
import OrderStatusPage from "@/pages/client/order-status-page";


// Pages - Admin
import DashboardPage from "@/pages/admin/dashboard-page";
import ProductsPage from "@/pages/admin/products-page";
import OrdersPage from "@/pages/admin/orders-page";
import CollectionsAdminPage from "@/pages/admin/collections-page";
import ReportsPage from "@/pages/admin/reports-page";
import SettingsAdminPage from "@/pages/admin/settings-page";
import CategoriesAdminPage from "@/pages/admin/categories-page";
import UsersAdminPage from "@/pages/admin/users-page";

import NotFound from "@/pages/not-found";

// Router para Cliente (com Header/Footer)
function ClientRouter({
  cartItems,
  onAddToCart,
  onClearCart,
  user,
  onLogin,
  onRegister,
  onLogout,
}: {
  cartItems: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onClearCart: () => void;
  user?: any;
  onLogin?: (data: any) => Promise<void>;
  onRegister?: (data: any) => Promise<void>;
  onLogout?: () => void;
}) {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/loja" component={CollectionsPage} />
      <Route path="/colecoes" component={CollectionsPage} />
      <Route path="/produto/:slug">
        {(params) => <ProductPage onAddToCart={onAddToCart} />}
      </Route>
      <Route path="/checkout">
        {() => <CheckoutPage cartItems={cartItems} onClearCart={onClearCart} />}
      </Route>
      <Route path="/auth">
        {() => <AuthPage user={user} onLogin={onLogin} onRegister={onRegister} />}
      </Route>
      <Route path="/conta">
        {() => <UserAccountPage user={user} onLogout={onLogout} />}
      </Route>
      <Route path="/sobre" component={AboutPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/contacto" component={ContactPage} />
      <Route path="/privacidade" component={PrivacyPage} />
      <Route path="/termos" component={TermsPage} />
      <Route path="/pedido/:id" component={OrderStatusPage} />
      <Route component={NotFound} />

    </Switch>
  );
}

// Router para Admin (com AdminLayout)
function AdminRouter({
  user,
}: {
  user?: any;
}) {
  return (
    <Switch>
      <Route path="/admin" component={DashboardPage} />
      <Route path="/admin/produtos" component={ProductsPage} />
      <Route path="/admin/pedidos" component={OrdersPage} />
      <Route path="/admin/categorias" component={CategoriesAdminPage} />
      <Route path="/admin/colecoes" component={CollectionsAdminPage} />
      <Route path="/admin/configuracoes" component={SettingsAdminPage} />
      <Route path="/admin/relatorios" component={ReportsPage} />
      <Route path="/admin/utilizadores" component={UsersAdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { toast } = useToast();

  // Cart state managed with localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("identical-cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // Fetch current session from backend
  const { data: sessionData, refetch: refetchUser, isLoading } = useQuery<any>({
    queryKey: ["/api/session"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const user = sessionData?.user;

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem("identical-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      // Check if item with same product, size, and color exists
      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.tamanho === item.tamanho &&
          i.cor === item.cor
      );

      if (existingIndex >= 0) {
        // Update quantity
        const updated = [...prev];
        updated[existingIndex].quantidade += item.quantidade;
        return updated;
      } else {
        // Add new item
        return [...prev, item];
      }
    });

    // Open cart drawer
    setCartDrawerOpen(true);
  };

  const handleUpdateQuantity = (
    productId: string,
    tamanho: string,
    cor: string,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId, tamanho, cor);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.tamanho === tamanho && item.cor === cor
          ? { ...item, quantidade: newQuantity }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string, tamanho: string, cor: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item.productId === productId && item.tamanho === tamanho && item.cor === cor)
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const [location, navigate] = useLocation();

  // TAREFA 4 — Scroll para o topo quando muda de página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);

  const handleLogin = async (data: any) => {
    try {
      await apiRequest("POST", "/api/login", data);
      const session = await refetchUser();
      const loggedUser = session.data?.user;
      toast({
        title: "Login bem-sucedido!",
        description: `Bem-vindo${loggedUser?.nome ? ', ' + loggedUser.nome.split(' ')[0] : ''}!`,
      });
      // Admins vão para o painel, clientes para a sua conta
      if (loggedUser?.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/conta");
      }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: "Username ou password incorretos. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleRegister = async (data: any) => {
    try {
      // Remover isAdmin dos dados enviados - segurança
      const { isAdmin: _, ...registerData } = data;
      await apiRequest("POST", "/api/register", registerData);
      await refetchUser();
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo à IDENTICAL!",
      });
      navigate("/conta");
    } catch (error: any) {
      toast({
        title: "Erro no registo",
        description: error.message || "Não foi possível criar a conta. O username ou email pode já estar em uso.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      queryClient.invalidateQueries({ queryKey: ["/api/session"] });
      await refetchUser();
      toast({
        title: "Sessão terminada",
        description: "Até breve!",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isAdminRoute = location.startsWith("/admin");

  // Admin route guards - wait for session to load first
  if (isAdminRoute) {
    // Still loading - show nothing while loading
    if (isLoading) {
      return null;
    }

    // Not logged in - redirect to auth
    if (!user) {
      setTimeout(() => {
        navigate("/auth");
        toast({
          title: "Acesso negado",
          description: "Faça login para acessar o painel admin",
          variant: "destructive",
        });
      }, 0);
      return null;
    }

    // Logged in but not admin - redirect to home
    if (!user.isAdmin) {
      setTimeout(() => {
        navigate("/");
        toast({
          title: "Acesso negado",
          description: "Apenas administradores podem acessar esta página",
          variant: "destructive",
        });
      }, 0);
      return null;
    }

    // Render Admin Layout for admins
    return (
      <>
        <AdminLayout user={user} onLogout={handleLogout}>
          <AdminRouter user={user} />
        </AdminLayout>
        <Toaster />
      </>
    );
  }

  // Render Client Layout
  return (
    <div className="flex flex-col min-h-screen">
      <Header
        cartItemCount={cartItems.length}
        onCartClick={() => setCartDrawerOpen(true)}
        user={user}
      />

      <main className="flex-1">
        <ClientRouter
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
          onClearCart={handleClearCart}
          user={user}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onLogout={handleLogout}
        />
      </main>

      <Footer />

      <CartDrawer
        open={cartDrawerOpen}
        onOpenChange={setCartDrawerOpen}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
