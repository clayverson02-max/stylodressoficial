import { useState, useEffect } from "react";
import { Product, formatBRL, MIN_ORDER_QUANTITY } from "@/lib/store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus } from "lucide-react";

interface Props {
  product: Product | null;
  onClose: () => void;
}

interface SizeEntry {
  size: string;
  stock: number;
}

export const ProductDialog = ({ product, onClose }: Props) => {
  const { addItem } = useCart();
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState<number>(MIN_ORDER_QUANTITY);

  useEffect(() => {
    setSize("");
    setQty(MIN_ORDER_QUANTITY);
  }, [product?.id]);

  if (!product) return null;

  const sizes: SizeEntry[] = Array.isArray(product.sizes)
    ? (product.sizes as unknown as SizeEntry[])
    : [];
  const availableSizes = sizes.filter((s) => s.stock > 0);

  const handleAdd = () => {
    if (!size) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      size,
      quantity: qty,
      image_url: product.image_url,
    });
    onClose();
  };

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <div className="grid md:grid-cols-2">
          <div className="aspect-square bg-muted">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Sem imagem
              </div>
            )}
          </div>

          <div className="p-8 space-y-5 overflow-y-auto max-h-[80vh]">
            {product.category && (
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {product.category}
              </span>
            )}
            <h2 className="font-display text-3xl text-secondary leading-tight">{product.name}</h2>
            <p className="text-2xl text-primary-deep font-medium">
              {formatBRL(Number(product.price))}
            </p>
            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}

            <div className="space-y-3 pt-2">
              <label className="text-xs uppercase tracking-widest text-secondary font-medium">
                Escolha seu tamanho
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.length === 0 && (
                  <p className="text-sm text-muted-foreground">Sem tamanhos disponíveis no momento.</p>
                )}
                {availableSizes.map((s) => (
                  <button
                    key={s.size}
                    onClick={() => setSize(s.size)}
                    className={`min-w-[3rem] h-11 px-4 border text-sm font-medium transition-smooth rounded-sm ${
                      size === s.size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs uppercase tracking-widest text-secondary font-medium">
                Quantidade <span className="text-muted-foreground normal-case">(mínimo {MIN_ORDER_QUANTITY} peças no atacado)</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="h-11 w-11 border border-border rounded-sm flex items-center justify-center hover:border-primary transition-smooth"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium text-lg">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="h-11 w-11 border border-border rounded-sm flex items-center justify-center hover:border-primary transition-smooth"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <Button
              variant="luxe"
              size="lg"
              className="w-full"
              onClick={handleAdd}
              disabled={!size || availableSizes.length === 0}
            >
              {!size ? "Selecione um tamanho" : `Adicionar ${formatBRL(qty * Number(product.price))}`}
            </Button>
            <p className="text-[11px] text-center text-muted-foreground">
              Pagamento via Pix • Pedido confirmado por aqui
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
