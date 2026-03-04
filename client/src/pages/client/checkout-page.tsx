import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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


const checkoutSchema = z.object({
  nomeCliente: z.string().min(3, "Nome completo é obrigatório"),
  emailCliente: z.string().email("Email inválido"),
  telefoneCliente: z.string().min(9, "Telefone inválido"),
  enderecoEntrega: z.string().min(10, "Endereço completo é obrigatório"),
  cidadeEntrega: z.string().min(3, "Cidade é obrigatória"),
  provinciaEntrega: z.string().min(3, "Província é obrigatória"),
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
  const desconto = 0; // TODO: Apply coupon discount
  const total = subtotal - desconto;

  const subtotalFormatado = new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
  }).format(subtotal);

  const totalFormatado = new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
  }).format(total);

  const onSubmit = async (data: CheckoutFormData) => {
    if (step === 1) {
      setStep(2);
      return;
    }

    setIsProcessing(true);

    try {
      const response = await apiRequest("POST", "/api/checkout", {
        ...data,
        items: cartItems,
        total: total,
        subtotal: subtotal,
        desconto: desconto
      });

      const result = await response.json();

      if (result.success && result.checkout_url) {
        toast({
          title: "Pedido criado com sucesso!",
          description: "Redirecionando para o pagamento seguro...",
        });

        // Clear cart before redirecting
        if (onClearCart) onClearCart();

        // Redirect to PaySuite
        window.location.href = result.checkout_url;
      } else {
        throw new Error(result.message || "Erro ao gerar link de pagamento");
      }
    } catch (error: any) {
      console.error("Erro no checkout:", error);
      toast({
        title: "Erro ao processar pedido",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return <Redirect to="/loja" />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
          {/* Main Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 ? "Dados de Entrega" : "Confirmar Pedido"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {step === 1 ? (
                      <>
                        <FormField
                          control={form.control}
                          name="nomeCliente"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="uppercase text-xs font-semibold">
                                Nome Completo
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="João Silva" {...field} data-testid="input-nome" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="emailCliente"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="uppercase text-xs font-semibold">
                                  Email
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="joao@exemplo.com"
                                    {...field}
                                    data-testid="input-email"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="telefoneCliente"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="uppercase text-xs font-semibold">
                                  Telefone
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="+258 84 123 4567" {...field} data-testid="input-telefone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="enderecoEntrega"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="uppercase text-xs font-semibold">
                                Endereço de Entrega
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Av. Julius Nyerere, 123"
                                  {...field}
                                  data-testid="input-endereco"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="cidadeEntrega"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="uppercase text-xs font-semibold">
                                  Cidade
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Maputo" {...field} data-testid="input-cidade" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="provinciaEntrega"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="uppercase text-xs font-semibold">
                                  Província
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Maputo Cidade" {...field} data-testid="input-provincia" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button type="submit" className="w-full" size="lg" data-testid="button-continue-payment">
                          Continuar para Pagamento
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-4 text-sm">
                          <div>
                            <p className="font-semibold mb-1">Dados de Entrega:</p>
                            <p className="text-muted-foreground">
                              {form.getValues("nomeCliente")}
                              <br />
                              {form.getValues("emailCliente")}
                              <br />
                              {form.getValues("telefoneCliente")}
                              <br />
                              {form.getValues("enderecoEntrega")}, {form.getValues("cidadeEntrega")},{" "}
                              {form.getValues("provinciaEntrega")}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(1)}
                            data-testid="button-edit-details"
                          >
                            Editar Dados
                          </Button>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <p className="font-semibold text-sm uppercase tracking-wider">
                            Método de Pagamento
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Você será redirecionado para a plataforma PaySuite para completar o
                            pagamento com M-Pesa, e-Mola ou cartão.
                          </p>
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          size="lg"
                          disabled={isProcessing}
                          data-testid="button-process-payment"
                        >
                          {isProcessing ? "Processando..." : "Proceder ao Pagamento"}
                        </Button>
                      </>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
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
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span data-testid="text-checkout-subtotal">{subtotalFormatado}</span>
                  </div>
                  {desconto > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto</span>
                      <span>-{desconto} MZN</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span data-testid="text-checkout-total">{totalFormatado}</span>
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
