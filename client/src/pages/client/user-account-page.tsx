import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, User as UserIcon, LogOut, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface UserAccountPageProps {
  user?: any;
  onLogout?: () => void;
}

export default function UserAccountPage({ user, onLogout }: UserAccountPageProps) {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado": return "default";
      case "enviado": return "secondary";
      case "entregue": return "outline";
      case "cancelado": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: "Pendente",
      confirmado: "Confirmado",
      enviado: "Enviado",
      entregue: "Entregue",
      cancelado: "Cancelado",
    };
    return labels[status] || status;
  };

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("pt-MZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="min-h-screen pt-20 pb-16 bg-muted/20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* ─── Header de saudação ─── */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold uppercase tracking-tight">
                Minha Conta
              </h1>
              <p className="text-muted-foreground text-sm">
                Olá, <span className="font-semibold">{user?.nome?.split(" ")[0] || user?.username}</span>!
              </p>
            </div>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="w-full h-12 mb-6">
            <TabsTrigger value="orders" className="flex-1 text-sm font-semibold" data-testid="tab-orders">
              <Package className="mr-1.5 h-4 w-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex-1 text-sm font-semibold" data-testid="tab-profile">
              <UserIcon className="mr-1.5 h-4 w-4" />
              Perfil
            </TabsTrigger>
          </TabsList>

          {/* ─── ABA PEDIDOS ─── */}
          <TabsContent value="orders" className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-32 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingBag className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum pedido ainda</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Quando fizer um pedido, ele aparecerá aqui.
                  </p>
                  <Link href="/loja">
                    <Button className="font-semibold">Explorar Produtos</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const totalFormatado = new Intl.NumberFormat("pt-MZ", {
                    style: "currency",
                    currency: "MZN",
                  }).format(parseFloat(order.total));

                  return (
                    <Card key={order.id} className="overflow-hidden" data-testid={`order-card-${order.id}`}>
                      {/* Header do cartão */}
                      <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b">
                        <div>
                          <p className="font-bold text-sm">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                        </div>
                        <Badge variant={getStatusColor(order.status)} className="uppercase text-xs">
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>

                      <CardContent className="px-4 py-3 space-y-3">
                        <div className="flex justify-between items-start text-sm">
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Entrega</p>
                            <p className="text-sm leading-tight">
                              {order.enderecoEntrega}<br />
                              {order.cidadeEntrega}, {order.provinciaEntrega}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Total</p>
                            <p className="font-bold text-base">{totalFormatado}</p>
                          </div>
                        </div>

                        {order.metodoPagamento && (
                          <div className="pt-1 border-t text-xs text-muted-foreground flex items-center gap-1">
                            <span className="font-semibold">Pagamento:</span>
                            <span className="uppercase">{order.metodoPagamento}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ─── ABA PERFIL ─── */}
          <TabsContent value="profile">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Informações da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {[
                  { label: "Nome", value: user?.nome },
                  { label: "Email", value: user?.email },
                  { label: "Username", value: user?.username },
                  { label: "Telefone", value: user?.telefone },
                ].map(({ label, value }, i) => (
                  <div key={label}>
                    {i > 0 && <Separator />}
                    <div className="py-3.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                      <p className="text-base">{value || <span className="text-muted-foreground italic text-sm">Não definido</span>}</p>
                    </div>
                  </div>
                ))}

                <Separator className="mt-2" />

                <div className="pt-4">
                  <Button
                    variant="destructive"
                    className="w-full h-12 font-semibold"
                    onClick={onLogout}
                    data-testid="button-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair da Conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
