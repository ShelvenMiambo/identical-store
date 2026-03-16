import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, Collection, Category } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

/* ─── tipos locais ─── */
type ProductForm = {
    nome: string;
    slug: string;
    descricao: string;
    preco: string;
    precoPromocional: string;   // vazio = sem promoção
    collectionId: string;
    categoryId: string;
    tamanhos: string[];
    cores: string[];
    imagens: string[];
    estoque: string;
    destaque: boolean;
    novo: boolean;
    ativo: boolean;
};

const EMPTY_FORM: ProductForm = {
    nome: "", slug: "", descricao: "", preco: "", precoPromocional: "",
    collectionId: "", categoryId: "",
    tamanhos: [], cores: [], imagens: [],
    estoque: "10", destaque: false, novo: false, ativo: true,
};

export default function ProductsPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    /* ── Queries ── */
    const { data: products = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
    const { data: collections = [] } = useQuery<Collection[]>({ queryKey: ["/api/collections"] });
    const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["/api/categories"] });

    /* ── UI state ── */
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form, setForm] = useState<ProductForm>(EMPTY_FORM);

    /* ── Mutations: produtos ── */
    const createProductMutation = useMutation({
        mutationFn: (data: any) => apiRequest("POST", "/api/admin/products", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Produto criado com sucesso!" });
            setSheetOpen(false);
        },
        onError: (e: any) => toast({ title: "Erro ao criar produto", description: e.message, variant: "destructive" }),
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            apiRequest("PUT", `/api/admin/products/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Produto atualizado com sucesso!" });
            setSheetOpen(false);
        },
        onError: (e: any) => toast({ title: "Erro ao atualizar produto", description: e.message, variant: "destructive" }),
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Produto eliminado!" });
        },
        onError: (e: any) => toast({ title: "Erro ao eliminar produto", description: e.message, variant: "destructive" }),
    });

    /* ── Mutations: coleções e categorias inline ── */
    const createCollectionMutation = useMutation({
        mutationFn: async (nome: string) => {
            const slug = nome.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
            return apiRequest("POST", "/api/admin/collections", { nome, slug, ativo: true, ordem: 0 });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/collections"] }),
        onError: (e: any) => toast({ title: "Erro ao criar coleção", description: e.message, variant: "destructive" }),
    });

    const createCategoryMutation = useMutation({
        mutationFn: async (nome: string) => {
            const slug = nome.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
            return apiRequest("POST", "/api/admin/categories", { nome, slug, ativo: true });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/categories"] }),
        onError: (e: any) => toast({ title: "Erro ao criar categoria", description: e.message, variant: "destructive" }),
    });

    /* ── Handlers ── */
    const openNew = () => {
        setEditingProduct(null);
        setForm(EMPTY_FORM);
        setSheetOpen(true);
    };

    const openEdit = (product: Product) => {
        setEditingProduct(product);
        setForm({
            nome: product.nome,
            slug: product.slug,
            descricao: product.descricao || "",
            preco: product.preco,
            precoPromocional: (product as any).precoPromocional || "",
            collectionId: product.collectionId || "",
            categoryId: (product as any).categoryId || "",
            tamanhos: product.tamanhos || [],
            cores: product.cores || [],
            imagens: product.imagens || [],
            estoque: product.estoque?.toString() || "10",
            destaque: product.destaque,
            novo: product.novo,
            ativo: product.ativo,
        });
        setSheetOpen(true);
    };

    const handleSave = () => {
        const data = {
            ...form,
            estoque: parseInt(form.estoque) || 10,
            precoPromocional: form.precoPromocional.trim() ? form.precoPromocional.trim() : null,
        };
        if (editingProduct) {
            updateProductMutation.mutate({ id: editingProduct.id, data });
        } else {
            createProductMutation.mutate(data);
        }
    };

    const isSaving = createProductMutation.isPending || updateProductMutation.isPending;

    /* ── Upload de imagem ── */
    const handleImageUpload = async (files: FileList | null) => {
        if (!files) return;
        for (const file of Array.from(files)) {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const resp = await apiRequest("POST", "/api/admin/upload-base64", {
                        filename: file.name,
                        dataUrl: reader.result as string,
                        tipo: "produto",
                    });
                    if (!resp?.url) throw new Error("URL não recebido do servidor");
                    setForm(prev => ({ ...prev, imagens: [...prev.imagens, resp.url] }));
                    toast({ title: "Imagem carregada", description: file.name });
                } catch (err: any) {
                    toast({ title: "Falha no upload", description: `${file.name}: ${err.message}`, variant: "destructive" });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const fmt = (v: string) =>
        new Intl.NumberFormat("pt-MZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(v)) + " MZN";

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Gestão de Produtos
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Adicionar, editar e gerir produtos da loja
                </p>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle>Produtos ({products.length})</CardTitle>
                    <Button onClick={openNew} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Produto
                    </Button>
                </CardHeader>

                <CardContent>
                    {products.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            Nenhum produto encontrado. Adicione o primeiro produto!
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="hidden sm:table-cell">Imagem</TableHead>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Preço</TableHead>
                                        <TableHead className="hidden md:table-cell">Estoque</TableHead>
                                        <TableHead className="hidden sm:table-cell">Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="hidden sm:table-cell">
                                                <img
                                                    src={product.imagens[0] || ""}
                                                    alt={product.nome}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            </TableCell>
                                            <TableCell className="font-semibold max-w-[150px] truncate">
                                                {product.nome}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {(product as any).precoPromocional ? (
                                                    <div>
                                                        <span className="line-through text-muted-foreground text-xs">{fmt(product.preco)}</span>
                                                        <br />
                                                        <span className="font-bold text-orange-600">{fmt((product as any).precoPromocional)}</span>
                                                    </div>
                                                ) : (
                                                    fmt(product.preco)
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">{product.estoque || 0}</TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <div className="flex flex-wrap gap-1">
                                                    <Badge variant={product.ativo ? "default" : "secondary"} className="text-xs">
                                                        {product.ativo ? "Ativo" : "Inativo"}
                                                    </Badge>
                                                    {product.destaque && <Badge variant="outline" className="text-xs border-amber-400 text-amber-600">⭐ Destaque</Badge>}
                                                    {product.novo && <Badge variant="outline" className="text-xs border-blue-400 text-blue-600">🆕 Novo</Badge>}
                                                    {(product as any).precoPromocional && <Badge variant="outline" className="text-xs border-orange-400 text-orange-600">🏷️ Promo</Badge>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-1 justify-end">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => openEdit(product)}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => {
                                                            if (confirm("Tem certeza que deseja eliminar este produto?")) {
                                                                deleteProductMutation.mutate(product.id);
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

            {/* ══ Sheet lateral ══
                Usado em vez de Dialog para evitar conflitos de portal com
                Popover (ComboboxCreatable) aninhado — resolve o bug de
                coleções/categorias não aparecerem e switches com erro.
            */}
            <Sheet open={sheetOpen} onOpenChange={(v) => { setSheetOpen(v); if (!v) setEditingProduct(null); }}>
                <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
                    <SheetHeader className="mb-5">
                        <SheetTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</SheetTitle>
                        <SheetDescription>Preencha os detalhes do produto abaixo</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4">
                        {/* Nome + Slug */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pf-nome">Nome do Produto *</Label>
                                <Input
                                    id="pf-nome"
                                    value={form.nome}
                                    onChange={(e) => {
                                        const nome = e.target.value;
                                        setForm(prev => ({
                                            ...prev,
                                            nome,
                                            slug: editingProduct
                                                ? prev.slug
                                                : nome.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                                        }));
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pf-slug">Slug (URL) *</Label>
                                <Input
                                    id="pf-slug"
                                    value={form.slug}
                                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Descrição */}
                        <div className="space-y-2">
                            <Label htmlFor="pf-desc">Descrição</Label>
                            <Textarea
                                id="pf-desc"
                                value={form.descricao}
                                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                                rows={3}
                            />
                        </div>

                        {/* Preço + Estoque */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pf-preco">Preço (MZN) *</Label>
                                <Input
                                    id="pf-preco"
                                    type="number"
                                    value={form.preco}
                                    onChange={(e) => setForm({ ...form, preco: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pf-estoque">Estoque</Label>
                                <Input
                                    id="pf-estoque"
                                    type="number"
                                    value={form.estoque}
                                    onChange={(e) => setForm({ ...form, estoque: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Preço Promocional (opcional) */}
                        <div className="space-y-2 p-3 rounded-lg border border-dashed border-orange-300 bg-orange-50 dark:bg-orange-950/20">
                            <Label htmlFor="pf-promo" className="text-orange-700 dark:text-orange-400 font-semibold flex items-center gap-2">
                                🏷️ Preço Promocional (MZN)
                                <span className="font-normal text-xs text-muted-foreground">— deixe vazio para sem promoção</span>
                            </Label>
                            <Input
                                id="pf-promo"
                                type="number"
                                placeholder="Ex: 850 (preço original ficará riscado)"
                                value={form.precoPromocional}
                                onChange={(e) => setForm({ ...form, precoPromocional: e.target.value })}
                                className="border-orange-200 focus:border-orange-400"
                            />
                            {form.precoPromocional && parseFloat(form.precoPromocional) > 0 && (
                                <p className="text-xs text-orange-600 dark:text-orange-400">
                                    ✅ Na loja: <span className="line-through text-muted-foreground">{form.preco} MZN</span> → <strong>{form.precoPromocional} MZN</strong>
                                </p>
                            )}
                        </div>

                        {/* Coleção — select nativo + criar inline */}
                        <div className="space-y-2">
                            <Label htmlFor="pf-col">Coleção</Label>
                            <select
                                id="pf-col"
                                value={form.collectionId}
                                onChange={(e) => setForm({ ...form, collectionId: e.target.value })}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="">— Sem coleção —</option>
                                {collections.map(c => (
                                    <option key={c.id} value={c.id}>{c.nome}</option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <Input
                                    id="pf-col-new"
                                    placeholder="Criar nova coleção..."
                                    className="h-8 text-xs"
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                            e.preventDefault();
                                            const result = await createCollectionMutation.mutateAsync(e.currentTarget.value.trim());
                                            setForm(prev => ({ ...prev, collectionId: result.id }));
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs px-2 shrink-0"
                                    type="button"
                                    onClick={async (e) => {
                                        const input = document.getElementById('pf-col-new') as HTMLInputElement;
                                        if (input?.value.trim()) {
                                            const result = await createCollectionMutation.mutateAsync(input.value.trim());
                                            setForm(prev => ({ ...prev, collectionId: result.id }));
                                            input.value = '';
                                        }
                                    }}
                                    disabled={createCollectionMutation.isPending}
                                >
                                    + Criar
                                </Button>
                            </div>
                        </div>

                        {/* Categoria — select nativo + criar inline */}
                        <div className="space-y-2">
                            <Label htmlFor="pf-cat">Categoria</Label>
                            <select
                                id="pf-cat"
                                value={form.categoryId}
                                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="">— Sem categoria —</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.nome}</option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <Input
                                    id="pf-cat-new"
                                    placeholder="Criar nova categoria..."
                                    className="h-8 text-xs"
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                            e.preventDefault();
                                            const result = await createCategoryMutation.mutateAsync(e.currentTarget.value.trim());
                                            setForm(prev => ({ ...prev, categoryId: result.id }));
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs px-2 shrink-0"
                                    type="button"
                                    onClick={async () => {
                                        const input = document.getElementById('pf-cat-new') as HTMLInputElement;
                                        if (input?.value.trim()) {
                                            const result = await createCategoryMutation.mutateAsync(input.value.trim());
                                            setForm(prev => ({ ...prev, categoryId: result.id }));
                                            input.value = '';
                                        }
                                    }}
                                    disabled={createCategoryMutation.isPending}
                                >
                                    + Criar
                                </Button>
                            </div>
                        </div>

                        {/* Tamanhos */}
                        <div className="space-y-2">
                            <Label>Tamanhos Disponíveis</Label>
                            <div className="flex flex-wrap gap-2">
                                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                                    <Button
                                        key={size}
                                        type="button"
                                        variant={form.tamanhos.includes(size) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                            const tamanhos = form.tamanhos.includes(size)
                                                ? form.tamanhos.filter(s => s !== size)
                                                : [...form.tamanhos, size];
                                            setForm({ ...form, tamanhos });
                                        }}
                                    >
                                        {size}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Cores */}
                        <div className="space-y-2">
                            <Label>Cores Disponíveis</Label>
                            <div className="flex flex-wrap gap-2">
                                {["Preto", "Branco", "Creme", "Cinza", "Azul", "Vermelho"].map((cor) => (
                                    <Button
                                        key={cor}
                                        type="button"
                                        variant={form.cores.includes(cor) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                            const cores = form.cores.includes(cor)
                                                ? form.cores.filter(c => c !== cor)
                                                : [...form.cores, cor];
                                            setForm({ ...form, cores });
                                        }}
                                    >
                                        {cor}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Imagens */}
                        <div className="space-y-3">
                            <Label>Imagens do Produto</Label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {form.imagens.map((url, index) => (
                                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const imgs = [...form.imagens];
                                                imgs.splice(index, 1);
                                                setForm({ ...form, imagens: imgs });
                                            }}
                                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                        {index === 0 && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-[10px] py-0.5 text-center font-medium">
                                                Principal
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-primary/5 transition-all"
                                >
                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Upload</span>
                                </button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ""; }}
                            />
                            <p className="text-[11px] text-muted-foreground">A primeira imagem será usada como capa do produto.</p>
                        </div>

                        {/* Toggles: Destaque / Novo / Ativo */}
                        <div className="flex flex-col gap-3 pt-3 border-t">
                            {[
                                { id: "pf-destaque", label: "⭐ Produto em Destaque", field: "destaque" as const },
                                { id: "pf-novo", label: "🆕 Produto Novo", field: "novo" as const },
                                { id: "pf-ativo", label: "✅ Produto Ativo", field: "ativo" as const },
                            ].map(({ id, label, field }) => (
                                <div key={id} className="flex items-center justify-between rounded-lg border p-3">
                                    <Label htmlFor={id} className="text-sm cursor-pointer">{label}</Label>
                                    <Switch
                                        id={id}
                                        checked={form[field] as boolean}
                                        onCheckedChange={(checked) => setForm({ ...form, [field]: checked })}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <SheetFooter className="flex-col sm:flex-row gap-2 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setSheetOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !form.nome || !form.preco}
                            className="w-full sm:w-auto"
                        >
                            {isSaving ? "A guardar..." : editingProduct ? "Atualizar Produto" : "Criar Produto"}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
