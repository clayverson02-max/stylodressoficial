const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShippingRequest {
  cep_destino: string;
  quantidade: number;
}

interface MelhorEnvioOption {
  id: number;
  name: string;
  price: string | number;
  custom_price?: string | number;
  delivery_time: number;
  company: { id: number; name: string; picture: string };
  error?: string;
}

const GATEWAY_URL = "https://melhorenvio.com.br/api/v2/me/shipment/calculate";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const TOKEN = Deno.env.get("MELHOR_ENVIO_TOKEN");
    const CEP_ORIGEM = Deno.env.get("MELHOR_ENVIO_CEP_ORIGEM");

    if (!TOKEN || !CEP_ORIGEM) {
      return new Response(
        JSON.stringify({ error: "Configuração de frete indisponível." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body: ShippingRequest = await req.json();
    const cepDestino = (body.cep_destino || "").replace(/\D/g, "");
    const qtd = Math.max(1, Number(body.quantidade) || 1);

    if (cepDestino.length !== 8) {
      return new Response(
        JSON.stringify({ error: "CEP inválido. Informe 8 dígitos." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Cada peça aprox 350g, 20x25x4cm. Multiplicamos pela quantidade.
    const peso = +(0.35 * qtd).toFixed(2);
    const altura = Math.min(20, 4 * qtd);
    const formatCep = (c: string) => {
      const d = c.replace(/\D/g, "");
      return `${d.slice(0, 5)}-${d.slice(5, 8)}`;
    };
    const payload = {
      from: { postal_code: formatCep(CEP_ORIGEM) },
      to: { postal_code: formatCep(cepDestino) },
      package: {
        height: altura,
        width: 20,
        length: 25,
        weight: peso,
      },
    };

    const resp = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
        "User-Agent": "Stylo Dress (contato@stylodress.com.br)",
      },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    if (!resp.ok) {
      console.error("Melhor Envio erro:", resp.status, text);
      return new Response(
        JSON.stringify({ error: "Não foi possível calcular o frete agora." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let data: MelhorEnvioOption[] = [];
    try {
      data = JSON.parse(text);
    } catch {
      return new Response(
        JSON.stringify({ error: "Resposta inválida do serviço de frete." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const options = (Array.isArray(data) ? data : [])
      .filter((o) => !o.error && (o.price || o.custom_price))
      .map((o) => ({
        id: o.id,
        name: o.name,
        company: o.company?.name ?? "",
        logo: o.company?.picture ?? "",
        price: Number(o.custom_price ?? o.price),
        delivery_time: o.delivery_time,
      }))
      .sort((a, b) => a.price - b.price);

    return new Response(JSON.stringify({ options }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Erro calcular-frete:", e);
    return new Response(
      JSON.stringify({ error: "Erro interno ao calcular frete." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
