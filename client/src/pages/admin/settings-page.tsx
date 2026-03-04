import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  banners: string[];
  highlights: { title: string; description?: string; image?: string }[];
}

export default function SettingsAdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const [form, setForm] = useState<SiteSettings>({
    heroTitle: "",
    heroSubtitle: "",
    banners: [],
    highlights: [],
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<SiteSettings>) => apiRequest("PUT", "/api/admin/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Configurações atualizadas" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    },
  });

  const handleUploadBanner = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const resp = await apiRequest("POST", "/api/admin/upload-base64", {
          filename: file.name,
          dataUrl,
        });
        const url = resp.url;
        setForm((prev) => ({ ...prev, banners: [...prev.banners, url] }));
        toast({ title: "Imagem carregada" });
      } catch (err: any) {
        toast({ title: "Falha no upload", description: err.message, variant: "destructive" });
      }
    };
    reader.readAsDataURL(file);
  };

  const removeBanner = (idx: number) => {
    setForm((prev) => ({ ...prev, banners: prev.banners.filter((_, i) => i !== idx) }));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Configurações da Página Inicial</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Alterar banners/carrossel, textos e destaques da homepage
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Hero (Título e Subtítulo)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="heroTitle">Título</Label>
            <Input id="heroTitle" value={form.heroTitle}
              onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroSubtitle">Subtítulo</Label>
            <Textarea id="heroSubtitle" rows={3} value={form.heroSubtitle}
              onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} />
          </div>
          <Button onClick={() => saveMutation.mutate({ heroTitle: form.heroTitle, heroSubtitle: form.heroSubtitle })}>
            Guardar Texto
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Banners do Carrossel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {form.banners.map((url, idx) => (
              <div key={idx} className="relative">
                <img src={url} alt="banner" className="w-40 h-24 object-cover rounded" />
                <Button variant="destructive" size="sm" className="absolute top-2 right-2"
                  onClick={() => removeBanner(idx)}>Remover</Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <Button onClick={() => fileInputRef.current?.click()}>Carregar Imagem</Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUploadBanner(f);
                e.currentTarget.value = "";
              }} />
            <Button variant="outline" onClick={() => saveMutation.mutate({ banners: form.banners })}>Guardar Banners</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Destaques (opcional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.highlights.map((h, idx) => (
            <div key={idx} className="grid md:grid-cols-3 gap-3">
              <Input placeholder="Título" value={h.title}
                onChange={(e) => setForm({ ...form, highlights: form.highlights.map((x, i) => i === idx ? { ...x, title: e.target.value } : x) })} />
              <Input placeholder="Imagem (URL)" value={h.image ?? ""}
                onChange={(e) => setForm({ ...form, highlights: form.highlights.map((x, i) => i === idx ? { ...x, image: e.target.value } : x) })} />
              <Input placeholder="Descrição" value={h.description ?? ""}
                onChange={(e) => setForm({ ...form, highlights: form.highlights.map((x, i) => i === idx ? { ...x, description: e.target.value } : x) })} />
            </div>
          ))}
          <div className="flex gap-2">
            <Button onClick={() => setForm({ ...form, highlights: [...form.highlights, { title: "" }] })}>Adicionar Destaque</Button>
            <Button variant="outline" onClick={() => saveMutation.mutate({ highlights: form.highlights })}>Guardar Destaques</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
