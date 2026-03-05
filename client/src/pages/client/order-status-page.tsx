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
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <XCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold mb-2">Pedido não encontrado</h1>
                <p className="text-muted-foreground mb-8">Não conseguimos encontrar os detalhes do pedido #{id}.</p>
                <Link href="/loja">
                    <Button>Voltar para a Loja</Button>
                </Link>
            </div>
        );
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "pendente":
                return {
                    icon: <Clock className="h-8 w-8 text-yellow-500" />,
                    label: "Aguardando Pagamento",
                    color: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
                    description: "O seu pedido foi recebido! A equipa IDENTICAL irá contactar-te brevemente para confirmar o pagamento.",
                    step: 1
                };
            case "confirmado":
                return {
                    icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
                    label: "Pagamento Confirmado",
                    color: "bg-green-500/10 text-green-600 border-green-200",
                    description: "O seu pagamento foi confirmado! Estamos agora a preparar o seu pedido para envio.",
                    step: 2
                };
            case "enviado":
                return {
                    icon: <Truck className="h-8 w-8 text-blue-500" />,
                    label: "Pedido Enviado",
                    color: "bg-blue-500/10 text-blue-600 border-blue-200",
                    description: "O seu pedido já saiu do nosso armazém e está a caminho da sua morada.",
                    step: 3
                };
            case "entregue":
                return {
                    icon: <Package className="h-8 w-8 text-primary" />,
                    label: "Pedido Entregue",
                    color: "bg-primary/10 text-primary border-primary/20",
                    description: "O pedido foi entregue com sucesso. Esperamos que goste da sua nova peça IDENTICAL!",
                    step: 4
                };
            case "cancelado":
                return {
                    icon: <XCircle className="h-8 w-8 text-destructive" />,
                    label: "Pedido Cancelado",
                    color: "bg-destructive/10 text-destructive border-destructive/20",
                    description: "Este pedido foi cancelado. Se tiver alguma dúvida, por favor contacte o nosso suporte.",
                    step: 0
                };
            default:
                return {
                    icon: <Clock className="h-8 w-8 text-muted-foreground" />,
                    label: status,
                    color: "bg-muted text-muted-foreground",
                    description: "O status do seu pedido está a ser processado.",
                    step: 1
                };
        }
    };

    const statusConfig = getStatusConfig(order.status);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link href="/loja">
                <Button variant="ghost" className="mb-6 gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Continuar a Comprar
                </Button>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Pedido #{order.id.slice(0, 8)}</h1>
                        <p className="text-muted-foreground">
                            Realizado em {new Date(order.createdAt).toLocaleDateString('pt-MZ', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <Badge variant="outline" className={`text-sm px-3 py-1 font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        {/* Status Card */}
                        <Card className="border-none shadow-sm bg-muted/30">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-background rounded-full shadow-sm">
                                        {statusConfig.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">{statusConfig.label}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {statusConfig.description}
                                        </p>
                                    </div>
                                </div>

                                {order.status !== 'cancelado' && (
                                    <div className="mt-8 relative">
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 z-0"></div>
                                        <div
                                            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-1000"
                                            style={{ width: `${(statusConfig.step / 4) * 100}%` }}
                                        ></div>
                                        <div className="relative z-10 flex justify-between">
                                            {[1, 2, 3, 4].map((step) => (
                                                <div
                                                    key={step}
                                                    className={`w-4 h-4 rounded-full border-2 ${step <= statusConfig.step
                                                        ? 'bg-primary border-primary'
                                                        : 'bg-background border-muted'
                                                        }`}
                                                ></div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                            <span>Recebido</span>
                                            <span>Preparando</span>
                                            <span>Enviado</span>
                                            <span>Entregue</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Items Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5" />
                                    Itens do Pedido
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {order.items?.map((item: any) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                            <img
                                                src={item.imagemProduto}
                                                alt={item.nomeProduto}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h4 className="font-medium">{item.nomeProduto}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Tamanho: {item.tamanho} | Cor: {item.cor}
                                            </p>
                                            <p className="text-sm font-medium mt-1">
                                                {item.quantidade} x {parseFloat(item.precoProduto).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center font-semibold">
                                            {(item.quantidade * parseFloat(item.precoProduto)).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                        </div>
                                    </div>
                                ))}

                                <Separator className="my-4" />

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{parseFloat(order.subtotal).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
                                    </div>
                                    {parseFloat(order.desconto) > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Desconto</span>
                                            <span>-{parseFloat(order.desconto).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                        <span>Total</span>
                                        <span className="text-primary">
                                            {parseFloat(order.total).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Customer Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Dados de Entrega</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <p className="font-semibold">{order.nomeCliente}</p>
                                    {order.emailCliente && <p className="text-muted-foreground">{order.emailCliente}</p>}
                                    <p className="text-muted-foreground">{order.telefoneCliente}</p>
                                    {order.metodoPagamento && (
                                        <p className="text-xs mt-1 font-medium capitalize bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block">
                                            💳 {order.metodoPagamento === 'mpesa' ? 'M-Pesa' : order.metodoPagamento === 'emola' ? 'e-Mola' : 'Millennium BIM'}
                                        </p>
                                    )}
                                </div>
                                <Separator />
                                <div>
                                    <p className="font-semibold">Endereço</p>
                                    <p className="text-muted-foreground">{order.enderecoEntrega}</p>
                                    <p className="text-muted-foreground">
                                        {order.cidadeEntrega ? `${order.cidadeEntrega}, ` : ""}{order.provinciaEntrega}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Help Card */}
                        <Card className="bg-primary/5 border-primary/10">
                            <CardContent className="pt-6">
                                <h4 className="font-semibold mb-2">Precisa de ajuda?</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Se tiver qualquer dúvida sobre o seu pedido, entre em contacto connosco.
                                </p>
                                <Link href="/contacto">
                                    <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/10">
                                        Contactar Suporte
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
