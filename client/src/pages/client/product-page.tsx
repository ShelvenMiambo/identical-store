import { useParams, useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, ZoomIn } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface ProductPageProps {
  onAddToCart?: (item: {
    productId: string;
    nomeProduto: string;
    precoProduto: string;
    quantidade: number;
    tamanho: string;
    cor: string;
    imagemProduto: string;
  }) => void;
}

export default function ProductPage({ onAddToCart }: ProductPageProps) {
  const [, params] = useRoute("/produto/:slug");
  const { toast } = useToast();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const product = products.find((p) => p.slug === params?.slug);

  useEffect(() => {
    if (product?.id) {
      fetch(`/api/products/${product.id}/view`, { method: "POST" });
    }
  }, [product?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-4">
              <Skeleton className="aspect-[3/4] w-full" />
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Produto não encontrado</h1>
          <p className="text-muted-foreground">O produto que procura não existe.</p>
        </div>
      </div>
    );
  }

  const precoFormatado = new Intl.NumberFormat("pt-MZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(product.preco)) + " MZN";

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Selecione um tamanho",
        description: "Por favor, escolha um tamanho antes de adicionar ao carrinho.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedColor) {
      toast({
        title: "Selecione uma cor",
        description: "Por favor, escolha uma cor antes de adicionar ao carrinho.",
        variant: "destructive",
      });
      return;
    }

    if (onAddToCart) {
      onAddToCart({
        productId: product.id,
        nomeProduto: product.nome,
        precoProduto: product.preco,
        quantidade: quantity,
        tamanho: selectedSize,
        cor: selectedColor,
        imagemProduto: product.imagens[0],
      });

      toast({
        title: "Adicionado ao carrinho",
        description: `${product.nome} foi adicionado ao seu carrinho.`,
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted group">
              <img
                src={product.imagens[selectedImageIndex]}
                alt={product.nome}
                className="w-full h-full object-cover"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid="button-zoom-image"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
            </div>

            {/* Thumbnail Gallery */}
            {product.imagens.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.imagens.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all hover-elevate ${selectedImageIndex === index
                        ? "border-primary"
                        : "border-transparent"
                      }`}
                    data-testid={`button-thumbnail-${index}`}
                  >
                    <img
                      src={image}
                      alt={`${product.nome} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <div className="flex gap-2 mb-3">
                {product.novo && (
                  <Badge variant="default" className="uppercase">
                    Novo
                  </Badge>
                )}
                {product.estoque === 0 && (
                  <Badge variant="secondary" className="uppercase">
                    Esgotado
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-product-name">
                {product.nome}
              </h1>
              <p className="text-3xl font-bold" data-testid="text-product-price">
                {precoFormatado}
              </p>
            </div>

            <Separator />

            {/* Description */}
            {product.descricao && (
              <div>
                <p className="text-muted-foreground leading-relaxed">{product.descricao}</p>
              </div>
            )}

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="font-semibold text-sm uppercase tracking-wider">
                  Tamanho
                </label>
                <Link href="/guia-tamanhos">
                  <a className="text-sm text-primary hover:underline flex items-center gap-1" data-testid="link-size-guide">
                    📏 Guia de Tamanhos
                  </a>
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.tamanhos.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    className="min-w-[60px]"
                    onClick={() => setSelectedSize(size)}
                    data-testid={`button-size-${size}`}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div>
              <label className="font-semibold text-sm uppercase tracking-wider block mb-3">
                Cor
              </label>
              <div className="flex flex-wrap gap-2">
                {product.cores.map((color) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    className="min-w-[80px]"
                    onClick={() => setSelectedColor(color)}
                    data-testid={`button-color-${color}`}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="font-semibold text-sm uppercase tracking-wider block mb-3">
                Quantidade
              </label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  data-testid="button-decrease-quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-lg w-12 text-center" data-testid="text-quantity">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={product.estoque > 0 && quantity >= product.estoque}
                  data-testid="button-increase-quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={product.estoque === 0}
              data-testid="button-add-to-cart"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              {product.estoque === 0 ? "Esgotado" : "Adicionar ao Carrinho"}
            </Button>

            {/* Product Details Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="materials">
                <AccordionTrigger>Materiais</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    100% Algodão de alta qualidade. Tecido respirável e confortável para uso diário.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger>Cuidados</AccordionTrigger>
                <AccordionContent>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Lavar à máquina em água fria</li>
                    <li>Não usar lixívia</li>
                    <li>Secar à sombra</li>
                    <li>Passar a ferro em temperatura baixa</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Envio</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Entrega em 3-5 dias úteis para Maputo e arredores. 5-7 dias para outras
                    províncias. Envio grátis em compras acima de 2000 MZN.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
