import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
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
import { Redirect, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { ChevronDown, CheckCircle2, Upload, FileImage, FileText, X, Phone, Copy, Check } from "lucide-react";

/* ─── Províncias ─── */
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
    color: "border-red-300 bg-red-50 dark:bg-red-950/20",
    activeColor: "border-red-600 bg-red-100 dark:bg-red-900/40 ring-2 ring-red-400",
    instructions: "Transfira o valor total para o número M-Pesa indicado abaixo e anexe o comprovativo de pagamento para validação da encomenda.",
    icon: (
      <svg viewBox="0 0 80 36" className="h-8 w-auto" fill="none">
        <rect width="80" height="36" rx="6" fill="#E31837" />
        <text x="8" y="23" fill="white" fontWeight="bold" fontSize="12" fontFamily="Arial">M-PESA</text>
      </svg>
    ),
  },
  {
    id: "emola",
    label: "e-Mola",
    desc: "Movitel e-Mola",
    color: "border-green-300 bg-green-50 dark:bg-green-950/20",
    activeColor: "border-green-600 bg-green-100 dark:bg-green-900/40 ring-2 ring-green-400",
    instructions: "Transfira o valor total para o número e-Mola indicado abaixo e anexe o comprovativo de pagamento para validação da encomenda.",
    icon: (
      <svg viewBox="0 0 80 36" className="h-8 w-auto" fill="none">
        <rect width="80" height="36" rx="6" fill="#00A651" />
        <text x="10" y="23" fill="white" fontWeight="bold" fontSize="12" fontFamily="Arial">e-Mola</text>
      </svg>
    ),
  },
  {
    id: "mbim",
    label: "Conta Bancária",
    desc: "Transferência — Millennium BIM",
    color: "border-blue-300 bg-blue-50 dark:bg-blue-950/20",
    activeColor: "border-blue-600 bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-400",
    instructions: "Realize uma transferência bancária para a conta Millennium BIM indicada abaixo e anexe o comprovativo de pagamento para validação da encomenda.",
    icon: (
      <svg viewBox="0 0 80 36" className="h-8 w-auto" fill="none">
        <rect width="80" height="36" rx="6" fill="#003087" />
        <text x="4" y="14" fill="white" fontWeight="bold" fontSize="7" fontFamily="Arial">MILLENNIUM</text>
        <text x="22" y="27" fill="#FFD700" fontWeight="bold" fontSize="11" fontFamily="Arial">BIM</text>
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
  const [step, setStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
  const [comprovantePreview, setComprovantePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [, setLocation] = useLocation();

  const handleCopyNumber = (number: string) => {
    navigator.clipboard.writeText(number).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Buscar números de pagamento configurados pelo admin
  const { data: siteSettings } = useQuery<any>({ queryKey: ["/api/settings"] });
  const paymentContacts: Record<string, string> = siteSettings?.paymentContacts ?? {};

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

  /* ── Handle comprovativo file ── */
  const handleComprovanteSelect = (file: File) => {
    setComprovanteFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setComprovantePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setComprovantePreview(null); // PDF ou outro
    }
  };

  /* ── Upload do comprovativo para o servidor ── */
  const uploadComprovativo = async (): Promise<string | null> => {
    if (!comprovanteFile) return null;
    setIsUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(comprovanteFile);
      });
      const resp = await apiRequest("POST", "/api/upload/comprovativo", {
        filename: comprovanteFile.name,
        dataUrl,
      });
      return resp.url as string;
    } catch (e: any) {
      toast({ title: "Erro ao enviar comprovativo", description: e.message, variant: "destructive" });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  /* ── Submit passo 1 → 2 ── */
  const onSubmitStep1 = () => setStep(2);

  /* ── Passo 2 → 3 ── */
  const goToStep3 = () => {
    if (!selectedPayment) {
      toast({ title: "Seleciona o método de pagamento", variant: "destructive" });
      return;
    }
    setStep(3);
  };

  /* ── Confirmar pedido (passo 3 → submit) ── */
  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      // Upload comprovativo
      const comprovanteUrl = await uploadComprovativo();

      const data = form.getValues();
      const result = await apiRequest("POST", "/api/checkout", {
        ...data,
        items: cartItems,
        total,
        subtotal,
        desconto: 0,
        metodoPagamento: selectedPayment,
        comprovanteUrl: comprovanteUrl ?? undefined,
      });

      if (onClearCart) onClearCart();

      const metodo = PAYMENT_METHODS.find(m => m.id === selectedPayment)?.label ?? selectedPayment;
      toast({
        title: "✅ Pedido enviado com sucesso!",
        description: `Comprovativo ${comprovanteUrl ? "enviado" : "não anexado"}. A equipa ID≠NTICAL irá verificar o pagamento ${metodo} e confirmar o pedido.`,
      });

      setTimeout(() => {
        setLocation(result.order_url || `/pedido/${result.order?.id}`);
      }, 1500);
    } catch (error: any) {
      const msg = error?.message || "";
      let friendlyMsg = "Ocorreu um erro ao processar o pedido. Por favor, tente novamente.";
      if (msg.includes("network") || msg.includes("fetch"))
        friendlyMsg = "Sem ligação à internet. Verifica a tua conexão e tenta novamente.";
      else if (msg.includes("timeout"))
        friendlyMsg = "O servidor demorou demasiado a responder. Tenta novamente em instantes.";
      else if (msg.includes("400") || msg.includes("invalid"))
        friendlyMsg = "Dados inválidos. Verifica os campos preenchidos e tenta novamente.";
      else if (msg.includes("401") || msg.includes("unauthorized"))
        friendlyMsg = "A tua sessão expirou. Por favor, faz login novamente.";
      else if (msg.includes("500"))
        friendlyMsg = "Erro interno do servidor. A equipa já foi notificada. Tenta novamente mais tarde.";
      toast({
        title: "❌ Não foi possível processar o pedido",
        description: friendlyMsg,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) return <Redirect to="/loja" />;

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === selectedPayment);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header + passos */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
            Finalizar Compra
          </h1>
          <div className="flex items-center gap-2 text-sm flex-wrap">
            {[
              { n: 1, label: "Dados" },
              { n: 2, label: "Pagamento" },
              { n: 3, label: "Comprovativo" },
            ].map(({ n, label }, i, arr) => (
              <span key={n} className="flex items-center gap-2">
                <span className={`flex items-center gap-1 ${step >= n ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold
                    ${step > n ? "bg-primary text-white" : step === n ? "bg-primary/20 text-primary border border-primary" : "bg-muted text-muted-foreground"}`}>
                    {step > n ? "✓" : n}
                  </span>
                  {label}
                </span>
                {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse md:grid md:grid-cols-3 gap-6 md:gap-8">

          {/* ══ Form principal ══ */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 ? "Dados de Entrega"
                    : step === 2 ? "Método de Pagamento"
                      : "Comprovativo de Pagamento"}
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
                            <Input placeholder="Ex: João Manuel Silva" {...field} />
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
                              <Input type="tel" placeholder="Ex: 84 123 4567" {...field} />
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
                              <Input type="email" placeholder="Ex: joao@gmail.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="enderecoEntrega" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs font-semibold">
                            Endereço / Bairro <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Bairro Polana Cimento, perto do mercado X" {...field} />
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
                              <Input placeholder="Ex: Maputo, Matola…" {...field} />
                            </FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="provinciaEntrega" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="uppercase text-xs font-semibold">
                              Província <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <select {...field}
                                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 pr-8">
                                  <option value="" disabled>— Escolhe a tua província —</option>
                                  {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <p className="text-xs text-muted-foreground"><span className="text-red-500">*</span> Campos obrigatórios</p>
                      <Button type="submit" className="w-full" size="lg">Continuar →</Button>
                    </form>
                  </Form>
                )}

                {/* ── PASSO 2: Escolha o método ── */}
                {step === 2 && (
                  <div className="space-y-6">
                    {/* Resumo dados */}
                    <div className="text-sm bg-slate-50 dark:bg-slate-800/40 rounded-lg p-4 border space-y-1">
                      <p className="font-semibold mb-1">Dados de Entrega:</p>
                      <p><span className="text-muted-foreground">Nome:</span> {form.getValues("nomeCliente")}</p>
                      <p><span className="text-muted-foreground">Tel.:</span> {form.getValues("telefoneCliente")}</p>
                      <p><span className="text-muted-foreground">Morada:</span> {form.getValues("enderecoEntrega")}{form.getValues("cidadeEntrega") ? `, ${form.getValues("cidadeEntrega")}` : ""} — {form.getValues("provinciaEntrega")}</p>
                      <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setStep(1)}>✏️ Editar</Button>
                    </div>
                    <Separator />
                    <div>
                      <p className="font-semibold text-sm uppercase tracking-wider mb-4">Método de Pagamento</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {PAYMENT_METHODS.map((method) => {
                          const isSelected = selectedPayment === method.id;
                          const contactNo = paymentContacts[method.id];
                          return (
                            <button key={method.id} type="button"
                              onClick={() => setSelectedPayment(method.id)}
                              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer
                                ${isSelected ? method.activeColor : method.color + " hover:shadow-md"}`}>
                              {isSelected && <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-green-600" />}
                              {method.icon}
                              <div className="text-center">
                                <p className="font-bold text-sm">{method.label}</p>
                                <p className="text-xs text-muted-foreground">{method.desc}</p>
                                {contactNo && (
                                  <p className="text-xs font-bold mt-1.5 flex items-center justify-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {contactNo}
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <Button className="w-full" size="lg" onClick={goToStep3} disabled={!selectedPayment}>
                      {selectedPayment ? `Continuar com ${selectedMethod?.label} →` : "Seleciona um método"}
                    </Button>
                  </div>
                )}

                {/* ── PASSO 3: Upload comprovativo ── */}
                {step === 3 && (
                  <div className="space-y-6">
                    {/* Instrução do método escolhido + número de contacto + botão copiar */}
                    <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${selectedMethod?.activeColor}`}>
                      <div className="shrink-0">{selectedMethod?.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold">{selectedMethod?.label}</p>
                        <p className="text-sm text-muted-foreground mt-1">{selectedMethod?.instructions}</p>
                        {selectedPayment && paymentContacts[selectedPayment] ? (
                          <div className="mt-3 flex items-center justify-between gap-2 bg-white/70 dark:bg-black/30 rounded-lg px-3 py-2.5 border">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Efectue o pagamento para:</p>
                                <p className="font-bold text-base tracking-widest">{paymentContacts[selectedPayment]}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyNumber(paymentContacts[selectedPayment])}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shrink-0"
                            >
                              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                              {copied ? "Copiado!" : "Copiar"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                      <button type="button" className="ml-auto shrink-0 text-xs text-muted-foreground hover:text-foreground underline" onClick={() => setStep(2)}>
                        Alterar
                      </button>
                    </div>

                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm">
                      <p className="font-semibold mb-1">📋 Instruções de Pagamento</p>
                      <p>Após efectuar a transferência, anexe abaixo o <strong>comprovativo</strong> (screenshot ou PDF).
                        A nossa equipa irá verificar o pagamento e confirmar a encomenda em breve.
                        Caso não consiga anexar o comprovativo agora, pode enviá-lo posteriormente pelo WhatsApp.</p>
                    </div>

                    {/* Upload area */}
                    <div>
                      <p className="font-semibold text-sm uppercase tracking-wider mb-3">
                        Anexar Comprovativo <span className="text-muted-foreground font-normal normal-case">(recomendado)</span>
                      </p>

                      {!comprovanteFile ? (
                        <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                          <Upload className="h-10 w-10 text-muted-foreground" />
                          <div className="text-center">
                            <p className="font-medium">Clica para anexar o comprovativo</p>
                            <p className="text-sm text-muted-foreground mt-1">Imagem (JPG, PNG, WEBP) ou PDF — qualquer ficheiro até 25 MB</p>
                          </div>
                          <input type="file" accept="image/*,.pdf" className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleComprovanteSelect(f);
                            }} />
                        </label>
                      ) : (
                        <div className="relative border rounded-xl p-4 bg-muted/30">
                          <Button type="button" variant="destructive" size="icon"
                            className="absolute top-2 right-2 h-7 w-7"
                            onClick={() => { setComprovanteFile(null); setComprovantePreview(null); }}>
                            <X className="h-4 w-4" />
                          </Button>

                          {comprovantePreview ? (
                            <img src={comprovantePreview} alt="Pré-visualização" className="max-h-48 rounded-lg object-contain mx-auto" />
                          ) : (
                            <div className="flex items-center gap-3">
                              <FileText className="h-10 w-10 text-red-500" />
                              <div>
                                <p className="font-medium text-sm">{comprovanteFile.name}</p>
                                <p className="text-xs text-muted-foreground">{(comprovanteFile.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-green-600 mt-3 font-medium text-center">✅ Comprovativo pronto para enviar</p>
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleConfirmPayment}
                      disabled={isProcessing || isUploading}
                      data-testid="button-process-payment"
                    >
                      {isUploading ? "A enviar comprovativo…"
                        : isProcessing ? "A enviar pedido…"
                          : comprovanteFile ? "✅ Confirmar Pedido com Comprovativo"
                            : "Confirmar Pedido (sem comprovativo)"}
                    </Button>
                    {!comprovanteFile && (
                      <p className="text-xs text-center text-muted-foreground">
                        Podes confirmar sem comprovativo, mas o processo pode demorar mais tempo.
                      </p>
                    )}
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

          {/* ══ Resumo do Pedido ══ */}
          <div>
            <Card className="sticky top-24">
              <CardHeader><CardTitle>Resumo do Pedido</CardTitle></CardHeader>
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
                        <p className="text-xs font-semibold mt-0.5">{fmt(parseFloat(item.precoProduto) * item.quantidade)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{fmt(total)}</span>
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
