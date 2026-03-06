import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Type, Sparkles, Save, Trash2, Plus, Info, CreditCard } from "lucide-react";
import { Link } from "wouter";

interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  banners: string[];
  highlights: { title: string; description?: string; image?: string }[];
  paymentNumbers?: {
    mpesa?: string;
    emola?: string;
    mbim?: string;
  };
}

export default function SettingsAdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const [form, setForm] = useState<SiteSettings>({
    heroTitle: "",
    heroSubtitle: "",
    banners: [],
    highlights: [],
    paymentNumbers: { mpesa: "", emola: "", mbim: "" },
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<SiteSettings>) =>
      apiRequest("PUT", "/api/admin/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Configurações atualizadas com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao guardar", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
          Configurações da Loja
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Textos e destaques da página inicial
        </p>
      </div>

      {/* Info banner — slideshow moved */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-sm">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          As imagens do <strong>Slideshow</strong> são geridas em{" "}
          <Link href="/admin/utilizadores">
            <span className="underline font-semibold cursor-pointer">Utilizadores &amp; Slideshow</span>
          </Link>
          .
        </span>
      </div>

      {/* Hero Text */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="bg-slate-900 text-white p-2 rounded-lg">
            <Type className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Texto do Hero</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Título e subtítulo exibidos no topo da página inicial
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="heroTitle">Título Principal</Label>
            <Input
              id="heroTitle"
              value={form.heroTitle}
              placeholder="Be Different, Be Classic"
              onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroSubtitle">Subtítulo</Label>
            <Textarea
              id="heroSubtitle"
              rows={3}
              value={form.heroSubtitle}
              placeholder="Streetwear moçambicano autêntico…"
              onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
            />
          </div>
          <Button
            className="gap-2"
            onClick={() =>
              saveMutation.mutate({ heroTitle: form.heroTitle, heroSubtitle: form.heroSubtitle })
            }
            disabled={saveMutation.isPending}
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "A guardar…" : "Guardar Texto"}
          </Button>
        </CardContent>
      </Card>

      {/* Highlights */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="bg-slate-900 text-white p-2 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Destaques (opcional)</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Blocos de destaque exibidos na homepage
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.highlights.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Nenhum destaque configurado. Clique em "Adicionar" para criar.
            </p>
          )}
          {form.highlights.map((h, idx) => (
            <div key={idx} className="grid md:grid-cols-3 gap-3 p-3 rounded-lg border bg-slate-50 dark:bg-slate-800/30">
              <Input
                placeholder="Título"
                value={h.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    highlights: form.highlights.map((x, i) =>
                      i === idx ? { ...x, title: e.target.value } : x
                    ),
                  })
                }
              />
              <Input
                placeholder="Imagem (URL)"
                value={h.image ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    highlights: form.highlights.map((x, i) =>
                      i === idx ? { ...x, image: e.target.value } : x
                    ),
                  })
                }
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Descrição"
                  value={h.description ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      highlights: form.highlights.map((x, i) =>
                        i === idx ? { ...x, description: e.target.value } : x
                      ),
                    })
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-500 hover:bg-red-50 shrink-0"
                  onClick={() =>
                    setForm({
                      ...form,
                      highlights: form.highlights.filter((_, i) => i !== idx),
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() =>
                setForm({ ...form, highlights: [...form.highlights, { title: "" }] })
              }
            >
              <Plus className="h-4 w-4" />
              Adicionar Destaque
            </Button>
            <Button
              className="gap-2"
              onClick={() => saveMutation.mutate({ highlights: form.highlights })}
              disabled={saveMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? "A guardar…" : "Guardar Destaques"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Números de Pagamento */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="bg-slate-900 text-white p-2 rounded-lg">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Números de Pagamento</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Números exibidos no checkout para o cliente enviar o pagamento
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mpesa" className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              Número M-Pesa
            </Label>
            <Input
              id="mpesa"
              placeholder="Ex: 84 123 4567"
              value={form.paymentNumbers?.mpesa ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentNumbers: { ...form.paymentNumbers, mpesa: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emola" className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
              Número e-Mola
            </Label>
            <Input
              id="emola"
              placeholder="Ex: 86 123 4567"
              value={form.paymentNumbers?.emola ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentNumbers: { ...form.paymentNumbers, emola: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mbim" className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
              Conta Millennium BIM (NIB / Número)
            </Label>
            <Input
              id="mbim"
              placeholder="Ex: 0001 0000 1234 5678 101 23"
              value={form.paymentNumbers?.mbim ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentNumbers: { ...form.paymentNumbers, mbim: e.target.value },
                })
              }
            />
          </div>
          <Button
            className="gap-2"
            onClick={() =>
              saveMutation.mutate({ paymentNumbers: form.paymentNumbers })
            }
            disabled={saveMutation.isPending}
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "A guardar…" : "Guardar Números"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
