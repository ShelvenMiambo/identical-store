import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { CartItem } from "@shared/schema";
import { Link } from "wouter";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, tamanho: string, cor: string, newQuantity: number) => void;
  onRemoveItem: (productId: string, tamanho: string, cor: string) => void;
}

export function CartDrawer({
  open,
  onOpenChange,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.precoProduto) * item.quantidade,
    0
  );

  const subtotalFormatado = new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
  }).format(subtotal);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 py-6 border-b">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            Carrinho ({items.length})
          </SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Carrinho vazio</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Adicione produtos para começar a comprar
              </p>
              <Link href="/loja">
                <Button onClick={() => onOpenChange(false)} data-testid="button-continue-shopping">
                  Explorar Produtos
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item, index) => {
                const precoItem = parseFloat(item.precoProduto);
                const totalItem = precoItem * item.quantidade;
                const totalFormatado = new Intl.NumberFormat("pt-MZ", {
                  style: "currency",
                  currency: "MZN",
                }).format(totalItem);

                return (
                  <div key={`${item.productId}-${item.tamanho}-${item.cor}`} data-testid={`cart-item-${index}`}>
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-md bg-muted overflow-hidden flex-shrink-0">
                        <img
                          src={item.imagemProduto}
                          alt={item.nomeProduto}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm leading-tight mb-1" data-testid={`text-cart-item-name-${index}`}>
                          {item.nomeProduto}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {item.tamanho} / {item.cor}
                        </p>
                        <p className="font-bold text-sm" data-testid={`text-cart-item-price-${index}`}>
                          {totalFormatado}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => onRemoveItem(item.productId, item.tamanho, item.cor)}
                        data-testid={`button-remove-item-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-3 ml-24">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          onUpdateQuantity(
                            item.productId,
                            item.tamanho,
                            item.cor,
                            item.quantidade - 1
                          )
                        }
                        disabled={item.quantidade <= 1}
                        data-testid={`button-decrease-quantity-${index}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-12 text-center font-medium" data-testid={`text-quantity-${index}`}>
                        {item.quantidade}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          onUpdateQuantity(
                            item.productId,
                            item.tamanho,
                            item.cor,
                            item.quantidade + 1
                          )
                        }
                        data-testid={`button-increase-quantity-${index}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {index < items.length - 1 && <Separator className="mt-6" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {items.length > 0 && (
          <SheetFooter className="px-6 py-6 border-t mt-auto">
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Subtotal</span>
                <span data-testid="text-cart-subtotal">{subtotalFormatado}</span>
              </div>
              <Link href="/checkout">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => onOpenChange(false)}
                  data-testid="button-checkout"
                >
                  Finalizar Compra
                </Button>
              </Link>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
