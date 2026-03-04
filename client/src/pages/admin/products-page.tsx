import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, Collection, Category } from "@shared/schema";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, X, Upload } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useRef } from "react";

export default function ProductsPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: products = [] } = useQuery<Product[]>({
        queryKey: ["/api/products"],
    });

    const { data: collections = [] } = useQuery<Collection[]>({
        queryKey: ["/api/collections"],
    });

    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ["/api/categories"],
    });

    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Product form state
    const [productForm, setProductForm] = useState({
        nome: "",
        slug: "",
        descricao: "",
        preco: "",
        collectionId: "",
        categoryId: "",
        tamanhos: [] as string[],
        cores: [] as string[],
        imagens: [] as string[],
        estoque: "10",
        destaque: false,
        novo: false,
        ativo: true,
    });
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Product mutations
    const createProductMutation = useMutation({
        mutationFn: async (data: any) => apiRequest("POST", "/api/admin/products", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Produto criado com sucesso!" });
            setProductDialogOpen(false);
            resetProductForm();
        },
        onError: (error: any) => {
            toast({ title: "Erro ao criar produto", description: error.message, variant: "destructive" });
        },
    });

    const updateProductMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) =>
            apiRequest("PUT", `/api/admin/products/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Produto atualizado com sucesso!" });
            setProductDialogOpen(false);
            resetProductForm();
        },
        onError: (error: any) => {
            toast({ title: "Erro ao atualizar produto", description: error.message, variant: "destructive" });
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: async (id: string) => apiRequest("DELETE", `/api/admin/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Produto eliminado com sucesso!" });
        },
        onError: (error: any) => {
            toast({ title: "Erro ao eliminar produto", description: error.message, variant: "destructive" });
        },
    });

    const resetProductForm = () => {
        setProductForm({
            nome: "",
            slug: "",
            descricao: "",
            preco: "",
            collectionId: "",
            tamanhos: [],
            cores: [],
            imagens: [],
            estoque: "10",
            destaque: false,
            novo: false,
            ativo: true,
        });
        setEditingProduct(null);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setProductForm({
            nome: product.nome,
            slug: product.slug,
            descricao: product.descricao || "",
            preco: product.preco,
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
        setProductDialogOpen(true);
    };

    const handleSaveProduct = () => {
        const data = {
            ...productForm,
            estoque: parseInt(productForm.estoque) || 10,
        };

        if (editingProduct) {
            updateProductMutation.mutate({ id: editingProduct.id, data });
        } else {
            createProductMutation.mutate(data);
        }
    };

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
                    <CardTitle>Produtos</CardTitle>
                    <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetProductForm} className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Produto
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
                                <DialogDescription>
                                    Preencha os detalhes do produto abaixo
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nome">Nome do Produto *</Label>
                                        <Input
                                            id="nome"
                                            value={productForm.nome}
                                            onChange={(e) => {
                                                setProductForm({ ...productForm, nome: e.target.value });
                                                if (!editingProduct) {
                                                    setProductForm({
                                                        ...productForm,
                                                        nome: e.target.value,
                                                        slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                                                    });
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Slug (URL) *</Label>
                                        <Input
                                            id="slug"
                                            value={productForm.slug}
                                            onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="descricao">Descrição</Label>
                                    <Textarea
                                        id="descricao"
                                        value={productForm.descricao}
                                        onChange={(e) => setProductForm({ ...productForm, descricao: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="preco">Preço (MZN) *</Label>
                                        <Input
                                            id="preco"
                                            type="number"
                                            value={productForm.preco}
                                            onChange={(e) => setProductForm({ ...productForm, preco: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="estoque">Estoque</Label>
                                        <Input
                                            id="estoque"
                                            type="number"
                                            value={productForm.estoque}
                                            onChange={(e) => setProductForm({ ...productForm, estoque: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="collectionId">Coleção</Label>
                                    <Select
                                        value={productForm.collectionId}
                                        onValueChange={(value) =>
                                            setProductForm({ ...productForm, collectionId: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecionar coleção" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {collections.map((col) => (
                                                <SelectItem key={col.id} value={col.id}>
                                                    {col.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="categoryId">Categoria</Label>
                                    <Select
                                        value={productForm.categoryId}
                                        onValueChange={(value) =>
                                            setProductForm({ ...productForm, categoryId: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecionar categoria" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tamanhos Disponíveis</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                                            <Button
                                                key={size}
                                                type="button"
                                                variant={productForm.tamanhos.includes(size) ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                    const tamanhos = productForm.tamanhos.includes(size)
                                                        ? productForm.tamanhos.filter((s) => s !== size)
                                                        : [...productForm.tamanhos, size];
                                                    setProductForm({ ...productForm, tamanhos });
                                                }}
                                            >
                                                {size}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Cores Disponíveis</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {["Preto", "Branco", "Cinza", "Azul", "Vermelho"].map((cor) => (
                                            <Button
                                                key={cor}
                                                type="button"
                                                variant={productForm.cores.includes(cor) ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                    const cores = productForm.cores.includes(cor)
                                                        ? productForm.cores.filter((c) => c !== cor)
                                                        : [...productForm.cores, cor];
                                                    setProductForm({ ...productForm, cores });
                                                }}
                                            >
                                                {cor}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label>Imagens do Produto</Label>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {productForm.imagens.map((url, index) => (
                                            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                                                <img
                                                    src={url}
                                                    alt={`Preview ${index}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const novasImagens = [...productForm.imagens];
                                                        novasImagens.splice(index, 1);
                                                        setProductForm({ ...productForm, imagens: novasImagens });
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
                                            className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                                        >
                                            <Upload className="h-6 w-6 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground font-medium">Upload</span>
                                        </button>
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={async (e) => {
                                            const files = Array.from(e.target.files || []);
                                            if (files.length === 0) return;

                                            for (const file of files) {
                                                const reader = new FileReader();
                                                reader.onload = async () => {
                                                    const dataUrl = reader.result as string;
                                                    try {
                                                        const resp = await apiRequest("POST", "/api/admin/upload-base64", {
                                                            filename: file.name,
                                                            dataUrl
                                                        });
                                                        // apiRequest now returns JSON directly
                                                        if (!resp?.url) throw new Error("URL não recebido do servidor");
                                                        setProductForm((prev) => ({
                                                            ...prev,
                                                            imagens: [...prev.imagens, resp.url]
                                                        }));
                                                        toast({ title: "Imagem carregada", description: file.name });
                                                    } catch (err: any) {
                                                        toast({
                                                            title: "Falha no upload",
                                                            description: `Erro ao carregar ${file.name}: ${err.message}`,
                                                            variant: "destructive"
                                                        });
                                                    }
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                            e.target.value = "";
                                        }}
                                    />

                                    <p className="text-[11px] text-muted-foreground">
                                        Dica: A primeira imagem será usada como capa do produto.
                                    </p>
                                </div>


                                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="destaque"
                                            checked={productForm.destaque}
                                            onCheckedChange={(checked) =>
                                                setProductForm({ ...productForm, destaque: checked })
                                            }
                                        />
                                        <Label htmlFor="destaque" className="text-sm">Produto em Destaque</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="novo"
                                            checked={productForm.novo}
                                            onCheckedChange={(checked) =>
                                                setProductForm({ ...productForm, novo: checked })
                                            }
                                        />
                                        <Label htmlFor="novo" className="text-sm">Produto Novo</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="ativo"
                                            checked={productForm.ativo}
                                            onCheckedChange={(checked) =>
                                                setProductForm({ ...productForm, ativo: checked })
                                            }
                                        />
                                        <Label htmlFor="ativo" className="text-sm">Produto Ativo</Label>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="flex-col sm:flex-row gap-2">
                                <Button variant="outline" onClick={() => setProductDialogOpen(false)} className="w-full sm:w-auto">
                                    Cancelar
                                </Button>
                                <Button onClick={handleSaveProduct} className="w-full sm:w-auto">
                                    {editingProduct ? "Atualizar" : "Criar"} Produto
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
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
                                            <TableCell className="font-semibold max-w-[150px] truncate">{product.nome}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {new Intl.NumberFormat("pt-MZ", {
                                                    style: "currency",
                                                    currency: "MZN",
                                                }).format(parseFloat(product.preco))}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">{product.estoque || 0}</TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <Badge variant={product.ativo ? "default" : "secondary"} className="text-xs">
                                                    {product.ativo ? "Ativo" : "Inativo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-1 justify-end">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEditProduct(product)}
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
        </div>
    );
}
