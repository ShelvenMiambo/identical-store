import { useQuery } from "@tanstack/react-query";
import { Product, Collection, Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, List, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pendente").length,
    totalRevenue: orders.reduce((sum, o) => sum + parseFloat(o.total), 0),
  };

  const revenueFormatted = new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
  }).format(stats.totalRevenue);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Visão geral e gestão da loja IDENTICAL
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-100">
              Total Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-100">
              Total Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-100">
              Pedidos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-100">
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueFormatted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/pedidos">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingBag className="h-5 w-5 text-green-600" />
                Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gerir pedidos e atualizar status
              </p>
              <Button variant="ghost" className="px-0 mt-2">
                Ver todos →
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/produtos">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-blue-600" />
                Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Adicionar e editar produtos
              </p>
              <Button variant="ghost" className="px-0 mt-2">
                Ver todos →
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/colecoes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <List className="h-5 w-5 text-purple-600" />
                Coleções
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Organizar produtos em coleções
              </p>
              <Button variant="ghost" className="px-0 mt-2">
                Ver todas →
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/relatorios">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Análise de vendas e estatísticas
              </p>
              <Button variant="ghost" className="px-0 mt-2">
                Ver relatórios →
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum pedido encontrado
            </p>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => {
                const totalFormatado = new Intl.NumberFormat("pt-MZ", {
                  style: "currency",
                  currency: "MZN",
                }).format(parseFloat(order.total));

                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div>
                      <p className="font-semibold">{order.nomeCliente}</p>
                      <p className="text-sm text-muted-foreground">
                        #{order.id.slice(0, 8)} •{" "}
                        {new Date(order.createdAt).toLocaleDateString("pt-MZ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{totalFormatado}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {order.status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
