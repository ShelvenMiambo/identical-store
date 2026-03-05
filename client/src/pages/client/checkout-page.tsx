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
import { ChevronDown } from "lucide-react";

/* ─── Províncias de Moçambique ─── */
const PROVINCIAS = [
  "Maputo Cidade",
  "Maputo Província",
  "Gaza",
  "Inhambane",
  "Sofala",
  "Manica",
  "Tete",
  "Zambézia",
  "Nampula",
  "Cabo Delgado",
  "Niassa",
];

/* ─── Schema de validação ─── */
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
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      nomeCliente: "",
      emailCliente: "",
      telefoneCliente: "",
      enderecoEntrega: "",
      cidadeEntrega: "",
      provinciaEntrega: "",
      cupomCodigo: "",
    },
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.precoProduto) * item.quantidade,
    0
  );
  const total = subtotal;

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(v);

  const onSubmit = async (data: CheckoutFormData) => {
    if (step === 1) { setStep(2); return; }

    setIsProcessing(true);
    try {
      const result = await apiRequest("POST", "/api/checkout", {
        ...data,
        items: cartItems,
        total,
        subtotal,
        desconto: 0,
      });

      if (onClearCart) onClearCart();

      if (result.checkout_url) {
        toast({ title: "Pedido criado!", description: "Redirecionando para pagamento seguro..." });
        setTimeout(() => { window.location.href = result.checkout_url; }, 800);
      } else {
        toast({
          title: "Pedido criado com sucesso! ✅",
          description: "Será contactado para confirmar o pagamento via M-Pesa.",
        });
        setTimeout(() => {
          window.location.href = result.order_url || `/pedido/${result.order?.id}`;
        }, 1500);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao processar pedido",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) return <Redirect to="/loja" />;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header com passos */}
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

          {/* ══ Formulário principal ══ */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{step === 1 ? "Dados de Entrega" : "Confirmar Pedido"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                    {step === 1 ? (
                      <>
                        {/* Nome — obrigatório */}
                        <FormField
                          control={form.control}
                          name="nomeCliente"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="uppercase text-xs font-semibold">
                                Nome Completo <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: João Manuel Silva"
                                  {...field}
                                  data-testid="input-nome"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Telefone + Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="telefoneCliente"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="uppercase text-xs font-semibold">
                                  Telefone (M-Pesa / e-Mola) <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="tel"
                                    placeholder="Ex: 84 123 4567"
                                    {...field}
                                    data-testid="input-telefone"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="emailCliente"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="uppercase text-xs font-semibold">
                                  Email{" "}
                                  <span className="text-muted-foreground font-normal normal-case">(opcional)</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="Ex: joao@gmail.com"
                                    {...field}
                                    data-testid="input-email"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Endereço — validação suave */}
                        <FormField
                          control={form.control}
                          name="enderecoEntrega"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="uppercase text-xs font-semibold">
                                Endereço / Bairro de Entrega <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: Bairro Polana Cimento, Rua 1234 ou perto do mercado X"
                                  {...field}
                                  data-testid="input-endereco"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Cidade + Província */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="cidadeEntrega"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="uppercase text-xs font-semibold">
                                  Cidade{" "}
                                  <span className="text-muted-foreground font-normal normal-case">(opcional)</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ex: Maputo, Matola, Beira…"
                                    {...field}
                                    data-testid="input-cidade"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Província — dropdown lista */}
                          <FormField
                            control={form.control}
                            name="provinciaEntrega"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="uppercase text-xs font-semibold">
                                  Província <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <select
                                      {...field}
                                      data-testid="select-provincia"
                                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-8"
                                    >
                                      <option value="" disabled>
                                        — Escolhe a tua província —
                                      </option>
                                      {PROVINCIAS.map((p) => (
                                        <option key={p} value={p}>
                                          {p}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Nota campos obrigatórios */}
                        <p className="text-xs text-muted-foreground">
                          <span className="text-red-500">*</span> Campos obrigatórios
                        </p>

                        <Button
                          type="submit"
                          className="w-full"
                          size="lg"
                          data-testid="button-continue-payment"
                        >
                          Continuar para Pagamento
                        </Button>
                      </>
                    ) : (
                      <>
                        {/* Resumo dos dados inseridos */}
                        <div className="space-y-3 text-sm bg-slate-50 dark:bg-slate-800/40 rounded-lg p-4 border">
                          <p className="font-semibold text-base mb-2">Dados de Entrega:</p>
                          <div className="space-y-1 text-muted-foreground">
                            <p><span className="font-medium text-foreground">Nome:</span> {form.getValues("nomeCliente")}</p>
                            <p><span className="font-medium text-foreground">Telefone:</span> {form.getValues("telefoneCliente")}</p>
                            {form.getValues("emailCliente") && (
                              <p><span className="font-medium text-foreground">Email:</span> {form.getValues("emailCliente")}</p>
                            )}
                            <p>
                              <span className="font-medium text-foreground">Entrega:</span>{" "}
                              {form.getValues("enderecoEntrega")}
                              {form.getValues("cidadeEntrega") ? `, ${form.getValues("cidadeEntrega")}` : ""}
                              {form.getValues("provinciaEntrega") ? ` — ${form.getValues("provinciaEntrega")}` : ""}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setStep(1)}
                            data-testid="button-edit-details"
                          >
                            ✏️ Editar Dados
                          </Button>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <p className="font-semibold text-sm uppercase tracking-wider">
                            Método de Pagamento
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Será redirecionado para a plataforma PaySuite para completar o
                            pagamento com <strong>M-Pesa</strong>, <strong>e-Mola</strong> ou cartão.
                          </p>
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          size="lg"
                          disabled={isProcessing}
                          data-testid="button-process-payment"
                        >
                          {isProcessing ? "A processar…" : "Proceder ao Pagamento →"}
                        </Button>
                      </>
                    )}
                  </form>
                </Form>
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
                        <img
                          src={item.imagemProduto}
                          alt={item.nomeProduto}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight">{item.nomeProduto}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.tamanho} / {item.cor} × {item.quantidade}
                        </p>
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
