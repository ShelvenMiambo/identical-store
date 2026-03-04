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
import { Badge } from "@/components/ui/badge";
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
            toast({ title: "Status do pedido atualizado!" });
        },
        onError: (error: any) => {
            toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
        },
    });

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
                                                <TableCell className="max-w-[120px] truncate">{order.nomeCliente}</TableCell>
                                                <TableCell className="font-semibold whitespace-nowrap">{totalFormatado}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            order.status === "confirmado"
                                                                ? "default"
                                                                : order.status === "entregue"
                                                                    ? "outline"
                                                                    : "secondary"
                                                        }
                                                        className="uppercase text-xs"
                                                    >
                                                        {order.status}
                                                    </Badge>
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
                                                                    <div>
                                                                        <Label className="text-sm font-semibold">
                                                                            Alterar Status
                                                                        </Label>
                                                                        <Select
                                                                            defaultValue={selectedOrder.status}
                                                                            onValueChange={(status) => {
                                                                                updateOrderStatusMutation.mutate({
                                                                                    id: selectedOrder.id,
                                                                                    status,
                                                                                });
                                                                                setSelectedOrder({ ...selectedOrder, status });
                                                                            }}
                                                                        >
                                                                            <SelectTrigger className="w-full mt-2">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="pendente">Pendente</SelectItem>
                                                                                <SelectItem value="confirmado">Confirmado</SelectItem>
                                                                                <SelectItem value="enviado">Enviado</SelectItem>
                                                                                <SelectItem value="entregue">Entregue</SelectItem>
                                                                                <SelectItem value="cancelado">Cancelado</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                        <div>
                                                                            <p className="font-semibold mb-2">Cliente</p>
                                                                            <p className="text-muted-foreground">
                                                                                {selectedOrder.nomeCliente}
                                                                                <br />
                                                                                {selectedOrder.emailCliente}
                                                                                <br />
                                                                                {selectedOrder.telefoneCliente}
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-semibold mb-2">Entrega</p>
                                                                            <p className="text-muted-foreground">
                                                                                {selectedOrder.enderecoEntrega}
                                                                                <br />
                                                                                {selectedOrder.cidadeEntrega},{" "}
                                                                                {selectedOrder.provinciaEntrega}
                                                                            </p>
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
