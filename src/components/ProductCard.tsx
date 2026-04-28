import { Product, formatBRL } from "@/lib/store";
import { Button } from "@/components/ui/button";

interface Props {
  product: Product;
  onSelect: (p: Product) => void;
}

export const ProductCard = ({ product, onSelect }: Props) => {
  return (
    <div
      className="group cursor-pointer animate-fade-up"
      onClick={() => onSelect(product)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted rounded-sm">
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
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-luxe" />
        <Button
          variant="luxe"
          size="sm"
          className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-luxe translate-y-2 group-hover:translate-y-0"
        >
          Ver peça
        </Button>
      </div>
      <div className="pt-4 space-y-1">
        {product.category && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {product.category}
          </span>
        )}
        <h3 className="font-display text-lg text-secondary leading-tight">{product.name}</h3>
        <p className="text-primary-deep font-medium">{formatBRL(Number(product.price))}</p>
      </div>
    </div>
  );
};
