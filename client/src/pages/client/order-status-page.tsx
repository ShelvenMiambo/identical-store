import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { CheckCircle2, Clock, Package, Truck, XCircle, ChevronLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function OrderStatusPage() {
    const { id } = useParams<{ id: string }>();

    const { data: order, isLoading, error } = useQuery<any>({
        queryKey: [`/api/orders/${id}`],
        retry: 3,
        refetchInterval: 30_000,
        refetchOnWindowFocus: true,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <XCircle className="mx-auto h-14 w-14 text-destructive mb-4" />
                <h1 className="text-xl sm:text-2xl font-bold mb-2">Pedido não encontrado</h1>
                <p className="text-muted-foreground mb-6 text-sm">Não conseguimos encontrar o pedido #{id?.slice(0, 8)}.</p>
                <Link href="/loja"><Button>Voltar para a Loja</Button></Link>
            </div>
        );
    }

    const fmt = (v: string | number) =>
        parseFloat(String(v)).toLocaleString("pt-MZ", { style: "currency", currency: "MZN" });

    const payLabel = (m?: string | null) =>
        ({ mpesa: "M-Pesa", emola: "e-Mola", mbim: "Conta Bancária (Millennium BIM)" }[m ?? ""] ?? m ?? "");

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "pendente": return {
                icon: <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-500" />,
                label: "Aguardando Verificação",
                color: "bg-yellow-500/10 text-yellow-700 border-yellow-300 dark:text-yellow-300 dark:border-yellow-700",
                description: "O teu pedido foi recebido! A equipa IDENTICAL irá verificar o comprovativo de pagamento e confirmar em breve.",
                step: 1,
            };
            case "confirmado": return {
                icon: <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-green-500" />,
                label: "Pagamento Confirmado",
                color: "bg-green-500/10 text-green-700 border-green-300 dark:text-green-300 dark:border-green-700",
                description: "O teu pagamento foi confirmado! Estamos a preparar o teu pedido para envio.",
                step: 2,
            };
            case "enviado": return {
                icon: <Truck className="h-7 w-7 sm:h-8 sm:w-8 text-blue-500" />,
                label: "Pedido Enviado 🚚",
                color: "bg-blue-500/10 text-blue-700 border-blue-300 dark:text-blue-300 dark:border-blue-700",
                description: "O teu pedido já saiu do nosso armazém e está a caminho da tua morada!",
                step: 3,
            };
            case "entregue": return {
                icon: <Package className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />,
                label: "Entregue ✅",
                color: "bg-primary/10 text-primary border-primary/30",
                description: "Pedido entregue com sucesso. Obrigado por escolheres a IDENTICAL! 🎉",
                step: 4,
            };
            case "cancelado": return {
                icon: <XCircle className="h-7 w-7 sm:h-8 sm:w-8 text-destructive" />,
                label: "Cancelado",
                color: "bg-destructive/10 text-destructive border-destructive/30",
                description: "Este pedido foi cancelado. Se tiveres dúvidas, contacta o nosso suporte.",
                step: 0,
            };
            default: return {
                icon: <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />,
                label: status,
                color: "bg-muted text-muted-foreground",
                description: "O status do teu pedido está a ser processado.",
                step: 1,
            };
        }
    };

    const statusConfig = getStatusConfig(order.status);

    return (
        <div className="min-h-screen bg-muted/20 pt-20 pb-12">
            <div className="mx-auto px-3 sm:px-6 max-w-4xl">
                {/* Back button */}
                <Link href="/loja">
                    <Button variant="ghost" size="sm" className="mb-4 gap-1.5 h-8 text-xs sm:text-sm -ml-2">
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Continuar a Comprar
                    </Button>
                </Link>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-5 gap-2">
                        <div>
                            <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
                                Pedido #{order.id.slice(0, 8).toUpperCase()}
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString("pt-MZ", {
                                    day: "2-digit", month: "short", year: "numeric",
                                    hour: "2-digit", minute: "2-digit",
                                })}
                            </p>
                        </div>
                        <Badge variant="outline" className={`text-xs sm:text-sm px-3 py-1.5 font-semibold self-start ${statusConfig.color}`}>
                            {statusConfig.label}
                        </Badge>
                    </div>

                    {/* Grid — col-span em desktop, stack em mobile */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">

                        {/* ─ Coluna principal ─ */}
                        <div className="md:col-span-2 space-y-4">

                            {/* Status card */}
                            <Card className="border-none shadow-sm bg-muted/30">
                                <CardContent className="pt-4 sm:pt-6 pb-5">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 sm:p-3 bg-background rounded-full shadow-sm shrink-0">
                                            {statusConfig.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-base sm:text-lg font-semibold">{statusConfig.label}</h3>
                                            <p className="text-muted-foreground text-sm leading-relaxed mt-0.5">
                                                {statusConfig.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    {order.status !== "cancelado" && (
                                        <div className="mt-6 sm:mt-8 relative px-2">
                                            <div className="absolute top-2 left-2 right-2 h-1 bg-muted rounded-full" />
                                            <div
                                                className="absolute top-2 left-2 h-1 bg-primary rounded-full transition-all duration-1000"
                                                style={{ width: `calc(${(statusConfig.step / 4) * 100}% - 16px)` }}
                                            />
                                            <div className="relative z-10 flex justify-between">
                                                {[1, 2, 3, 4].map((step) => (
                                                    <div key={step}
                                                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 transition-all
                                                            ${step <= statusConfig.step
                                                                ? "bg-primary border-primary"
                                                                : "bg-background border-muted"}`} />
                                                ))}
                                            </div>
                                            <div className="flex justify-between mt-2 text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                                <span>Recebido</span>
                                                <span>Confirmado</span>
                                                <span>Enviado</span>
                                                <span>Entregue</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Items card */}
                            <Card>
                                <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
                                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                        <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Itens do Pedido
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 sm:px-6 pb-4 space-y-3 sm:space-y-4">
                                    {order.items?.map((item: any) => (
                                        <div key={item.id} className="flex gap-3 sm:gap-4">
                                            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                <img src={item.imagemProduto} alt={item.nomeProduto}
                                                    className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm sm:text-base truncate">{item.nomeProduto}</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.tamanho} / {item.cor} × {item.quantidade}
                                                </p>
                                                <p className="text-xs sm:text-sm font-medium mt-0.5">
                                                    {fmt(item.precoProduto)} cada
                                                </p>
                                            </div>
                                            <div className="font-semibold text-sm sm:text-base text-right whitespace-nowrap">
                                                {fmt(item.quantidade * parseFloat(item.precoProduto))}
                                            </div>
                                        </div>
                                    ))}
                                    <Separator />
                                    <div className="space-y-1.5 text-sm">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Subtotal</span>
                                            <span>{fmt(order.subtotal)}</span>
                                        </div>
                                        {parseFloat(order.desconto) > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Desconto</span>
                                                <span>-{fmt(order.desconto)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-base sm:text-lg pt-2 border-t">
                                            <span>Total</span>
                                            <span className="text-primary">{fmt(order.total)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* ─ Sidebar ─ */}
                        <div className="space-y-4">
                            {/* Dados de entrega */}
                            <Card>
                                <CardHeader className="px-4 sm:px-6 py-3"><CardTitle className="text-sm sm:text-base">Dados de Entrega</CardTitle></CardHeader>
                                <CardContent className="px-4 sm:px-6 pb-4 space-y-3 text-sm">
                                    <div>
                                        <p className="font-semibold">{order.nomeCliente}</p>
                                        {order.emailCliente && <p className="text-muted-foreground text-xs">{order.emailCliente}</p>}
                                        <p className="text-muted-foreground">{order.telefoneCliente}</p>
                                        {order.metodoPagamento && (
                                            <span className="inline-block mt-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                💳 {payLabel(order.metodoPagamento)}
                                            </span>
                                        )}
                                    </div>
                                    <Separator />
                                    <div>
                                        <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">Morada</p>
                                        <p className="text-sm">{order.enderecoEntrega}</p>
                                        <p className="text-muted-foreground text-xs">
                                            {order.cidadeEntrega ? `${order.cidadeEntrega}, ` : ""}{order.provinciaEntrega}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Comprovativo */}
                            {order.comprovanteUrl && (
                                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                                    <CardContent className="pt-4 px-4 sm:px-6 pb-4">
                                        <h4 className="font-semibold text-sm text-green-800 dark:text-green-300 mb-1">✅ Comprovativo Enviado</h4>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            A equipa IDENTICAL está a verificar o teu pagamento.
                                        </p>
                                        <a href={order.comprovanteUrl} target="_blank" rel="noopener noreferrer"
                                            className="text-xs text-primary font-medium hover:underline">
                                            Ver comprovativo →
                                        </a>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Ajuda */}
                            <Card className="bg-primary/5 border-primary/10">
                                <CardContent className="pt-4 px-4 sm:px-6 pb-4">
                                    <h4 className="font-semibold text-sm mb-1">Precisa de ajuda?</h4>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Qualquer dúvida sobre o teu pedido, estamos aqui para ajudar.
                                    </p>
                                    <Link href="/contacto">
                                        <Button variant="outline" size="sm" className="w-full text-xs border-primary/20 hover:bg-primary/10">
                                            Contactar Suporte
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
