import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/lib/store";
import { ProductCard } from "./ProductCard";
import { ProductDialog } from "./ProductDialog";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (!error && data) setProducts(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <section id="colecao" className="container py-14 md:py-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-script text-2xl text-primary-deep">nossa coleção</span>
        <h2 className="font-display text-3xl md:text-5xl font-light text-secondary mt-2">
          Peças que fazem você <span className="font-semibold text-primary-deep">brilhar</span>
        </h2>
        <p className="text-muted-foreground mt-4 text-sm md:text-base">
          Toque na peça, escolha a cor e o tamanho que combinam com você. Rápido, fácil e do jeitinho que você merece. 💛
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-sm">
          <p className="text-muted-foreground">
            Em breve novas peças. Acompanhe nossas novidades!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onSelect={setSelected} />
          ))}
        </div>
      )}

      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </section>
  );
};
