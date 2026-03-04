import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imagemPrincipal = product.imagens[0] || "";
  const precoFormatado = new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
  }).format(parseFloat(product.preco));

  return (
    <Link href={`/produto/${product.slug}`}>
      <a data-testid={`card-product-${product.id}`}>
        <Card className="group overflow-hidden hover-elevate active-elevate-2 cursor-pointer border-0 bg-transparent">
          {/* Product Image */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
            <img
              src={imagemPrincipal}
              alt={product.nome}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {/* Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              {product.novo && (
                <Badge variant="default" className="font-semibold uppercase text-xs">
                  Novo
                </Badge>
              )}
              {product.estoque === 0 && (
                <Badge variant="secondary" className="font-semibold uppercase text-xs">
                  Esgotado
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-4 space-y-1">
            <h3 className="font-semibold text-base leading-tight line-clamp-2" data-testid={`text-product-name-${product.id}`}>
              {product.nome}
            </h3>
            {product.descricao && (
              <p className="text-sm text-muted-foreground line-clamp-1">{product.descricao}</p>
            )}
            <p className="font-bold text-lg pt-1" data-testid={`text-product-price-${product.id}`}>
              {precoFormatado}
            </p>
          </div>
        </Card>
      </a>
    </Link>
  );
}
