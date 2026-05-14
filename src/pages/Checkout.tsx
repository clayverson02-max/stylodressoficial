import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useCart } from "@/contexts/CartContext";
import { formatBRL, MIN_ORDER_QUANTITY } from "@/lib/store";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle } from "lucide-react";

const WHATS_NUMBER = "5585992985379";

declare global {
  interface Window {
    ttq?: {
      track: (event: string, params?: Record<string, unknown>, opts?: { event_id?: string }) => void;
    };
  }
}

const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : undefined;
};

const schema = z.object({
  customer_name: z.string().trim().min(2, "Informe seu nome").max(120),
  customer_phone: z.string().trim().min(10, "Informe seu WhatsApp").max(20),
  customer_city: z.string().trim().max(120).optional().or(z.literal("")),
  customer_cep: z.string().trim().max(15).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

type FormState = z.infer<typeof schema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, clear } = useCart();
  const [form, setForm] = useState<FormState>({
    customer_name: "",
    customer_phone: "",
    customer_city: "",
    customer_cep: "",
    notes: "",
  });

  if (totalItems === 0) {
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

  if (totalItems < MIN_ORDER_QUANTITY) {
    return (
      <>
        <Header />
        <div className="container py-32 text-center max-w-md mx-auto">
          <h1 className="font-display text-3xl text-secondary">
            Pedido mínimo de {MIN_ORDER_QUANTITY} peças
          </h1>
          <p className="text-muted-foreground mt-3">
            Adicione mais peças (pode misturar modelos e cores) para finalizar como atacado.
          </p>
          <Button variant="luxe" className="mt-6" onClick={() => navigate("/")}>
            Continuar comprando
          </Button>
        </div>
      </>
    );
  }

  const handleChange = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    const itemsText = items
      .map((i) => `• ${i.name} | Tam ${i.size} | ${i.quantity}x | ${formatBRL(i.price * i.quantity)}`)
      .join("\n");

    const message = [
      "*Novo pedido — Stylo Dress* 💖",
      "",
      `*Nome:* ${parsed.data.customer_name}`,
      `*WhatsApp:* ${parsed.data.customer_phone}`,
      parsed.data.customer_city ? `*Cidade/Estado:* ${parsed.data.customer_city}` : "",
      parsed.data.customer_cep ? `*CEP:* ${parsed.data.customer_cep}` : "",
      "",
      "*Itens do pedido:*",
      itemsText,
      "",
      `*Total das peças:* ${formatBRL(totalPrice)} (${totalItems} peças)`,
      "",
      parsed.data.notes ? `*Observações:* ${parsed.data.notes}` : "",
      "",
      "Quero finalizar a compra. Pode me passar as opções de pagamento e frete? 🙏",
    ]
      .filter(Boolean)
      .join("\n");

    // === TikTok Lead tracking (Pixel + CAPI deduplicados pelo event_id) ===
    const event_id =
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`);

    const contents = items.map((i) => ({
      content_id: String(i.productId),
      content_name: i.name,
      quantity: i.quantity,
      price: i.price,
    }));

    try {
      window.ttq?.track(
        "Lead",
        {
          value: totalPrice,
          currency: "BRL",
          contents,
          content_type: "product",
        },
        { event_id },
      );
    } catch (_) {
      // pixel falhou, segue para CAPI
    }

    // CAPI (server-side) — não bloqueia o redirecionamento se demorar
    supabase.functions
      .invoke("tiktok-capi", {
        body: {
          event: "Lead",
          event_id,
          url: window.location.href,
          ttclid: getCookie("ttclid"),
          ttp: getCookie("_ttp"),
          phone: parsed.data.customer_phone,
          name: parsed.data.customer_name,
          city: parsed.data.customer_city,
          value: totalPrice,
          currency: "BRL",
          contents,
        },
      })
      .catch(() => undefined);

    const url = `https://wa.me/${WHATS_NUMBER}?text=${encodeURIComponent(message)}`;
    clear();
    window.open(url, "_blank");
    navigate("/");
  };

  return (
    <>
      <Header />
      <div className="container py-10 md:py-14 max-w-3xl mx-auto px-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-smooth"
        >
          <ArrowLeft className="h-4 w-4" /> Continuar escolhendo
        </button>

        <h1 className="font-display text-3xl md:text-4xl text-secondary mb-2">Finalizar no WhatsApp</h1>
        <p className="text-muted-foreground mb-6 text-sm md:text-base">
          Preencha seus dados e clique em <strong>Enviar pedido no WhatsApp</strong>. Nossa consultora vai te ajudar com <strong>frete</strong> e <strong>pagamento</strong> (Pix ou cartão).
        </p>

        <div className="bg-card border border-border rounded-sm p-4 mb-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Resumo do pedido</p>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size}`} className="flex justify-between gap-3">
                <span className="text-secondary">
                  {i.name} • Tam {i.size} • {i.quantity}x
                </span>
                <span className="font-medium text-primary-deep flex-shrink-0">
                  {formatBRL(i.price * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border mt-3 pt-3 flex justify-between text-base">
            <span className="font-semibold text-secondary">Total ({totalItems} peças)</span>
            <span className="font-display text-xl font-semibold text-primary-deep">{formatBRL(totalPrice)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-sm p-5 md:p-6 space-y-4">
          <div>
            <Label htmlFor="name">Nome completo *</Label>
            <Input id="name" required maxLength={120} value={form.customer_name} onChange={handleChange("customer_name")} />
          </div>
          <div>
            <Label htmlFor="phone">WhatsApp *</Label>
            <Input id="phone" required maxLength={20} placeholder="(85) 99999-9999" value={form.customer_phone} onChange={handleChange("customer_phone")} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade / Estado</Label>
              <Input id="city" maxLength={120} placeholder="Ex: Fortaleza/CE" value={form.customer_city} onChange={handleChange("customer_city")} />
            </div>
            <div>
              <Label htmlFor="cep">CEP (opcional)</Label>
              <Input id="cep" maxLength={15} placeholder="00000-000" value={form.customer_cep} onChange={handleChange("customer_cep")} />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" maxLength={500} placeholder="Alguma preferência? Quer combinar entrega ou retirada?" value={form.notes} onChange={handleChange("notes")} />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 font-semibold tracking-wider uppercase text-xs"
          >
            <MessageCircle className="h-5 w-5" />
            Enviar pedido no WhatsApp
          </Button>
          <p className="text-[11px] text-center text-muted-foreground">
            Vamos abrir uma conversa com nossa consultora com todos os dados do seu pedido já preenchidos. 💬
          </p>
        </form>
      </div>
    </>
  );
};

export default Checkout;
