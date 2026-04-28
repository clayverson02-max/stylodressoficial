import banner from "@/assets/banner-stylo.png";

export const Hero = () => {
  return (
    <section className="relative">
      <a href="#colecao" className="block group">
        <img
          src={banner}
          alt="Stylo Dress — Vestir-se bem transforma o dia"
          className="w-full h-auto object-cover"
          loading="eager"
        />
      </a>

      {/* Faixa de chamada abaixo do banner */}
      <div className="bg-secondary text-secondary-foreground py-3 overflow-hidden">
        <div className="container flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs sm:text-sm uppercase tracking-[0.2em]">
          <span className="text-primary-glow font-semibold">✦ Marca própria de Fortaleza</span>
          <span>Atacado a partir de 2 peças</span>
          <span className="text-primary-glow font-semibold">✦ Pagamento via Pix</span>
        </div>
      </div>
    </section>
  );
};
