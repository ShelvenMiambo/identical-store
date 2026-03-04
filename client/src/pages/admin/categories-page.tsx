import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Category {
  id: string;
  nome: string;
  slug: string;
  descricao?: string | null;
  ativo: boolean;
}

export default function CategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["/api/categories"] });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ nome: "", slug: "", descricao: "", ativo: true });

  const resetForm = () => {
    setForm({ nome: "", slug: "", descricao: "", ativo: true });
    setEditing(null);
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Categoria criada" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => toast({ title: "Erro ao criar", description: error.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => apiRequest("PUT", `/api/admin/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Categoria atualizada" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Categoria eliminada" });
    },
    onError: (error: any) => toast({ title: "Erro ao eliminar", description: error.message, variant: "destructive" }),
  });

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ nome: cat.nome, slug: cat.slug, descricao: cat.descricao ?? "", ativo: cat.ativo });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Gestão de Categorias</h1>
        <p className="text-slate-600 dark:text-slate-400">Criar, editar e eliminar categorias</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Categorias</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-full sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
                <DialogDescription>Preencha os detalhes abaixo</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cat-nome">Nome *</Label>
                    <Input id="cat-nome" value={form.nome} onChange={(e) => {
                      setForm({ ...form, nome: e.target.value });
                      if (!editing) setForm({ ...form, nome: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") });
                    }} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat-slug">Slug *</Label>
                    <Input id="cat-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-desc">Descrição</Label>
                  <Textarea id="cat-desc" rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="cat-ativo" checked={form.ativo} onCheckedChange={(checked) => setForm({ ...form, ativo: checked })} />
                  <Label htmlFor="cat-ativo">Categoria Ativa</Label>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
                <Button onClick={handleSave} className="w-full sm:w-auto">{editing ? "Atualizar" : "Criar"} Categoria</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma categoria encontrada. Adicione a primeira categoria!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden sm:table-cell">Slug</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-semibold max-w-[150px] truncate">{cat.nome}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground hidden sm:table-cell">{cat.slug}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={cat.ativo ? "default" : "secondary"} className="text-xs">{cat.ativo ? "Ativo" : "Inativo"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(cat)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => { if (confirm("Eliminar esta categoria?")) deleteMutation.mutate(cat.id); }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
