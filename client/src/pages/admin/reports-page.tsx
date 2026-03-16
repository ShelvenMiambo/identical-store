import { useQuery } from "@tanstack/react-query";
import { Order, Product } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Package, ShoppingCart } from "lucide-react";

export default function ReportsPage() {
    const { data: orders = [] } = useQuery<Order[]>({
        queryKey: ["/api/admin/orders"],
    });

    const { data: products = [] } = useQuery<Product[]>({
        queryKey: ["/api/products"],
    });

    // Calculate statistics
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    const confirmedOrders = orders.filter((o) => o.status === "confirmado" || o.status === "entregue");
    const confirmedRevenue = confirmedOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const totalProductsSold = orders.reduce((sum, o) => sum + 1, 0); // Simplified

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-MZ", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value) + " MZN";
    };

    // Orders by status
    const ordersByStatus = {
        pendente: orders.filter((o) => o.status === "pendente").length,
        confirmado: orders.filter((o) => o.status === "confirmado").length,
        enviado: orders.filter((o) => o.status === "enviado").length,
        entregue: orders.filter((o) => o.status === "entregue").length,
        cancelado: orders.filter((o) => o.status === "cancelado").length,
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Relatórios e Estatísticas
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Análise de vendas e desempenho da loja
                </p>
            </div>

            {/* Revenue Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Todos os pedidos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Confirmada</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(confirmedRevenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Pedidos confirmados e entregues
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Por pedido
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{products.filter(p => p.ativo).length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            De {products.length} total
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Orders by Status */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Pedidos por Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(ordersByStatus).map(([status, count]) => {
                            const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;

                            return (
                                <div key={status} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium capitalize">{status}</span>
                                        <span className="text-muted-foreground">
                                            {count} pedidos ({percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                        <div
                                            className="bg-slate-900 dark:bg-slate-100 h-2 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            Nenhuma atividade recente
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {orders.slice(0, 10).map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{order.nomeCliente}</p>
                                        <p className="text-sm text-muted-foreground">
                                            #{order.id.slice(0, 8)} • {new Date(order.createdAt).toLocaleDateString("pt-MZ")}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(parseFloat(order.total))}</p>
                                        <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
