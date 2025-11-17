import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, Collection, Order, Coupon } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Plus, Edit, Trash2, Package, ShoppingBag, Ticket, List, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface AdminDashboardProps {
  user?: any;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Redirect if not authenticated or not admin
  if (!user) {
    toast({
      title: "Acesso negado",
      description: "Faça login para acessar esta página",
      variant: "destructive",
    });
    return <Redirect to="/auth" />;
  }

  if (!user.isAdmin) {
    toast({
      title: "Acesso negado",
      description: "Apenas administradores podem acessar esta página",
      variant: "destructive",
    });
    return <Redirect to="/" />;
  }

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    enabled: user?.isAdmin,
  });

  const { data: coupons = [] } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
    enabled: user?.isAdmin,
  });

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // Product form state
  const [productForm, setProductForm] = useState({
    nome: "",
    slug: "",
    descricao: "",
    preco: "",
    precoPromocional: "",
    categoria: "",
    collectionId: "",
    tamanhos: [] as string[],
    cores: [] as string[],
    imagens: [] as string[],
    imagemPrincipal: "",
    estoque: "10",
    destaque: false,
    novo: false,
    ativo: true,
  });

  // Collection form state
  const [collectionForm, setCollectionForm] = useState({
    nome: "",
    slug: "",
    descricao: "",
    imagemCapa: "",
    ativo: true,
  });

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

  // Collection mutations
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

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      apiRequest("PUT", `/api/admin/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Status do pedido atualizado!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    },
  });

  const resetProductForm = () => {
    setProductForm({
      nome: "",
      slug: "",
      descricao: "",
      preco: "",
      precoPromocional: "",
      categoria: "",
      collectionId: "",
      tamanhos: [],
      cores: [],
      imagens: [],
      imagemPrincipal: "",
      estoque: "10",
      destaque: false,
      novo: false,
      ativo: true,
    });
    setEditingProduct(null);
  };

  const resetCollectionForm = () => {
    setCollectionForm({
      nome: "",
      slug: "",
      descricao: "",
      imagemCapa: "",
      ativo: true,
    });
    setEditingCollection(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      nome: product.nome,
      slug: product.slug,
      descricao: product.descricao || "",
      preco: product.preco,
      precoPromocional: product.precoPromocional || "",
      categoria: product.categoria || "",
      collectionId: product.collectionId || "",
      tamanhos: product.tamanhos || [],
      cores: product.cores || [],
      imagens: product.imagens || [],
      imagemPrincipal: product.imagemPrincipal,
      estoque: product.estoque?.toString() || "10",
      destaque: product.destaque,
      novo: product.novo,
      ativo: product.ativo,
    });
    setProductDialogOpen(true);
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setCollectionForm({
      nome: collection.nome,
      slug: collection.slug,
      descricao: collection.descricao || "",
      imagemCapa: collection.imagemCapa || "",
      ativo: collection.ativo,
    });
    setCollectionDialogOpen(true);
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

  const handleSaveCollection = () => {
    if (editingCollection) {
      updateCollectionMutation.mutate({ id: editingCollection.id, data: collectionForm });
    } else {
      createCollectionMutation.mutate(collectionForm);
    }
  };

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pendente").length,
    totalRevenue: orders.reduce((sum, o) => sum + parseFloat(o.total), 0),
  };

  const revenueFormatted = new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
  }).format(stats.totalRevenue);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Gestão da loja IDENTICAL</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pedidos Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {stats.pendingOrders}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueFormatted}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              <Package className="mr-2 h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="collections" data-testid="tab-collections">
              <List className="mr-2 h-4 w-4" />
              Coleções
            </TabsTrigger>
            <TabsTrigger value="coupons" data-testid="tab-coupons">
              <Ticket className="mr-2 h-4 w-4" />
              Cupões
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum pedido encontrado
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden sm:table-cell">Data</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {orders.map((order) => {
                        const totalFormatado = new Intl.NumberFormat("pt-MZ", {
                          style: "currency",
                          currency: "MZN",
                        }).format(parseFloat(order.total));

                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs whitespace-nowrap">
                              #{order.id.slice(0, 8)}
                            </TableCell>
                            <TableCell className="max-w-[120px] truncate">{order.nomeCliente}</TableCell>
                            <TableCell className="font-semibold whitespace-nowrap">{totalFormatado}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  order.status === "confirmado"
                                    ? "default"
                                    : order.status === "entregue"
                                    ? "outline"
                                    : "secondary"
                                }
                                className="uppercase text-xs"
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                              {new Date(order.createdAt).toLocaleDateString("pt-MZ")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedOrder(order)}
                                    data-testid={`button-view-order-${order.id}`}
                                  >
                                    <span className="hidden sm:inline">Ver Detalhes</span>
                                    <span className="sm:hidden">Ver</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Detalhes do Pedido</DialogTitle>
                                    <DialogDescription>
                                      Pedido #{order.id.slice(0, 8)}
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedOrder && (
                                    <div className="space-y-6">
                                      <div>
                                        <Label className="text-sm font-semibold">
                                          Alterar Status
                                        </Label>
                                        <Select
                                          defaultValue={selectedOrder.status}
                                          onValueChange={(status) => {
                                            updateOrderStatusMutation.mutate({
                                              id: selectedOrder.id,
                                              status,
                                            });
                                            setSelectedOrder({ ...selectedOrder, status });
                                          }}
                                        >
                                          <SelectTrigger className="w-full mt-2">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pendente">Pendente</SelectItem>
                                            <SelectItem value="confirmado">Confirmado</SelectItem>
                                            <SelectItem value="enviado">Enviado</SelectItem>
                                            <SelectItem value="entregue">Entregue</SelectItem>
                                            <SelectItem value="cancelado">Cancelado</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <p className="font-semibold mb-2">Cliente</p>
                                          <p className="text-muted-foreground">
                                            {selectedOrder.nomeCliente}
                                            <br />
                                            {selectedOrder.emailCliente}
                                            <br />
                                            {selectedOrder.telefoneCliente}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="font-semibold mb-2">Entrega</p>
                                          <p className="text-muted-foreground">
                                            {selectedOrder.enderecoEntrega}
                                            <br />
                                            {selectedOrder.cidadeEntrega},{" "}
                                            {selectedOrder.provinciaEntrega}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="text-sm">
                                        <p className="font-semibold mb-2">Valor</p>
                                        <div className="space-y-1 text-muted-foreground">
                                          <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>
                                              {new Intl.NumberFormat("pt-MZ", {
                                                style: "currency",
                                                currency: "MZN",
                                              }).format(parseFloat(selectedOrder.subtotal))}
                                            </span>
                                          </div>
                                          <div className="flex justify-between font-bold text-foreground text-base">
                                            <span>Total:</span>
                                            <span>
                                              {new Intl.NumberFormat("pt-MZ", {
                                                style: "currency",
                                                currency: "MZN",
                                              }).format(parseFloat(selectedOrder.total))}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>Gestão de Produtos</CardTitle>
                <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-product" onClick={resetProductForm} className="w-full sm:w-auto">
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

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                          <Label htmlFor="precoPromocional">Preço Promocional (MZN)</Label>
                          <Input
                            id="precoPromocional"
                            type="number"
                            value={productForm.precoPromocional}
                            onChange={(e) =>
                              setProductForm({ ...productForm, precoPromocional: e.target.value })
                            }
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="categoria">Categoria</Label>
                          <Input
                            id="categoria"
                            value={productForm.categoria}
                            onChange={(e) => setProductForm({ ...productForm, categoria: e.target.value })}
                            placeholder="Ex: T-Shirts, Hoodies..."
                          />
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

                      <div className="space-y-2">
                        <Label htmlFor="imagemPrincipal">URL da Imagem Principal *</Label>
                        <Input
                          id="imagemPrincipal"
                          value={productForm.imagemPrincipal}
                          onChange={(e) =>
                            setProductForm({ ...productForm, imagemPrincipal: e.target.value })
                          }
                          placeholder="/attached_assets/produto.jpg"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>URLs de Imagens Adicionais (uma por linha)</Label>
                        <Textarea
                          value={productForm.imagens.join("\n")}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              imagens: e.target.value.split("\n").filter((url) => url.trim()),
                            })
                          }
                          rows={4}
                          placeholder="/attached_assets/produto-1.jpg"
                        />
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
                              src={product.imagemPrincipal}
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
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="mt-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>Gestão de Coleções</CardTitle>
                <Dialog open={collectionDialogOpen} onOpenChange={setCollectionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-collection" onClick={resetCollectionForm} className="w-full sm:w-auto">
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

                      <div className="space-y-2">
                        <Label htmlFor="col-imagem">URL da Imagem de Capa</Label>
                        <Input
                          id="col-imagem"
                          value={collectionForm.imagemCapa}
                          onChange={(e) =>
                            setCollectionForm({ ...collectionForm, imagemCapa: e.target.value })
                          }
                          placeholder="/attached_assets/colecao.jpg"
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
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="mt-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>Gestão de Cupões</CardTitle>
                <Button data-testid="button-add-coupon" className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Cupão
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Gestão de cupões será implementada através da API
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}