import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Collection } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, X, Upload } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useRef } from "react";

export default function CollectionsPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: collections = [] } = useQuery<Collection[]>({
        queryKey: ["/api/collections"],
    });

    const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

    const [collectionForm, setCollectionForm] = useState({
        nome: "",
        slug: "",
        descricao: "",
        imagem: "",
        ativo: true,
    });
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const createCollectionMutation = useMutation({
        mutationFn: async (data: any) => apiRequest("POST", "/api/admin/collections", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
            toast({ title: "Coleção criada com sucesso!" });
            setCollectionDialogOpen(false);
            resetCollectionForm();
        },
        onError: (error: any) => {
            toast({ title: "Erro ao criar coleção", description: error.message, variant: "destructive" });
        },
    });

    const updateCollectionMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) =>
            apiRequest("PUT", `/api/admin/collections/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
            toast({ title: "Coleção atualizada com sucesso!" });
            setCollectionDialogOpen(false);
            resetCollectionForm();
        },
        onError: (error: any) => {
            toast({ title: "Erro ao atualizar coleção", description: error.message, variant: "destructive" });
        },
    });

    const deleteCollectionMutation = useMutation({
        mutationFn: async (id: string) => apiRequest("DELETE", `/api/admin/collections/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
            toast({ title: "Coleção eliminada com sucesso!" });
        },
        onError: (error: any) => {
            toast({ title: "Erro ao eliminar coleção", description: error.message, variant: "destructive" });
        },
    });

    const resetCollectionForm = () => {
        setCollectionForm({
            nome: "",
            slug: "",
            descricao: "",
            imagem: "",
            ativo: true,
        });
        setEditingCollection(null);
    };

    const handleEditCollection = (collection: Collection) => {
        setEditingCollection(collection);
        setCollectionForm({
            nome: collection.nome,
            slug: collection.slug,
            descricao: collection.descricao || "",
            imagem: collection.imagem || "",
            ativo: collection.ativo,
        });
        setCollectionDialogOpen(true);
    };

    const handleSaveCollection = () => {
        if (editingCollection) {
            updateCollectionMutation.mutate({ id: editingCollection.id, data: collectionForm });
        } else {
            createCollectionMutation.mutate(collectionForm);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Gestão de Coleções
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Organizar produtos em coleções temáticas
                </p>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle>Coleções</CardTitle>
                    <Dialog open={collectionDialogOpen} onOpenChange={setCollectionDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetCollectionForm} className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Coleção
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-full sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingCollection ? "Editar Coleção" : "Nova Coleção"}
                                </DialogTitle>
                                <DialogDescription>
                                    Preencha os detalhes da coleção abaixo
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="col-nome">Nome da Coleção *</Label>
                                        <Input
                                            id="col-nome"
                                            value={collectionForm.nome}
                                            onChange={(e) => {
                                                setCollectionForm({ ...collectionForm, nome: e.target.value });
                                                if (!editingCollection) {
                                                    setCollectionForm({
                                                        ...collectionForm,
                                                        nome: e.target.value,
                                                        slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                                                    });
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="col-slug">Slug (URL) *</Label>
                                        <Input
                                            id="col-slug"
                                            value={collectionForm.slug}
                                            onChange={(e) =>
                                                setCollectionForm({ ...collectionForm, slug: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="col-descricao">Descrição</Label>
                                    <Textarea
                                        id="col-descricao"
                                        value={collectionForm.descricao}
                                        onChange={(e) =>
                                            setCollectionForm({ ...collectionForm, descricao: e.target.value })
                                        }
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label>Imagem de Capa</Label>

                                    {collectionForm.imagem ? (
                                        <div className="relative group w-full aspect-video rounded-lg overflow-hidden border bg-muted">
                                            <img
                                                src={collectionForm.imagem}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setCollectionForm({ ...collectionForm, imagem: "" })}
                                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                                        >
                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground font-medium">Carregar Imagem</p>
                                                <p className="text-xs text-muted-foreground/60">Recomendado: 1200x600px</p>
                                            </div>
                                        </button>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            const reader = new FileReader();
                                            reader.onload = async () => {
                                                const dataUrl = reader.result as string;
                                                try {
                                                    const resp = await apiRequest("POST", "/api/admin/upload-base64", {
                                                        filename: file.name,
                                                        dataUrl
                                                    });
                                                    setCollectionForm((prev) => ({ ...prev, imagem: resp.url }));
                                                    toast({ title: "Imagem carregada" });
                                                } catch (err: any) {
                                                    toast({
                                                        title: "Falha no upload",
                                                        description: err.message,
                                                        variant: "destructive"
                                                    });
                                                }
                                            };
                                            reader.readAsDataURL(file);
                                            e.target.value = "";
                                        }}
                                    />
                                </div>


                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="col-ativo"
                                        checked={collectionForm.ativo}
                                        onCheckedChange={(checked) =>
                                            setCollectionForm({ ...collectionForm, ativo: checked })
                                        }
                                    />
                                    <Label htmlFor="col-ativo">Coleção Ativa</Label>
                                </div>
                            </div>
                            <DialogFooter className="flex-col sm:flex-row gap-2">
                                <Button variant="outline" onClick={() => setCollectionDialogOpen(false)} className="w-full sm:w-auto">
                                    Cancelar
                                </Button>
                                <Button onClick={handleSaveCollection} className="w-full sm:w-auto">
                                    {editingCollection ? "Atualizar" : "Criar"} Coleção
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {collections.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            Nenhuma coleção encontrada. Adicione a primeira coleção!
                        </p>
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
                                    {collections.map((collection) => (
                                        <TableRow key={collection.id}>
                                            <TableCell className="font-semibold max-w-[150px] truncate">{collection.nome}</TableCell>
                                            <TableCell className="font-mono text-sm text-muted-foreground hidden sm:table-cell">
                                                {collection.slug}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <Badge variant={collection.ativo ? "default" : "secondary"} className="text-xs">
                                                    {collection.ativo ? "Ativo" : "Inativo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-1 justify-end">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEditCollection(collection)}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => {
                                                            if (confirm("Tem certeza que deseja eliminar esta coleção?")) {
                                                                deleteCollectionMutation.mutate(collection.id);
                                                            }
                                                        }}
                                                    >
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
