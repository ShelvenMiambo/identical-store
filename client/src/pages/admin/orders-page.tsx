import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function OrdersPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const { data: orders = [] } = useQuery<Order[]>({
        queryKey: ["/api/admin/orders"],
    });

    const updateOrderStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) =>
            apiRequest("PUT", `/api/admin/orders/${id}/status`, { status }),
        onSuccess: (_, { id }) => {
            // Invalidar lista admin + pedido individual → reflete na página do cliente imediatamente
            queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
            queryClient.invalidateQueries({ queryKey: [`/api/orders/${id}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
            toast({ title: "✅ Status do pedido atualizado!" });
        },
        onError: (error: any) => {
            toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
        },
    });

    /* Badges coloridos por estado */
    const statusBadge = (status: string) => {
        const map: Record<string, { label: string; cls: string }> = {
            pendente: { label: "Pendente", cls: "bg-yellow-100 text-yellow-800 border-yellow-300" },
            confirmado: { label: "Confirmado", cls: "bg-green-100 text-green-800 border-green-300" },
            enviado: { label: "Enviado", cls: "bg-blue-100 text-blue-800 border-blue-300" },
            entregue: { label: "Entregue", cls: "bg-slate-100 text-slate-700 border-slate-300" },
            cancelado: { label: "Cancelado", cls: "bg-red-100 text-red-700 border-red-300" },
        };
        const s = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wide ${s.cls}`}>
                {s.label}
            </span>
        );
    };

    /* Label do método de pagamento */
    const payLabel = (m?: string | null) => {
        if (!m) return null;
        const labels: Record<string, string> = {
            mpesa: "M-Pesa",
            emola: "e-Mola",
            mbim: "Millennium BIM",
        };
        return labels[m] ?? m;
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Gestão de Pedidos
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Visualizar e atualizar status dos pedidos
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            Nenhum pedido encontrado
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Pagamento</TableHead>
                                        <TableHead className="hidden sm:table-cell">Data</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => {
                                        const totalFormatado = new Intl.NumberFormat("pt-MZ", {
                                            style: "currency",
                                            currency: "MZN",
                                        }).format(parseFloat(order.total));

                                        return (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-mono text-xs whitespace-nowrap">
                                                    #{order.id.slice(0, 8)}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-sm">{order.nomeCliente}</p>
                                                        <p className="text-xs text-muted-foreground">{order.telefoneCliente}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold whitespace-nowrap">{totalFormatado}</TableCell>
                                                <TableCell>
                                                    {statusBadge(order.status)}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {payLabel((order as any).metodoPagamento) ?? "—"}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                                                    {new Date(order.createdAt).toLocaleDateString("pt-MZ")}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setSelectedOrder(order)}
                                                            >
                                                                <span className="hidden sm:inline">Ver Detalhes</span>
                                                                <span className="sm:hidden">Ver</span>
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Detalhes do Pedido</DialogTitle>
                                                                <DialogDescription>
                                                                    Pedido #{order.id.slice(0, 8)}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            {selectedOrder && (
                                                                <div className="space-y-6">
                                                                    {/* Alterar Status */}
                                                                    <div className="p-4 rounded-lg border bg-muted/30">
                                                                        <Label className="text-sm font-semibold">
                                                                            Alterar Status do Pedido
                                                                        </Label>
                                                                        <p className="text-xs text-muted-foreground mb-3 mt-1">
                                                                            A alteração reflete-se imediatamente na conta do cliente.
                                                                        </p>
                                                                        <Select
                                                                            value={selectedOrder.status}
                                                                            onValueChange={(status) => {
                                                                                updateOrderStatusMutation.mutate({
                                                                                    id: selectedOrder.id,
                                                                                    status,
                                                                                });
                                                                                setSelectedOrder({ ...selectedOrder, status });
                                                                            }}
                                                                        >
                                                                            <SelectTrigger className="w-full">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="pendente">🟡 Pendente</SelectItem>
                                                                                <SelectItem value="confirmado">🟢 Confirmado</SelectItem>
                                                                                <SelectItem value="enviado">🔵 Enviado</SelectItem>
                                                                                <SelectItem value="entregue">⚫ Entregue</SelectItem>
                                                                                <SelectItem value="cancelado">🔴 Cancelado</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                        <div>
                                                                            <p className="font-semibold mb-2">Cliente</p>
                                                                            <div className="text-muted-foreground space-y-1">
                                                                                <p>{selectedOrder.nomeCliente}</p>
                                                                                {selectedOrder.emailCliente && <p>{selectedOrder.emailCliente}</p>}
                                                                                <p>{selectedOrder.telefoneCliente}</p>
                                                                                {(selectedOrder as any).metodoPagamento && (
                                                                                    <p className="font-semibold text-foreground mt-1">
                                                                                        💳 {payLabel((selectedOrder as any).metodoPagamento)}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-semibold mb-2">Entrega</p>
                                                                            <div className="text-muted-foreground space-y-1">
                                                                                <p>{selectedOrder.enderecoEntrega}</p>
                                                                                <p>
                                                                                    {selectedOrder.cidadeEntrega
                                                                                        ? `${selectedOrder.cidadeEntrega}, `
                                                                                        : ""}
                                                                                    {selectedOrder.provinciaEntrega}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-sm">
                                                                        <p className="font-semibold mb-2">Valor</p>
                                                                        <div className="space-y-1 text-muted-foreground">
                                                                            <div className="flex justify-between">
                                                                                <span>Subtotal:</span>
                                                                                <span>
                                                                                    {new Intl.NumberFormat("pt-MZ", {
                                                                                        style: "currency",
                                                                                        currency: "MZN",
                                                                                    }).format(parseFloat(selectedOrder.subtotal))}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between font-bold text-foreground text-base">
                                                                                <span>Total:</span>
                                                                                <span>
                                                                                    {new Intl.NumberFormat("pt-MZ", {
                                                                                        style: "currency",
                                                                                        currency: "MZN",
                                                                                    }).format(parseFloat(selectedOrder.total))}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </DialogContent>
                                                    </Dialog>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
