import { Switch, Route, useLocation } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { CartItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Layouts
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { AdminLayout } from "@/components/AdminLayout";

// Pages - Cliente
import HomePage from "@/pages/home-page";
import CollectionsPage from "@/pages/collections-page";
import ProductPage from "@/pages/product-page";
import CheckoutPage from "@/pages/checkout-page";
import AuthPage from "@/pages/auth-page";
import UserAccountPage from "@/pages/user-account-page";
import AboutPage from "@/pages/about-page";
import FAQPage from "@/pages/faq-page";
import ContactPage from "@/pages/contact-page";
import PrivacyPage from "@/pages/privacy-page";
import TermsPage from "@/pages/terms-page";

// Pages - Admin
import AdminDashboard from "@/pages/admin-dashboard";

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
      <Route path="/admin/:rest*">
        {() => <AdminDashboard user={user} />}
      </Route>
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

  const handleLogin = async (data: any) => {
    try {
      const result = await apiRequest("POST", "/api/login", data);
      await refetchUser();
      toast({
        title: "Login bem-sucedido!",
        description: "Bem-vindo de volta!",
      });
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleRegister = async (data: any) => {
    try {
      const result = await apiRequest("POST", "/api/register", data);
      await refetchUser();
      toast({
        title: "Conta criada!",
        description: "Bem-vindo à IDENTICAL!",
      });
    } catch (error: any) {
      toast({
        title: "Erro no registo",
        description: error.message || "Não foi possível criar conta",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      // Invalidate session cache after logout
      queryClient.invalidateQueries({ queryKey: ["/api/session"] });
      await refetchUser();
      toast({
        title: "Sessão terminada",
        description: "Até breve!",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const [location, navigate] = useLocation();
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
