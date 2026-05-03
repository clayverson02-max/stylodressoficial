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

// chave: `${colorIndex}::${size}` -> quantidade
type Selection = Record<string, number>;

export const ProductDialog = ({ product, onClose }: Props) => {
  const { addItem } = useCart();
  const variants = useMemo(() => (product ? getVariants(product) : []), [product]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [selection, setSelection] = useState<Selection>({});

  useEffect(() => {
    setPreviewIndex(0);
    setSelection({});
  }, [product?.id]);

  if (!product) return null;

  const fallbackSizes: ProductSize[] = Array.isArray(product.sizes)
    ? (product.sizes as unknown as ProductSize[])
    : [];

  const groups = variants.length > 0
    ? variants.map((v, i) => ({
        key: `${i}`,
        color: v.color,
        hex: v.hex,
        image: v.image_url,
        sizes: v.sizes.filter((s) => s.stock > 0),
      }))
    : [{
        key: "0",
        color: "",
        hex: "",
        image: product.image_url ?? "",
        sizes: fallbackSizes.filter((s) => s.stock > 0),
      }];

  const previewImage = groups[previewIndex]?.image || product.image_url || "";

  const totalSelected = Object.values(selection).reduce((a, b) => a + b, 0);
  const subtotal = totalSelected * Number(product.price);
  const original = product.original_price ? Number(product.original_price) : null;
  const showPromo = original !== null && original > Number(product.price);

  const setQty = (key: string, qty: number) => {
    setSelection((s) => {
      const next = { ...s };
      if (qty <= 0) delete next[key];
      else next[key] = qty;
      return next;
    });
  };

  const inc = (key: string) => setQty(key, (selection[key] ?? 0) + 1);
  const dec = (key: string) => setQty(key, Math.max(0, (selection[key] ?? 0) - 1));

  const handleAdd = () => {
    if (totalSelected === 0) return;
    Object.entries(selection).forEach(([k, qty]) => {
      const [gIdx, size] = k.split("::");
      const g = groups[Number(gIdx)];
      if (!g) return;
      const colorLabel = g.color ? ` — ${g.color}` : "";
      addItem({
        productId: g.color ? `${product.id}::${g.color}` : product.id,
        name: `${product.name}${colorLabel}`,
        price: Number(product.price),
        size,
        quantity: qty,
        image_url: g.image,
      });
    });
    onClose();
  };

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 gap-0 w-[95vw] sm:w-full max-h-[92vh] overflow-y-auto overscroll-contain">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <div className="grid md:grid-cols-2">
          <div className="aspect-square bg-muted md:aspect-auto md:h-full md:sticky md:top-0 md:max-h-[92vh]">
            {previewImage ? (
              <img
                src={previewImage}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="eager"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                Sem imagem
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 md:p-8 space-y-5 pb-8">
            {product.category && (
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {product.category}
              </span>
            )}
            <h2 className="font-display text-2xl sm:text-3xl text-secondary leading-tight">{product.name}</h2>

            <div className="flex items-baseline gap-3 flex-wrap">
              {showPromo && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatBRL(original as number)}
                </span>
              )}
              <p className="text-2xl text-primary-deep font-semibold">
                {formatBRL(Number(product.price))}
              </p>
              <span className="text-xs text-muted-foreground">/ peça</span>
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

            <div className="bg-accent/40 border border-primary/20 rounded-sm p-3 text-[11px] text-secondary leading-relaxed">
              💡 <strong>Atacado:</strong> escolha quantas peças quiser de cada cor e tamanho. Mínimo de <strong>{MIN_ORDER_QUANTITY} peças</strong> no total do pedido (pode misturar modelos).
            </div>

            <div className="space-y-4">
              {groups.map((g, gi) => {
                const groupTotal = g.sizes.reduce((sum, s) => sum + (selection[`${gi}::${s.size}`] ?? 0), 0);
                return (
                  <div
                    key={g.key}
                    className={`border rounded-sm p-3 transition-smooth ${
                      previewIndex === gi ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setPreviewIndex(gi)}
                  >
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {g.hex && (
                          <span
                            className="h-6 w-6 rounded-full border-2 border-border flex-shrink-0"
                            style={{ backgroundColor: g.hex }}
                          />
                        )}
                        <span className="text-sm font-semibold text-secondary truncate">
                          {g.color || "Tamanhos"}
                        </span>
                      </div>
                      {groupTotal > 0 && (
                        <span className="text-[10px] uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                          {groupTotal} pç
                        </span>
                      )}
                    </div>

                    {g.sizes.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Sem estoque no momento.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {g.sizes.map((s) => {
                          const key = `${gi}::${s.size}`;
                          const qty = selection[key] ?? 0;
                          return (
                            <div
                              key={s.size}
                              className={`flex items-center justify-between border rounded-sm px-1.5 py-1 ${
                                qty > 0 ? "border-primary bg-background" : "border-border bg-background"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); dec(key); }}
                                className="h-7 w-7 flex items-center justify-center hover:bg-accent rounded-sm disabled:opacity-30"
                                disabled={qty === 0}
                                aria-label={`Diminuir ${s.size}`}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <div className="flex flex-col items-center leading-tight">
                                <span className="text-[10px] uppercase text-muted-foreground">{s.size}</span>
                                <span className="text-sm font-semibold text-secondary">{qty}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); inc(key); }}
                                className="h-7 w-7 flex items-center justify-center hover:bg-accent rounded-sm"
                                aria-label={`Aumentar ${s.size}`}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="sticky bottom-0 -mx-5 sm:-mx-6 md:-mx-8 px-5 sm:px-6 md:px-8 pt-3 pb-1 bg-background border-t border-border">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-muted-foreground">{totalSelected} {totalSelected === 1 ? "peça" : "peças"}</span>
                <span className="font-display text-xl text-secondary font-semibold">{formatBRL(subtotal)}</span>
              </div>
              <Button
                variant="luxe"
                size="lg"
                className="w-full"
                onClick={handleAdd}
                disabled={totalSelected === 0}
              >
                {totalSelected === 0 ? "Escolha tamanhos e cores" : "Adicionar ao pedido"}
              </Button>
              <p className="text-[11px] text-center text-muted-foreground mt-2">
                Finalização e pagamento direto com nossa consultora no WhatsApp 💬
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
