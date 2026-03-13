import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package } from "lucide-react";
import { useLocation } from "wouter";

export default function TrackOrderPage() {
  const [, setLocation] = useLocation();
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError("Por favor, introduz o código do pedido.");
      return;
    }
    
    // Remover o cerquilha "#" caso o cliente tenha copiado junto e espaços
    const cleanId = orderId.replace(/^#/, "").trim();
    
    // Podemos apenas redirecionar para a página do pedido
    // A página do pedido cuidará de mostrar erro/notFound se não existir
    setLocation(`/pedido/${cleanId}`);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-md shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-4">
            <Package className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold uppercase tracking-widest">
            Acompanhar Pedido
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Insere o código do teu pedido para veres o estado actual em tempo real.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Ex: 831187d8"
                  className="pl-10 h-12 text-lg font-mono uppercase focus:ring-primary/20"
                  value={orderId}
                  onChange={(e) => {
                    setOrderId(e.target.value);
                    setError("");
                  }}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            </div>
            
            <Button type="submit" className="w-full h-12 text-base font-semibold transition-all hover:translate-y-[-2px] hover:shadow-md">
              Acompanhar Encomenda
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              O número do pedido foi-te dado na página de confirmação, logo após a tua compra (ex: #831187D8). Se não guardaste e eras "Guest", por favor, contacta a equipa no WhatsApp!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
