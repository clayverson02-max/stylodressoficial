import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, MIN_ORDER_QUANTITY, PIX_KEY } from "@/lib/store";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, Check, ArrowLeft, Truck, Loader2 } from "lucide-react";

const schema = z.object({
  customer_name: z.string().trim().min(2, "Nome obrigatório").max(120),
  customer_phone: z.string().trim().min(10, "Telefone obrigatório").max(20),
  customer_email: z.string().trim().email("E-mail inválido").max(255).optional().or(z.literal("")),
  customer_address: z.string().trim().max(300).optional().or(z.literal("")),
  customer_city: z.string().trim().max(120).optional().or(z.literal("")),
  customer_cep: z.string().trim().max(15).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

type FormState = z.infer<typeof schema>;

interface FreteOption {
  id: number;
  name: string;
  company: string;
  logo: string;
  price: number;
  delivery_time: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, clear } = useCart();
  const [form, setForm] = useState<FormState>({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
    customer_city: "",
    customer_cep: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [freteOptions, setFreteOptions] = useState<FreteOption[]>([]);
  const [freteSelecionado, setFreteSelecionado] = useState<FreteOption | null>(null);
  const [calculandoFrete, setCalculandoFrete] = useState(false);

  if (totalItems === 0 && orderNumber === null) {
    return (
      <>
        <Header />
        <div className="container py-32 text-center">
          <h1 className="font-display text-3xl text-secondary">Seu carrinho está vazio</h1>
          <Button variant="luxe" className="mt-6" onClick={() => navigate("/")}>
            Voltar para a loja
          </Button>
        </div>
      </>
    );
  }

  if (totalItems < MIN_ORDER_QUANTITY && orderNumber === null) {
    return (
      <>
        <Header />
        <div className="container py-32 text-center max-w-md mx-auto">
          <h1 className="font-display text-3xl text-secondary">Pedido mínimo de {MIN_ORDER_QUANTITY} peças</h1>
          <p className="text-muted-foreground mt-3">
            Adicione mais peças para finalizar como atacado.
          </p>
          <Button variant="luxe" className="mt-6" onClick={() => navigate("/")}>
            Continuar comprando
          </Button>
        </div>
      </>
    );
  }

  const handleChange = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [k]: e.target.value });
    if (k === "customer_cep") {
      setFreteOptions([]);
      setFreteSelecionado(null);
    }
  };

  const calcularFrete = async () => {
    const cep = (form.customer_cep || "").replace(/\D/g, "");
    if (cep.length !== 8) {
      toast.error("Informe um CEP válido (8 dígitos).");
      return;
    }
    setCalculandoFrete(true);
    setFreteOptions([]);
    setFreteSelecionado(null);
    try {
      const { data, error } = await supabase.functions.invoke("calcular-frete", {
        body: { cep_destino: cep, quantidade: totalItems },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const options: FreteOption[] = data?.options || [];
      if (options.length === 0) {
        toast.error("Nenhuma opção de frete disponível para esse CEP.");
      } else {
        setFreteOptions(options);
        setFreteSelecionado(options[0]);
        toast.success("Frete calculado!");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao calcular frete";
      toast.error(msg);
    } finally {
      setCalculandoFrete(false);
    }
  };

  const totalComFrete = totalPrice + (freteSelecionado?.price ?? 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const cepLine = parsed.data.customer_cep ? `CEP: ${parsed.data.customer_cep}` : "";
    const freteLine = freteSelecionado
      ? `Frete: ${freteSelecionado.company} ${freteSelecionado.name} - ${formatBRL(freteSelecionado.price)} (${freteSelecionado.delivery_time} dias)`
      : "";
    const noteLine = parsed.data.notes || "";
    const combinedNotes = [cepLine, freteLine, noteLine].filter(Boolean).join(" | ") || null;
    const payload = {
      customer_name: parsed.data.customer_name,
      customer_phone: parsed.data.customer_phone,
      customer_email: parsed.data.customer_email || null,
      customer_address: parsed.data.customer_address || null,
      customer_city: parsed.data.customer_city || null,
      notes: combinedNotes,
      items: items as unknown as never,
      total: totalComFrete,
    };
    const { data, error } = await supabase
      .from("orders")
      .insert(payload as never)
      .select("order_number")
      .single();
    setSubmitting(false);
    if (error || !data) {
      toast.error("Não foi possível registrar seu pedido. Tente novamente.");
      return;
    }
    setOrderNumber(data.order_number);
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    toast.success("Chave Pix copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (orderNumber !== null) {
    const orderCode = String(orderNumber).padStart(4, "0");
    const cardLinks = Array.from(
      new Map(
        items
          .filter((i) => i.mercado_pago_link)
          .map((i) => {
            const baseName = i.name.split(" — ")[0];
            return [i.mercado_pago_link as string, baseName];
          }),
      ).entries(),
    );
    const itemsText = items
      .map((i) => `• ${i.name} | Tam ${i.size} | ${i.quantity}x | ${formatBRL(i.price * i.quantity)}`)
      .join("%0A");
    const freteText = freteSelecionado
      ? `*Frete:* ${freteSelecionado.company} ${freteSelecionado.name} - ${formatBRL(freteSelecionado.price)} (${freteSelecionado.delivery_time} dias úteis)%0A`
      : "";
    const waMessage =
      `*Pedido Stylo Dress #${orderCode}*%0A%0A` +
      `*Cliente:* ${form.customer_name}%0A` +
      `*Telefone:* ${form.customer_phone}%0A` +
      (form.customer_address ? `*Endereço:* ${form.customer_address}%0A` : "") +
      (form.customer_city ? `*Cidade:* ${form.customer_city}%0A` : "") +
      (form.customer_cep ? `*CEP:* ${form.customer_cep}%0A` : "") +
      `%0A*Itens:*%0A${itemsText}%0A%0A` +
      freteText +
      `*Total:* ${formatBRL(totalComFrete)}%0A` +
      `*Pagamento:* Pix (chave ${PIX_KEY}) ou Cartão (Mercado Pago)%0A%0A` +
      `Segue o comprovante para confirmação. Obrigada!`;
    const waUrl = `https://wa.me/5585997341095?text=${waMessage}`;

    return (
      <>
        <Header />
        <div className="container py-12 md:py-16 max-w-2xl mx-auto px-4">
          <div className="bg-card border border-border rounded-sm p-6 md:p-10 text-center space-y-6 shadow-soft">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/15">
              <Check className="h-8 w-8 text-primary-deep" />
            </div>
            <div>
              <span className="text-script text-2xl text-primary-deep">obrigada!</span>
              <h1 className="font-display text-3xl md:text-4xl text-secondary mt-1">
                Pedido #{orderCode} confirmado
              </h1>
              <p className="text-muted-foreground mt-3">
                Escolha como prefere pagar: Pix ou cartão pelo Mercado Pago.
              </p>
            </div>

            <div className="bg-accent/40 border border-primary/20 rounded-sm p-5 md:p-6 text-left space-y-3">
              <p className="text-xs uppercase tracking-widest text-secondary font-semibold">
                Opção 1 — Pague com Pix (chave celular)
              </p>
              <div className="flex items-center gap-2 bg-background border border-border rounded-sm p-3">
                <span className="font-mono text-base md:text-lg text-secondary flex-1 break-all">{PIX_KEY}</span>
                <Button size="sm" variant="luxe" onClick={copyPix}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado" : "Copiar"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Após pagar, clique no botão abaixo para enviar o comprovante e os detalhes do pedido pelo WhatsApp.
              </p>
            </div>

            {cardLinks.length > 0 && (
              <div className="bg-card border border-border rounded-sm p-5 md:p-6 text-left space-y-3">
                <p className="text-xs uppercase tracking-widest text-secondary font-semibold">
                  Opção 2 — Pague com cartão (Mercado Pago)
                </p>
                <p className="text-sm text-muted-foreground">
                  Clique no link do produto correspondente para pagar com cartão de crédito ou débito de forma segura pelo Mercado Pago. Depois envie o comprovante pelo WhatsApp.
                </p>
                <div className="space-y-2">
                  {cardLinks.map(([link, name]) => (
                    <a key={link} href={link} target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="navy" className="w-full justify-between">
                        <span className="truncate">{name}</span>
                        <span className="text-xs opacity-80">Pagar com cartão →</span>
                      </Button>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="luxe" size="lg" className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white">
                Enviar pedido completo no WhatsApp
              </Button>
            </a>

            <Button variant="navy" size="lg" onClick={() => navigate("/")} className="w-full">
              Voltar para a loja
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container py-12 max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-smooth"
        >
          <ArrowLeft className="h-4 w-4" /> Continuar comprando
        </button>

        <h1 className="font-display text-4xl md:text-5xl text-secondary mb-2">Finalizar pedido</h1>
        <p className="text-muted-foreground mb-10">
          Preencha seus dados, calcule o frete e escolha pagar com Pix ou cartão (Mercado Pago).
        </p>

        <div className="grid lg:grid-cols-[1fr_420px] gap-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-card p-6 border border-border rounded-sm space-y-4">
              <h2 className="font-display text-xl text-secondary">Seus dados</h2>
              <div>
                <Label htmlFor="name">Nome completo *</Label>
                <Input id="name" required maxLength={120} value={form.customer_name} onChange={handleChange("customer_name")} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">WhatsApp *</Label>
                  <Input id="phone" required maxLength={20} placeholder="(85) 99999-9999" value={form.customer_phone} onChange={handleChange("customer_phone")} />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" maxLength={255} value={form.customer_email} onChange={handleChange("customer_email")} />
                </div>
              </div>
            </div>

            <div className="bg-card p-6 border border-border rounded-sm space-y-4">
              <h2 className="font-display text-xl text-secondary">Endereço para entrega</h2>
              <div className="grid sm:grid-cols-[180px_1fr_auto] gap-3 items-end">
                <div>
                  <Label htmlFor="cep">CEP *</Label>
                  <Input id="cep" maxLength={9} placeholder="00000-000" value={form.customer_cep} onChange={handleChange("customer_cep")} />
                </div>
                <div>
                  <Label htmlFor="city">Cidade / Estado</Label>
                  <Input id="city" maxLength={120} value={form.customer_city} onChange={handleChange("customer_city")} />
                </div>
                <Button
                  type="button"
                  variant="luxe"
                  onClick={calcularFrete}
                  disabled={calculandoFrete}
                  className="h-10"
                >
                  {calculandoFrete ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                  Calcular frete
                </Button>
              </div>

              {freteOptions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-secondary font-semibold">Opções de envio</p>
                  <div className="space-y-2">
                    {freteOptions.map((opt) => {
                      const selected = freteSelecionado?.id === opt.id;
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => setFreteSelecionado(opt)}
                          className={`w-full flex items-center gap-3 p-3 border rounded-sm text-left transition-smooth ${
                            selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          }`}
                        >
                          {opt.logo && <img src={opt.logo} alt={opt.company} className="h-6 w-auto" />}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-secondary">{opt.company} • {opt.name}</p>
                            <p className="text-xs text-muted-foreground">Entrega em até {opt.delivery_time} dias úteis</p>
                          </div>
                          <span className="font-display text-lg text-primary-deep font-semibold">{formatBRL(opt.price)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="addr">Endereço completo</Label>
                <Input id="addr" maxLength={300} placeholder="Rua, número, bairro, complemento" value={form.customer_address} onChange={handleChange("customer_address")} />
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" maxLength={500} placeholder="Alguma preferência ou recado?" value={form.notes} onChange={handleChange("notes")} />
              </div>
            </div>

            <Button type="submit" variant="luxe" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Enviando..." : "Confirmar pedido e escolher pagamento"}
            </Button>
          </form>

          <aside className="lg:sticky lg:top-28 self-start bg-card p-6 border border-border rounded-sm space-y-4 h-fit">
            <h2 className="font-display text-xl text-secondary">Resumo</h2>
            <ul className="space-y-3 max-h-72 overflow-y-auto">
              {items.map((i) => (
                <li key={`${i.productId}-${i.size}`} className="flex gap-3 text-sm">
                  <div className="w-14 h-16 bg-muted rounded-sm overflow-hidden flex-shrink-0">
                    {i.image_url && <img src={i.image_url} alt={i.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-secondary font-medium">{i.name}</p>
                    <p className="text-xs text-muted-foreground">Tam {i.size} • {i.quantity}x</p>
                  </div>
                  <span className="text-primary-deep font-medium">{formatBRL(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatBRL(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Frete</span>
                <span>{freteSelecionado ? formatBRL(freteSelecionado.price) : "a calcular"}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-border">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Total</span>
                <span className="font-display text-2xl text-secondary font-semibold">{formatBRL(totalComFrete)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Checkout;
