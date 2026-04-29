import { useState, useEffect, useMemo } from "react";
import { Product, formatBRL, MIN_ORDER_QUANTITY, getVariants, ProductSize } from "@/lib/store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus } from "lucide-react";

interface Props {
  product: Product | null;
  onClose: () => void;
}

export const ProductDialog = ({ product, onClose }: Props) => {
  const { addItem } = useCart();
  const variants = useMemo(() => (product ? getVariants(product) : []), [product]);
  const [colorIndex, setColorIndex] = useState(0);
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState<number>(MIN_ORDER_QUANTITY);

  useEffect(() => {
    setColorIndex(0);
    setSize("");
    setQty(MIN_ORDER_QUANTITY);
  }, [product?.id]);

  if (!product) return null;

  const variant = variants[colorIndex];
  // fallback: produtos antigos sem variantes
  const fallbackSizes: ProductSize[] = Array.isArray(product.sizes)
    ? (product.sizes as unknown as ProductSize[])
    : [];
  const sizes: ProductSize[] = variant ? variant.sizes : fallbackSizes;
  const availableSizes = sizes.filter((s) => s.stock > 0);
  const displayImage = variant?.image_url ?? product.image_url ?? "";
  const original = product.original_price ? Number(product.original_price) : null;
  const showPromo = original !== null && original > Number(product.price);

  const handleAdd = () => {
    if (!size) return;
    const colorLabel = variant ? ` — ${variant.color}` : "";
    addItem({
      productId: variant ? `${product.id}::${variant.color}` : product.id,
      name: `${product.name}${colorLabel}`,
      price: Number(product.price),
      size,
      quantity: qty,
      image_url: displayImage,
    });
    onClose();
  };

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 gap-0 max-h-[95vh] overflow-y-auto md:overflow-hidden">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <div className="grid md:grid-cols-2">
          <div className="aspect-square bg-muted md:aspect-auto md:h-full">
            {displayImage ? (
              <img src={displayImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Sem imagem
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 space-y-5 md:overflow-y-auto md:max-h-[95vh]">
            {product.category && (
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {product.category}
              </span>
            )}
            <h2 className="font-display text-3xl text-secondary leading-tight">{product.name}</h2>

            <div className="flex items-baseline gap-3">
              {showPromo && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatBRL(original as number)}
                </span>
              )}
              <p className="text-2xl text-primary-deep font-semibold">
                {formatBRL(Number(product.price))}
              </p>
              {showPromo && (
                <span className="text-[11px] font-bold uppercase tracking-wider bg-primary-deep text-primary-foreground px-2 py-0.5 rounded-sm">
                  {Math.round((1 - Number(product.price) / (original as number)) * 100)}% OFF
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}

            {variants.length > 0 && (
              <div className="space-y-3 pt-2">
                <label className="text-xs uppercase tracking-widest text-secondary font-medium">
                  Cor: <span className="text-muted-foreground normal-case">{variant?.color}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, i) => (
                    <button
                      key={v.color}
                      onClick={() => {
                        setColorIndex(i);
                        setSize("");
                      }}
                      title={v.color}
                      className={`relative h-10 w-10 rounded-full border-2 transition-smooth ${
                        i === colorIndex
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border hover:border-primary/60"
                      }`}
                      style={{ backgroundColor: v.hex }}
                      aria-label={v.color}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 pt-1">
              <label className="text-xs uppercase tracking-widest text-secondary font-medium">
                Tamanho
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
