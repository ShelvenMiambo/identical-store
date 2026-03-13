import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, LogIn, PackageSearch } from "lucide-react";
import { CartItem } from "@shared/schema";
import { Link } from "wouter";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, tamanho: string, cor: string, newQuantity: number) => void;
  onRemoveItem: (productId: string, tamanho: string, cor: string) => void;
  user?: any;
}

export function CartDrawer({
  open,
  onOpenChange,
  items,
  onUpdateQuantity,
  onRemoveItem,
  user,
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
              <div className="mt-8 pt-8 border-t w-full flex flex-col items-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-semibold">Procuras uma encomenda?</p>
                {user ? (
                   <Link href="/conta">
                     <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => onOpenChange(false)}>
                       <PackageSearch className="h-4 w-4" /> Ver os meus pedidos
                     </Button>
                   </Link>
                ) : (
                   <Link href="/localizar-pedido">
                     <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => onOpenChange(false)}>
                       <PackageSearch className="h-4 w-4" /> Acompanhar Pedido (ID)
                     </Button>
                   </Link>
                )}
              </div>
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
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md bg-muted overflow-hidden flex-shrink-0">
                        <img
                          src={item.imagemProduto}
                          alt={item.nomeProduto}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details + Controls */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm leading-tight mb-1 truncate" data-testid={`text-cart-item-name-${index}`}>
                              {item.nomeProduto}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {item.tamanho} / {item.cor}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 flex-shrink-0 -mt-1 -mr-1"
                            onClick={() => onRemoveItem(item.productId, item.tamanho, item.cor)}
                            data-testid={`button-remove-item-${index}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Quantity + Price row */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                onUpdateQuantity(item.productId, item.tamanho, item.cor, item.quantidade - 1)
                              }
                              disabled={item.quantidade <= 1}
                              data-testid={`button-decrease-quantity-${index}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium text-sm" data-testid={`text-quantity-${index}`}>
                              {item.quantidade}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                onUpdateQuantity(item.productId, item.tamanho, item.cor, item.quantidade + 1)
                              }
                              data-testid={`button-increase-quantity-${index}`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-bold text-sm" data-testid={`text-cart-item-price-${index}`}>
                            {totalFormatado}
                          </p>
                        </div>
                      </div>
                    </div>

                    {index < items.length - 1 && <Separator className="mt-4" />}
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

              {user ? (
                /* Utilizador autenticado → pode fazer checkout */
                <div className="space-y-3">
                  <Link href="/checkout">
                    <Button
                      className="w-full font-semibold"
                      size="lg"
                      onClick={() => onOpenChange(false)}
                      data-testid="button-checkout"
                    >
                      Finalizar Compra
                    </Button>
                  </Link>
                  <Link href="/conta">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold uppercase tracking-wider gap-2 text-muted-foreground"
                      onClick={() => onOpenChange(false)}
                    >
                      <PackageSearch className="h-3.5 w-3.5" />
                      Acompanhar Pedidos Recentes
                    </Button>
                  </Link>
                </div>
              ) : (
                /* Utilizador não autenticado → mostrar aviso + login */
                <div className="space-y-3">
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-center">
                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                      🔒 É necessário ter conta para finalizar a compra
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Crie uma conta gratuita ou faça login para continuar
                    </p>
                  </div>
                  <Link href="/auth">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => onOpenChange(false)}
                      data-testid="button-login-to-checkout"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Entrar / Criar Conta
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
