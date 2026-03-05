import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, ExternalLink } from "lucide-react";

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
            queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
            queryClient.invalidateQueries({ queryKey: [`/api/orders/${id}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
            toast({ title: "✅ Status do pedido atualizado! Reflete na conta do cliente." });
        },
        onError: (error: any) => {
            toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
        },
    });

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

    const payLabel = (m?: string | null) => {
        if (!m) return "—";
        return { mpesa: "M-Pesa", emola: "e-Mola", mbim: "Millennium BIM" }[m] ?? m;
    };

    /* Renderizar o comprovativo */
    const renderComprovativo = (url?: string | null) => {
        if (!url) {
            return (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-amber-700 dark:text-amber-400 text-sm">
                    <span>⚠️ Nenhum comprovativo enviado pelo cliente.</span>
                </div>
            );
        }
        const isImage = /\.(jpg|jpeg|png|gif|webp|avif|heic)$/i.test(url);
        const isPdf = /\.pdf$/i.test(url);

        return (
            <div className="space-y-3">
                <a href={url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                    <ExternalLink className="h-4 w-4" />
                    {isPdf ? "Abrir PDF do comprovativo" : "Ver em tamanho completo"}
                </a>
                {isImage ? (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt="Comprovativo de pagamento"
                            className="max-h-64 rounded-lg border object-contain w-full bg-muted hover:opacity-90 transition-opacity" />
                    </a>
                ) : isPdf ? (
                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/40">
                        <FileText className="h-8 w-8 text-red-500 shrink-0" />
                        <div>
                            <p className="font-medium text-sm">Ficheiro PDF</p>
                            <p className="text-xs text-muted-foreground">Clica no link acima para abrir</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/40">
                        <FileText className="h-8 w-8 text-blue-500 shrink-0" />
                        <p className="text-sm">Ficheiro anexado — clica no link acima para ver</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Gestão de Pedidos
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Visualizar, gerir estados e comprovativos de pagamento
                </p>
            </div>

            <Card>
                <CardHeader><CardTitle>Pedidos</CardTitle></CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">Nenhum pedido encontrado</p>
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
                                        <TableHead>Comprovat.</TableHead>
                                        <TableHead className="hidden sm:table-cell">Data</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => {
                                        const totalFmt = new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(parseFloat(order.total));
                                        const comprovanteUrl = (order as any).comprovanteUrl;

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
                                                <TableCell className="font-semibold whitespace-nowrap">{totalFmt}</TableCell>
                                                <TableCell>{statusBadge(order.status)}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {payLabel((order as any).metodoPagamento)}
                                                </TableCell>
                                                <TableCell>
                                                    {comprovanteUrl ? (
                                                        <a href={comprovanteUrl} target="_blank" rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                                                            <ExternalLink className="h-3 w-3" /> Ver
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                                                    {new Date(order.createdAt).toLocaleDateString("pt-MZ")}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                                                <span className="hidden sm:inline">Detalhes</span>
                                                                <span className="sm:hidden">Ver</span>
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                                            <DialogHeader>
                                                                <DialogTitle>Pedido #{order.id.slice(0, 8).toUpperCase()}</DialogTitle>
                                                                <DialogDescription>
                                                                    {new Date(order.createdAt).toLocaleString("pt-MZ")}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            {selectedOrder && (
                                                                <div className="space-y-6">
                                                                    {/* Estado */}
                                                                    <div className="p-4 rounded-lg border bg-muted/30">
                                                                        <Label className="text-sm font-semibold">Alterar Estado do Pedido</Label>
                                                                        <p className="text-xs text-muted-foreground mt-1 mb-3">
                                                                            🔄 A alteração reflete-se imediatamente na conta do cliente.
                                                                        </p>
                                                                        <Select
                                                                            value={selectedOrder.status}
                                                                            onValueChange={(status) => {
                                                                                updateOrderStatusMutation.mutate({ id: selectedOrder.id, status });
                                                                                setSelectedOrder({ ...selectedOrder, status });
                                                                            }}
                                                                        >
                                                                            <SelectTrigger className="w-full">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="pendente">🟡 Pendente — aguarda verificação</SelectItem>
                                                                                <SelectItem value="confirmado">🟢 Confirmado — pagamento verificado</SelectItem>
                                                                                <SelectItem value="enviado">🔵 Enviado — a caminho do cliente</SelectItem>
                                                                                <SelectItem value="entregue">⚫ Entregue — pedido concluído</SelectItem>
                                                                                <SelectItem value="cancelado">🔴 Cancelado</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>

                                                                    {/* Info cliente + entrega */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                        <div>
                                                                            <p className="font-semibold mb-2">👤 Cliente</p>
                                                                            <div className="text-muted-foreground space-y-1">
                                                                                <p>{selectedOrder.nomeCliente}</p>
                                                                                {selectedOrder.emailCliente && <p>{selectedOrder.emailCliente}</p>}
                                                                                <p>{selectedOrder.telefoneCliente}</p>
                                                                                {(selectedOrder as any).metodoPagamento && (
                                                                                    <p className="font-semibold text-foreground">
                                                                                        💳 {payLabel((selectedOrder as any).metodoPagamento)}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-semibold mb-2">📍 Entrega</p>
                                                                            <div className="text-muted-foreground space-y-1">
                                                                                <p>{selectedOrder.enderecoEntrega}</p>
                                                                                <p>
                                                                                    {selectedOrder.cidadeEntrega ? `${selectedOrder.cidadeEntrega}, ` : ""}
                                                                                    {selectedOrder.provinciaEntrega}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Valor */}
                                                                    <div className="text-sm">
                                                                        <p className="font-semibold mb-2">💰 Valor</p>
                                                                        <div className="space-y-1 text-muted-foreground">
                                                                            <div className="flex justify-between">
                                                                                <span>Subtotal:</span>
                                                                                <span>{new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(parseFloat(selectedOrder.subtotal))}</span>
                                                                            </div>
                                                                            <div className="flex justify-between font-bold text-foreground text-base border-t pt-1">
                                                                                <span>Total:</span>
                                                                                <span>{new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(parseFloat(selectedOrder.total))}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Comprovativo */}
                                                                    <div>
                                                                        <p className="font-semibold text-sm mb-3">📎 Comprovativo de Pagamento</p>
                                                                        {renderComprovativo((selectedOrder as any).comprovanteUrl)}
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
