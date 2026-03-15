import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, User as UserIcon, LogOut, ShoppingBag, Eye, EyeOff, Lock, CheckCircle2, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface UserAccountPageProps {
  user?: any;
  onLogout?: () => void;
}

export default function UserAccountPage({ user, onLogout }: UserAccountPageProps) {
  const { toast } = useToast();
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
              <div className="space-y-4">
                {orders.map((order) => {
                  const totalFormatado = new Intl.NumberFormat("pt-MZ", {
                    style: "currency",
                    currency: "MZN",
                  }).format(parseFloat(order.total));

                  return (
                    <Link href={`/pedido/${order.id}`} key={order.id}>
                      <a className="block group">
                        <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/40 group-hover:-translate-y-0.5" data-testid={`order-card-${order.id}`}>
                          {/* Header do cartão */}
                          <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-b group-hover:bg-primary/5 transition-colors">
                            <div>
                              <p className="font-bold text-[13px] sm:text-sm text-foreground">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
                              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <Badge variant={getStatusColor(order.status)} className="uppercase text-[9px] sm:text-[10px] px-2 py-0.5 leading-tight tracking-wider">
                                {getStatusLabel(order.status)}
                              </Badge>
                              <span className="text-[10px] sm:text-xs font-semibold text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                Ver progresso <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-0.5" />
                              </span>
                            </div>
                          </div>

                          <CardContent className="px-4 py-4 space-y-3">
                            <div className="flex justify-between items-start text-sm">
                              <div className="flex-1 min-w-0 pr-4">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Local de Entrega</p>
                                <p className="text-xs sm:text-sm leading-snug">
                                  <span className="font-medium text-foreground">{order.enderecoEntrega}</span><br />
                                  <span className="text-muted-foreground">{order.cidadeEntrega}{order.cidadeEntrega ? ", " : ""}{order.provinciaEntrega}</span>
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total</p>
                                <p className="font-bold text-sm sm:text-base text-foreground">{totalFormatado}</p>
                              </div>
                            </div>

                            {order.metodoPagamento && (
                              <div className="pt-3 mt-1 border-t border-border/50 text-[11px] sm:text-xs text-muted-foreground flex items-center justify-between group-hover:border-primary/20 transition-colors">
                                <span className="flex items-center gap-1.5">
                                  💳 <span className="font-medium">Pagamento:</span> <span className="uppercase text-foreground">{order.metodoPagamento}</span>
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </a>
                    </Link>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ─── ABA PERFIL ─── */}
          <TabsContent value="profile">
            {/* Informações da Conta */}
            <Card className="mb-4">
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
              </CardContent>
            </Card>

            {/* Alterar Password */}
            <ChangePasswordSection toast={toast} />

            <Separator className="my-4" />
            <Button
              variant="destructive"
              className="w-full h-12 font-semibold"
              onClick={onLogout}
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair da Conta
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ────── Sub-componente: Alterar Password ────── */
function ChangePasswordSection({ toast }: { toast: any }) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) {
      toast({ title: "❌ Password muito curta", description: "A nova password deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    if (newPw !== confirmPw) {
      toast({ title: "❌ As passwords não coincidem", description: "Confirma que a nova password e a confirmação são iguais.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: "❌ Não foi possível alterar", description: data.message || "Tenta novamente.", variant: "destructive" });
        return;
      }
      setSuccess(true);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      toast({ title: "✅ Password alterada!", description: "A tua nova password já está activa." });
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      toast({ title: "❌ Erro de ligação", description: "Sem ligação ao servidor. Verifica a internet.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const PwField = ({ label, value, onChange, show, onToggle, placeholder, testId }: any) => (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">{label}</label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 pr-11"
          data-testid={testId}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Alterar Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">Password alterada com sucesso!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <PwField label="Password Actual" value={currentPw} onChange={setCurrentPw}
              show={showCurrent} onToggle={() => setShowCurrent(p => !p)}
              placeholder="Insere a tua password actual" testId="input-current-password" />
            <PwField label="Nova Password" value={newPw} onChange={setNewPw}
              show={showNew} onToggle={() => setShowNew(p => !p)}
              placeholder="Mínimo 6 caracteres" testId="input-new-password" />
            <PwField label="Confirmar Nova Password" value={confirmPw} onChange={setConfirmPw}
              show={showConfirm} onToggle={() => setShowConfirm(p => !p)}
              placeholder="Repete a nova password" testId="input-confirm-password" />
            <Button type="submit" className="w-full" disabled={isLoading || !currentPw || !newPw || !confirmPw}>
              {isLoading ? "A guardar..." : "Guardar Nova Password"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
