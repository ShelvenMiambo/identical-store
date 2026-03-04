import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, User as UserIcon, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
      case "confirmado":
        return "default";
      case "enviado":
        return "secondary";
      case "entregue":
        return "outline";
      case "cancelado":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("pt-MZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-2">
            Minha Conta
          </h1>
          <p className="text-muted-foreground">Olá, {user?.nome || user?.username}!</p>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <Package className="mr-2 h-4 w-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">
              <UserIcon className="mr-2 h-4 w-4" />
              Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6 space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Meus Pedidos</h2>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-32 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum pedido ainda</h3>
                  <p className="text-muted-foreground mb-6">
                    Quando fizer um pedido, ele aparecerá aqui.
                  </p>
                  <Button>Explorar Produtos</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const totalFormatado = new Intl.NumberFormat("pt-MZ", {
                    style: "currency",
                    currency: "MZN",
                  }).format(parseFloat(order.total));

                  return (
                    <Card key={order.id} data-testid={`order-card-${order.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">Pedido #{order.id.slice(0, 8)}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <Badge variant={getStatusColor(order.status)} className="uppercase">
                            {order.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-semibold mb-1">Entrega:</p>
                              <p className="text-muted-foreground">
                                {order.enderecoEntrega}
                                <br />
                                {order.cidadeEntrega}, {order.provinciaEntrega}
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold mb-1">Total:</p>
                              <p className="text-lg font-bold">{totalFormatado}</p>
                            </div>
                          </div>

                          {order.metodoPagamento && (
                            <>
                              <Separator />
                              <div className="text-sm">
                                <p className="font-semibold mb-1">Método de Pagamento:</p>
                                <p className="text-muted-foreground uppercase">
                                  {order.metodoPagamento}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Nome</p>
                    <p className="text-lg">{user?.nome || "—"}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Email</p>
                    <p className="text-lg">{user?.email || "—"}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Username</p>
                    <p className="text-lg">{user?.username || "—"}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Telefone</p>
                    <p className="text-lg">{user?.telefone || "—"}</p>
                  </div>
                </div>

                <Separator />

                <Button
                  variant="destructive"
                  onClick={onLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair da Conta
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
