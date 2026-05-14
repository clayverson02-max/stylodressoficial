import logo from "@/assets/stylo-logo.jpeg";

export const Footer = () => {
  return (
    <footer id="contato" className="bg-secondary text-secondary-foreground">
      <div className="container py-16">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Stylo Dress" className="h-14 w-14 rounded-full object-cover" />
              <div>
                <div className="font-display text-xl">STYLO DRESS</div>
                <div className="text-[10px] tracking-[0.3em] opacity-70 uppercase">Moda Feminina</div>
              </div>
            </div>
            <p className="text-sm opacity-75 mt-4 leading-relaxed max-w-xs">
              Moda feminina que une estilo, conforto e atitude. Atacado para revendedoras e looks
              especiais para você.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] font-semibold mb-4">Atendimento</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>WhatsApp: (85) 99298-5379</li>
              <li>Seg a Sáb • 9h às 18h</li>
              <li>Fortaleza, Ceará</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] font-semibold mb-4">Atacado</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>Pedido mínimo: 3 peças</li>
              <li>Envio para todo o Brasil</li>
              <li>Frete e pagamento combinados no WhatsApp</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs opacity-60">
          <span>© {new Date().getFullYear()} Stylo Dress. Todos os direitos reservados.</span>
          <span className="tracking-widest uppercase">Moda feminina • Estilo que representa • Confiança que se veste</span>
        </div>
      </div>
    </footer>
  );
};
