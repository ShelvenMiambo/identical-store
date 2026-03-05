import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { ChevronDown, CheckCircle2 } from "lucide-react";

/* ─── Províncias de Moçambique ─── */
const PROVINCIAS = [
  "Maputo Cidade", "Maputo Província", "Gaza", "Inhambane",
  "Sofala", "Manica", "Tete", "Zambézia", "Nampula",
  "Cabo Delgado", "Niassa",
];

/* ─── Métodos de Pagamento ─── */
const PAYMENT_METHODS = [
  {
    id: "mpesa",
    label: "M-Pesa",
    desc: "Vodacom M-Pesa",
    color: "border-red-400 bg-red-50 dark:bg-red-950/20",
    activeColor: "border-red-600 bg-red-100 dark:bg-red-900/40 ring-2 ring-red-400",
    icon: (
      <svg viewBox="0 0 80 40" className="h-8 w-auto" fill="none">
        <rect width="80" height="40" rx="6" fill="#E31837" />
        <text x="8" y="26" fill="white" fontWeight="bold" fontSize="13" fontFamily="Arial">
          M-PESA
        </text>
      </svg>
    ),
  },
  {
    id: "emola",
    label: "e-Mola",
    desc: "Movitel e-Mola",
    color: "border-green-400 bg-green-50 dark:bg-green-950/20",
    activeColor: "border-green-600 bg-green-100 dark:bg-green-900/40 ring-2 ring-green-400",
    icon: (
      <svg viewBox="0 0 80 40" className="h-8 w-auto" fill="none">
        <rect width="80" height="40" rx="6" fill="#00A651" />
        <text x="8" y="26" fill="white" fontWeight="bold" fontSize="13" fontFamily="Arial">
          e-Mola
        </text>
      </svg>
    ),
  },
  {
    id: "mbim",
    label: "Millennium BIM",
    desc: "Cartão / Conta BIM",
    color: "border-blue-400 bg-blue-50 dark:bg-blue-950/20",
    activeColor: "border-blue-600 bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-400",
    icon: (
      <svg viewBox="0 0 80 40" className="h-8 w-auto" fill="none">
        <rect width="80" height="40" rx="6" fill="#003087" />
        <text x="5" y="16" fill="white" fontWeight="bold" fontSize="8" fontFamily="Arial">
          MILLENNIUM
        </text>
        <text x="20" y="30" fill="#FFD700" fontWeight="bold" fontSize="11" fontFamily="Arial">
          BIM
        </text>
      </svg>
    ),
  },
];

/* ─── Schema ─── */
const checkoutSchema = z.object({
  nomeCliente: z.string().min(3, "Nome completo é obrigatório"),
  emailCliente: z.string().email("Email inválido").optional().or(z.literal("")),
  telefoneCliente: z.string().min(9, "Número de telefone inválido"),
  enderecoEntrega: z.string().min(3, "Indica o teu endereço / bairro"),
  cidadeEntrega: z.string().optional().or(z.literal("")),
  provinciaEntrega: z.string().min(2, "Seleciona a tua província"),
  cupomCodigo: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutPageProps {
  cartItems: CartItem[];
  onClearCart?: () => void;
}

export default function CheckoutPage({ cartItems, onClearCart }: CheckoutPageProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);           // 1 = dados, 2 = pagamento, 3 = processando
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      nomeCliente: "", emailCliente: "", telefoneCliente: "",
      enderecoEntrega: "", cidadeEntrega: "", provinciaEntrega: "", cupomCodigo: "",
    },
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.precoProduto) * item.quantidade, 0
  );
  const total = subtotal;
  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(v);

  /* ── Submit dados (passo 1 → 2) ── */
  const onSubmitStep1 = (data: CheckoutFormData) => {
    setStep(2);
  };

  /* ── Confirmar pagamento (passo 2 → criar pedido) ── */
  const handleConfirmPayment = async () => {
    if (!selectedPayment) {
      toast({ title: "Seleciona o método de pagamento", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const data = form.getValues();
      const result = await apiRequest("POST", "/api/checkout", {
        ...data,
        items: cartItems,
        total,
        subtotal,
        desconto: 0,
        metodoPagamento: selectedPayment,
      });

      if (onClearCart) onClearCart();

      toast({
        title: "Pedido criado com sucesso! ✅",
        description: `Pagamento via ${PAYMENT_METHODS.find(m => m.id === selectedPayment)?.label}. Será contactado para confirmar.`,
      });

      setTimeout(() => {
        window.location.href = result.order_url || `/pedido/${result.order?.id}`;
      }, 1200);
    } catch (error: any) {
      toast({
        title: "Erro ao processar pedido",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) return <Redirect to="/loja" />;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header + passos */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
            Finalizar Compra
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <span className={step >= 1 ? "text-primary font-semibold" : "text-muted-foreground"}>
              1. Dados de Entrega
            </span>
            <span className="text-muted-foreground">→</span>
            <span className={step >= 2 ? "text-primary font-semibold" : "text-muted-foreground"}>
              2. Pagamento
            </span>
          </div>
        </div>

        <div className="flex flex-col-reverse md:grid md:grid-cols-3 gap-6 md:gap-8">

          {/* ══ Formulário ══ */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 ? "Dados de Entrega" : "Escolhe o Método de Pagamento"}
                </CardTitle>
              </CardHeader>
              <CardContent>

                {/* ── PASSO 1: Dados ── */}
                {step === 1 && (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitStep1)} className="space-y-5">

                      <FormField control={form.control} name="nomeCliente" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs font-semibold">
                            Nome Completo <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: João Manuel Silva" {...field} data-testid="input-nome" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="telefoneCliente" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="uppercase text-xs font-semibold">
                              Telefone <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="Ex: 84 123 4567" {...field} data-testid="input-telefone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="emailCliente" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="uppercase text-xs font-semibold">
                              Email <span className="text-muted-foreground font-normal normal-case">(opcional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Ex: joao@gmail.com" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={form.control} name="enderecoEntrega" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs font-semibold">
                            Endereço / Bairro de Entrega <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Bairro Polana Cimento, perto do mercado X"
                              {...field}
                              data-testid="input-endereco"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="cidadeEntrega" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="uppercase text-xs font-semibold">
                              Cidade <span className="text-muted-foreground font-normal normal-case">(opcional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Maputo, Matola, Beira…" {...field} data-testid="input-cidade" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="provinciaEntrega" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="uppercase text-xs font-semibold">
                              Província <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <select
                                  {...field}
                                  data-testid="select-provincia"
                                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 pr-8"
                                >
                                  <option value="" disabled>— Escolhe a tua província —</option>
                                  {PROVINCIAS.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                  ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <p className="text-xs text-muted-foreground">
                        <span className="text-red-500">*</span> Campos obrigatórios
                      </p>

                      <Button type="submit" className="w-full" size="lg" data-testid="button-continue-payment">
                        Continuar para Pagamento →
                      </Button>
                    </form>
                  </Form>
                )}

                {/* ── PASSO 2: Método de Pagamento ── */}
                {step === 2 && (
                  <div className="space-y-6">
                    {/* Resumo dos dados */}
                    <div className="text-sm bg-slate-50 dark:bg-slate-800/40 rounded-lg p-4 border space-y-1">
                      <p className="font-semibold mb-2">Dados de Entrega:</p>
                      <p><span className="text-muted-foreground">Nome:</span> {form.getValues("nomeCliente")}</p>
                      <p><span className="text-muted-foreground">Telefone:</span> {form.getValues("telefoneCliente")}</p>
                      {form.getValues("emailCliente") && (
                        <p><span className="text-muted-foreground">Email:</span> {form.getValues("emailCliente")}</p>
                      )}
                      <p>
                        <span className="text-muted-foreground">Morada:</span>{" "}
                        {form.getValues("enderecoEntrega")}
                        {form.getValues("cidadeEntrega") ? `, ${form.getValues("cidadeEntrega")}` : ""}
                        {` — ${form.getValues("provinciaEntrega")}`}
                      </p>
                      <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setStep(1)}>
                        ✏️ Editar Dados
                      </Button>
                    </div>

                    <Separator />

                    {/* Métodos de pagamento */}
                    <div>
                      <p className="font-semibold text-sm uppercase tracking-wider mb-4">
                        Seleciona o Método de Pagamento
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {PAYMENT_METHODS.map((method) => {
                          const isSelected = selectedPayment === method.id;
                          return (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => setSelectedPayment(method.id)}
                              className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer text-left
                                ${isSelected ? method.activeColor : method.color + " hover:shadow-md"}`}
                            >
                              {isSelected && (
                                <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-green-600" />
                              )}
                              {method.icon}
                              <div className="text-center">
                                <p className="font-bold text-sm">{method.label}</p>
                                <p className="text-xs text-muted-foreground">{method.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {selectedPayment && (
                        <p className="text-sm text-muted-foreground mt-3 text-center">
                          ℹ️ Após confirmar, a equipa IDENTICAL irá contactar-te para finalizar o pagamento via{" "}
                          <strong>{PAYMENT_METHODS.find(m => m.id === selectedPayment)?.label}</strong>.
                        </p>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleConfirmPayment}
                      disabled={isProcessing || !selectedPayment}
                      data-testid="button-process-payment"
                    >
                      {isProcessing
                        ? "A processar…"
                        : selectedPayment
                          ? `Confirmar Pedido — ${PAYMENT_METHODS.find(m => m.id === selectedPayment)?.label}`
                          : "Seleciona um método de pagamento"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ══ Resumo do Pedido ══ */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex gap-3 text-sm">
                      <div className="w-16 h-16 rounded-md bg-muted overflow-hidden flex-shrink-0">
                        <img src={item.imagemProduto} alt={item.nomeProduto} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight">{item.nomeProduto}</p>
                        <p className="text-xs text-muted-foreground">{item.tamanho} / {item.cor} × {item.quantidade}</p>
                        <p className="text-xs font-semibold mt-0.5">
                          {fmt(parseFloat(item.precoProduto) * item.quantidade)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span data-testid="text-checkout-subtotal">{fmt(subtotal)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span data-testid="text-checkout-total">{fmt(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
