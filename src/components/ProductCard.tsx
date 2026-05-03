import { Product, formatBRL, getVariants } from "@/lib/store";
import { Button } from "@/components/ui/button";

interface Props {
  product: Product;
  onSelect: (p: Product) => void;
}

export const ProductCard = ({ product, onSelect }: Props) => {
  const price = Number(product.price);
  const original = product.original_price ? Number(product.original_price) : null;
  const showPromo = original !== null && original > price;
  const discount = showPromo ? Math.round((1 - price / (original as number)) * 100) : 0;
  const variants = getVariants(product);

  return (
    <div
      className="group cursor-pointer animate-fade-up bg-card rounded-sm overflow-hidden shadow-card hover:shadow-elegant transition-luxe"
      onClick={() => onSelect(product)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-luxe group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            Sem imagem
          </div>
        )}

        {showPromo && (
          <div className="absolute top-3 left-3 bg-primary-deep text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm shadow-soft">
            {discount}% OFF
          </div>
        )}

        <Button
          variant="luxe"
          size="sm"
          className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-luxe translate-y-2 group-hover:translate-y-0"
        >
          Ver detalhes
        </Button>
      </div>

      <div className="p-4 space-y-2">
        {product.category && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {product.category}
          </span>
        )}
        <h3 className="font-display text-lg text-secondary leading-tight">{product.name}</h3>

        {variants.length > 0 && (
          <div className="flex items-center gap-1.5 pt-0.5">
            {variants.slice(0, 5).map((v) => (
              <span
                key={v.color}
                title={v.color}
                className="h-3.5 w-3.5 rounded-full border border-border/60"
                style={{ backgroundColor: v.hex }}
              />
            ))}
            <span className="text-[11px] text-muted-foreground ml-1">
              {variants.length} {variants.length === 1 ? "cor" : "cores"}
            </span>
          </div>
        )}

        <div className="flex items-baseline gap-2 pt-1">
          {showPromo && (
            <span className="text-xs text-muted-foreground line-through">
              {formatBRL(original as number)}
            </span>
          )}
          <span className="text-primary-deep font-bold text-lg">{formatBRL(price)}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          atacado a partir de 3 peças
        </p>
      </div>
    </div>
  );
};
