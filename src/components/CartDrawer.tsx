import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatBRL, MIN_ORDER_QUANTITY } from "@/lib/store";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CartDrawer = () => {
  const { items, isOpen, setOpen, updateQuantity, removeItem, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const canCheckout = totalItems >= MIN_ORDER_QUANTITY;

  const handleCheckout = () => {
    setOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="font-display text-2xl text-secondary text-left">
            Seu Carrinho
          </SheetTitle>
          <p className="text-xs uppercase tracking-widest text-muted-foreground text-left">
            {totalItems} {totalItems === 1 ? "item" : "itens"}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
              <div>
                <p className="font-display text-xl text-secondary">Seu carrinho está vazio</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Que tal escolher uma peça especial?
                </p>
              </div>
              <Button variant="luxe" onClick={() => setOpen(false)}>
                Explorar coleção
              </Button>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={`${item.productId}-${item.size}`} className="flex gap-4">
                  <div className="flex-shrink-0 w-20 h-24 bg-muted rounded-sm overflow-hidden">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-base text-secondary leading-tight truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
                      Tam {item.size}
                    </p>
                    <p className="text-sm text-primary-deep font-medium mt-1">
                      {formatBRL(item.price)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 border border-border rounded-sm">
                        <button
                          className="h-7 w-7 flex items-center justify-center hover:bg-accent transition-smooth"
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-sm">{item.quantity}</span>
                        <button
                          className="h-7 w-7 flex items-center justify-center hover:bg-accent transition-smooth"
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.size)}
                        className="text-muted-foreground hover:text-destructive transition-smooth p-1"
                        aria-label="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="px-6 py-5 border-t border-border bg-muted/30">
            <div className="w-full space-y-4">
              {!canCheckout && (
                <div className="text-xs text-center text-primary-deep bg-accent border border-primary/30 rounded-sm py-2 px-3">
                  Pedido mínimo de {MIN_ORDER_QUANTITY} peças. Adicione mais {MIN_ORDER_QUANTITY - totalItems} para finalizar.
                </div>
              )}
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Total</span>
                <span className="font-display text-2xl text-secondary font-semibold">
                  {formatBRL(totalPrice)}
                </span>
              </div>
              <Button
                variant="luxe"
                size="lg"
                className="w-full"
                onClick={handleCheckout}
                disabled={!canCheckout}
              >
                Finalizar no WhatsApp
              </Button>
              <p className="text-[11px] text-center text-muted-foreground">
                Frete e pagamento combinados direto com nossa consultora 💬
              </p>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
