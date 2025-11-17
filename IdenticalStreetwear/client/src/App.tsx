import { Switch, Route } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { CartItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Components
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

// Pages
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
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

function Router({
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
      <Route path="/admin">
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

  // Fetch current user from backend
  const { data: user, refetch: refetchUser } = useQuery<any>({
    queryKey: ["/api/user"],
    retry: false,
    refetchOnWindowFocus: false,
  });

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
      await refetchUser();
      toast({
        title: "Sessão terminada",
        description: "Até breve!",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        cartItemCount={cartItems.length}
        onCartClick={() => setCartDrawerOpen(true)}
        user={user}
      />

      <main className="flex-1">
        <Router
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
