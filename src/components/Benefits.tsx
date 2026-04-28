import { Truck, Shield, Sparkles, CreditCard } from "lucide-react";

const benefits = [
  { icon: Sparkles, title: "Peças exclusivas", desc: "Designs únicos para mulheres reais" },
  { icon: Truck, title: "Envio rápido", desc: "Para todo o Brasil com segurança" },
  { icon: CreditCard, title: "Pagamento via Pix", desc: "Aprovação instantânea" },
  { icon: Shield, title: "Compra segura", desc: "Seus dados protegidos do início ao fim" },
];

export const Benefits = () => {
  return (
    <section className="border-y border-border/40 bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b) => (
            <div key={b.title} className="flex items-start gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-accent flex items-center justify-center">
                <b.icon className="h-5 w-5 text-primary-deep" />
              </div>
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-secondary">{b.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
