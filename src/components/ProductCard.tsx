import { Product, formatBRL } from "@/lib/store";
import { Button } from "@/components/ui/button";

interface Props {
  product: Product;
  onSelect: (p: Product) => void;
}

// Preço "de" fixo da campanha de lançamento
const ORIGINAL_PRICE = 89.9;

export const ProductCard = ({ product, onSelect }: Props) => {
  const price = Number(product.price);
  const showPromo = price < ORIGINAL_PRICE;
  const discount = showPromo ? Math.round((1 - price / ORIGINAL_PRICE) * 100) : 0;

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
          Comprar agora
        </Button>
      </div>

      <div className="p-4 space-y-1">
        {product.category && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {product.category}
          </span>
        )}
        <h3 className="font-display text-lg text-secondary leading-tight">{product.name}</h3>
        <div className="flex items-baseline gap-2 pt-1">
          {showPromo && (
            <span className="text-xs text-muted-foreground line-through">
              {formatBRL(ORIGINAL_PRICE)}
            </span>
          )}
          <span className="text-primary-deep font-bold text-lg">{formatBRL(price)}</span>
        </div>
        <p className="text-[11px] text-muted-foreground pt-1">
          ou pague no Pix com aprovação na hora
        </p>
      </div>
    </div>
  );
};
