import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-collection.jpg";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-rose-soft" />
      <div className="container relative grid lg:grid-cols-2 gap-12 lg:gap-8 items-center py-16 lg:py-24">
        <div className="space-y-8 animate-fade-up">
          <span className="inline-block text-script text-2xl text-primary-deep">
            elegância que se veste
          </span>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light text-secondary leading-[1.05] tracking-tight">
            Vestir-se bem<br />
            <span className="font-semibold">transforma o dia.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
            Peças que unem estilo, conforto e feminilidade — selecionadas a dedo
            para mulheres reais. <span className="text-secondary font-medium">Atacado a partir de 2 peças</span>.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button size="lg" variant="luxe" asChild>
              <a href="#colecao">Conhecer a coleção</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#atacado">Vantagens do atacado</a>
            </Button>
          </div>
          <div className="flex items-center gap-8 pt-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <span>Peças exclusivas</span>
            <span className="h-1 w-1 rounded-full bg-primary" />
            <span>Envio rápido</span>
            <span className="h-1 w-1 rounded-full bg-primary" />
            <span>Compra segura</span>
          </div>
        </div>

        <div className="relative animate-fade-in">
          <div className="absolute -inset-4 gradient-rose rounded-sm opacity-20 blur-2xl" />
          <img
            src={hero}
            alt="Coleção Stylo Dress"
            width={1600}
            height={1024}
            className="relative w-full h-auto rounded-sm shadow-elegant object-cover"
          />
          <div className="absolute -bottom-6 -left-6 hidden md:block bg-card px-6 py-4 rounded-sm shadow-elegant border border-border/50">
            <div className="text-script text-xl text-primary-deep">novidades</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Coleção 2026</div>
          </div>
        </div>
      </div>
    </section>
  );
};
