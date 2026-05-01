export const About = () => {
  return (
    <section id="sobre" className="bg-card border-y border-border/40">
      <div className="container py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-5">
          <span className="text-script text-2xl text-primary-deep">sobre nós</span>
          <h2 className="font-display text-4xl md:text-5xl font-light text-secondary leading-tight">
            Marca própria, <br />
            <span className="font-semibold">direto de Fortaleza para o Brasil</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A Stylo Dress é uma marca própria atacadista de Fortaleza, criada para vestir a mulher
            que ama se sentir bonita todos os dias. Aqui cada peça é pensada com carinho: tecido
            selecionado, modelagem que valoriza o corpo e acabamento de qualidade.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Atendemos consumidoras finais e revendedoras com preço de atacado a partir de duas
            peças. Pagamento via Pix com confirmação rápida e envio para todo o Brasil.
          </p>
        </div>

        <div id="atacado" className="bg-background p-10 border border-border/60 rounded-sm space-y-6">
          <h3 className="font-display text-3xl text-secondary">Por que comprar no atacado?</h3>
          <ul className="space-y-4 text-sm">
            {[
              "A partir de 3 peças você já compra no atacado",
              "Marca própria fabricada em Fortaleza com tecido de qualidade",
              "Curadoria que conversa com o gosto da brasileira",
              "Reposição constante de novos modelos",
              "Pagamento via Pix com confirmação rápida",
              "Envio com cuidado para todo o Brasil",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-foreground/85">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
