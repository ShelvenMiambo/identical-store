import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, ExternalLink, ChevronRight, Download, History } from "lucide-react";

export default function OrdersPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Dialog controlled separately — fixes stale state bug in radix Dialog inside map()
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    const { data: orders = [] } = useQuery<Order[]>({
        queryKey: ["/api/admin/orders"],
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) =>
            apiRequest("PUT", `/api/admin/orders/${id}/status`, { status }),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
            queryClient.invalidateQueries({ queryKey: [`/api/orders/${id}`] });
            toast({ title: "✅ Estado atualizado! Já reflete na conta do cliente." });
        },
        onError: (err: any) => {
            toast({ title: "Erro ao atualizar estado", description: err.message, variant: "destructive" });
        },
    });

    const handleStatusChange = (newStatus: string) => {
        if (!selectedOrder) return;
        updateStatusMutation.mutate({ id: selectedOrder.id, status: newStatus });
        // Update locally so the Select reflects immediately
        setSelectedOrder((prev: any) => prev ? { ...prev, status: newStatus } : prev);
    };

    const openOrder = (order: any) => {
        setSelectedOrder(order);
        setDialogOpen(true);
    };

    /* ── Badge de status ── */
    const statusBadge = (status: string) => {
        const map: Record<string, { label: string; cls: string }> = {
            pendente: { label: "Pendente", cls: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700" },
            confirmado: { label: "Confirmado", cls: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700" },
            enviado: { label: "Enviado", cls: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700" },
            entregue: { label: "Entregue", cls: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600" },
            cancelado: { label: "Cancelado", cls: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700" },
        };
        const s = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground border-border" };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wide ${s.cls}`}>
                {s.label}
            </span>
        );
    };

    const payLabel = (m?: string | null) =>
        ({ mpesa: "M-Pesa", emola: "e-Mola", mbim: "Millennium BIM" }[m ?? ""] ?? m ?? "—");

    const fmt = (v: string) =>
        new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(parseFloat(v));

    /* ── Comprovativo inline ── */
    const renderComprovativo = (url?: string | null) => {
        if (!url) {
            return (
                <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    ⚠️ Nenhum comprovativo enviado pelo cliente.
                </p>
            );
        }
        const isImage = /\.(jpg|jpeg|png|gif|webp|avif|heic)$/i.test(url);
        const isPdf = /\.pdf$/i.test(url);
        return (
            <div className="space-y-2">
                <a href={url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" />
                    {isPdf ? "Abrir PDF" : "Ver tamanho completo"}
                </a>
                {isImage ? (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt="Comprovativo"
                            className="w-full max-h-56 rounded-lg border object-contain bg-muted" />
                    </a>
                ) : (
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/40">
                        <FileText className="h-8 w-8 text-red-500 shrink-0" />
                        <p className="text-sm">Clica no link acima para abrir o ficheiro</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                        Gestão de Pedidos
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Altera o estado de um pedido para reflectir na conta do cliente em tempo real.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="gap-2 self-start"
                    onClick={() => window.open("/api/admin/orders/export-pdf", "_blank")}
                >
                    <Download className="h-4 w-4" />
                    Exportar Histórico PDF
                </Button>
            </div>

            <Tabs defaultValue="ativos">
                <TabsList className="mb-4 w-full sm:w-auto">
                    <TabsTrigger value="ativos" className="gap-2">
                        <FileText className="h-4 w-4" /> Pedidos Ativos
                    </TabsTrigger>
                    <TabsTrigger value="historico" className="gap-2">
                        <History className="h-4 w-4" /> Histórico
                    </TabsTrigger>
                </TabsList>

                {/* ══════ ABA PEDIDOS ATIVOS ══════ */}
                <TabsContent value="ativos">
                    <Card>
                        <CardHeader className="px-4 sm:px-6 py-4">
                            <CardTitle className="text-lg">Todos os Pedidos ({orders.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {orders.length === 0 ? (
                                <p className="text-center text-muted-foreground py-12">Nenhum pedido encontrado</p>
                            ) : (
                                <>
                                    {/* MOBILE: cards em vez de tabela */}
                                    <div className="block sm:hidden divide-y">
                                        {orders.map((order: any) => (
                                            <button
                                                key={order.id}
                                                className="w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center justify-between gap-3"
                                                onClick={() => openOrder(order)}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</span>
                                                        {statusBadge(order.status)}
                                                    </div>
                                                    <p className="font-semibold text-sm truncate">{order.nomeCliente}</p>
                                                    <p className="text-xs text-muted-foreground">{order.telefoneCliente} · {payLabel(order.metodoPagamento)}</p>
                                                    <p className="text-sm font-bold mt-1">{fmt(order.total)}</p>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                                            </button>
                                        ))}
                                    </div>

                                    {/* DESKTOP: tabela */}
                                    <div className="hidden sm:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[90px]">ID</TableHead>
                                                    <TableHead>Cliente</TableHead>
                                                    <TableHead>Total</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead>Pagamento</TableHead>
                                                    <TableHead>Comprovat.</TableHead>
                                                    <TableHead>Data</TableHead>
                                                    <TableHead className="text-right">Ações</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {orders.map((order: any) => (
                                                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                                                        <TableCell className="font-mono text-xs"># {order.id.slice(0, 8)}</TableCell>
                                                        <TableCell>
                                                            <p className="font-medium text-sm">{order.nomeCliente}</p>
                                                            <p className="text-xs text-muted-foreground">{order.telefoneCliente}</p>
                                                        </TableCell>
                                                        <TableCell className="font-semibold">{fmt(order.total)}</TableCell>
                                                        <TableCell>{statusBadge(order.status)}</TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">{payLabel(order.metodoPagamento)}</TableCell>
                                                        <TableCell>
                                                            {order.comprovanteUrl ? (
                                                                <a href={order.comprovanteUrl} target="_blank" rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                                                    onClick={e => e.stopPropagation()}>
                                                                    <ExternalLink className="h-3 w-3" /> Ver
                                                                </a>
                                                            ) : <span className="text-xs text-muted-foreground">—</span>}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                            {new Date(order.createdAt).toLocaleDateString("pt-MZ")}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="outline" size="sm" onClick={() => openOrder(order)}>
                                                                Detalhes
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Dialog controlado fora do map() — corrige bug de estado desatualizado */}
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
                            <DialogHeader>
                                <DialogTitle className="text-lg">
                                    Pedido #{selectedOrder?.id.slice(0, 8).toUpperCase()}
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedOrder && new Date(selectedOrder.createdAt).toLocaleString("pt-MZ")}
                                </DialogDescription>
                            </DialogHeader>

                            {selectedOrder && (
                                <div className="space-y-5 pt-2">
                                    {/* ── Estado — secção principal ── */}
                                    <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
                                        <Label className="text-sm font-bold uppercase tracking-wider">
                                            🔄 Alterar Estado do Pedido
                                        </Label>
                                        <p className="text-xs text-muted-foreground mt-1 mb-3">
                                            A alteração reflecte-se <strong>imediatamente</strong> na conta e página do cliente.
                                        </p>
                                        <Select
                                            value={selectedOrder.status}
                                            onValueChange={handleStatusChange}
                                            disabled={updateStatusMutation.isPending}
                                        >
                                            <SelectTrigger className="w-full h-12 text-base font-medium">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pendente" className="py-3">
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                                                        Pendente — aguarda verificação do pagamento
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="confirmado" className="py-3">
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                                                        Confirmado — pagamento verificado ✓
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="enviado" className="py-3">
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                                                        Enviado — a caminho do cliente
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="entregue" className="py-3">
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full bg-slate-500 inline-block" />
                                                        Entregue — pedido concluído
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="cancelado" className="py-3">
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                                                        Cancelado
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {updateStatusMutation.isPending && (
                                            <p className="text-xs text-muted-foreground mt-2 animate-pulse">A guardar...</p>
                                        )}
                                        <div className="mt-3">
                                            {statusBadge(selectedOrder.status)}
                                        </div>
                                    </div>

                                    {/* ── Info cliente + entrega ── */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <div className="rounded-lg border p-3 space-y-1">
                                            <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">👤 Cliente</p>
                                            <p className="font-medium">{selectedOrder.nomeCliente}</p>
                                            {selectedOrder.emailCliente && <p className="text-muted-foreground text-xs">{selectedOrder.emailCliente}</p>}
                                            <p className="text-muted-foreground">{selectedOrder.telefoneCliente}</p>
                                            {selectedOrder.metodoPagamento && (
                                                <p className="font-semibold text-xs mt-1">💳 {payLabel(selectedOrder.metodoPagamento)}</p>
                                            )}
                                        </div>
                                        <div className="rounded-lg border p-3 space-y-1">
                                            <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">📍 Entrega</p>
                                            <p className="font-medium">{selectedOrder.enderecoEntrega}</p>
                                            <p className="text-muted-foreground text-sm">
                                                {selectedOrder.cidadeEntrega ? `${selectedOrder.cidadeEntrega}, ` : ""}
                                                {selectedOrder.provinciaEntrega}
                                            </p>
                                        </div>
                                    </div>

                                    {/* ── Valor ── */}
                                    <div className="rounded-lg border p-3 text-sm">
                                        <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">💰 Valor</p>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Subtotal</span>
                                            <span>{fmt(selectedOrder.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-base border-t mt-1 pt-1">
                                            <span>Total</span>
                                            <span className="text-primary">{fmt(selectedOrder.total)}</span>
                                        </div>
                                    </div>

                                    {/* ── Comprovativo ── */}
                                    <div className="rounded-lg border p-3">
                                        <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">📎 Comprovativo de Pagamento</p>
                                        {renderComprovativo(selectedOrder.comprovanteUrl)}
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* ══════ ABA HISTÓRICO ══════ */}
                <TabsContent value="historico">
                    <HistoricoTab />
                </TabsContent>

            </Tabs>
        </div>
    );
}

/* ────── Sub-componente: aba de histórico ────── */
function HistoricoTab() {
    const { data: history = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/admin/orders/history"],
        refetchInterval: 60_000,
    });

    const fmtMzn = (v: string | null | undefined) =>
        v ? parseFloat(v).toLocaleString("pt-MZ", { style: "currency", currency: "MZN" }) : "—";

    const fmtDate = (d: string | Date) =>
        new Date(d).toLocaleDateString("pt-MZ", { day: "2-digit", month: "2-digit", year: "numeric" });

    if (isLoading) {
        return <p className="text-center text-muted-foreground py-12">A carregar histórico…</p>;
    }

    if (history.length === 0) {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                    <p className="text-muted-foreground">Nenhum pedido no histórico ainda.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Os pedidos aparecem aqui quando são marcados como <strong>Entregue</strong> ou <strong>Cancelado</strong>.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="px-4 sm:px-6 py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Histórico de Pedidos ({history.length})</CardTitle>
                <Button variant="outline" size="sm" className="gap-2"
                    onClick={() => window.open("/api/admin/orders/export-pdf", "_blank")}>
                    <Download className="h-4 w-4" /> Exportar PDF
                </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Pedido #</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Produtos</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.map((h: any) => {
                            const itens: any[] = Array.isArray(h.itens) ? h.itens : [];
                            return (
                                <TableRow key={h.id}>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {fmtDate(h.dataFinalizacao)}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        #{h.orderId.slice(0, 8).toUpperCase()}
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-medium text-sm">{h.nomeCliente}</p>
                                        {h.emailCliente && <p className="text-xs text-muted-foreground">{h.emailCliente}</p>}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{h.telefoneCliente}</TableCell>
                                    <TableCell>
                                        <div className="space-y-0.5">
                                            {itens.map((item: any, i: number) => (
                                                <p key={i} className="text-xs">
                                                    <span className="font-medium">{item.nomeProduto}</span>
                                                    <span className="text-muted-foreground"> × {item.quantidade}</span>
                                                    {item.tamanho && <span className="text-muted-foreground"> ({item.tamanho})</span>}
                                                </p>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-sm">
                                        {fmtMzn(h.total)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border uppercase ${h.statusFinal === "entregue"
                                                ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300"
                                                : "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300"
                                            }`}>
                                            {h.statusFinal}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
