// TikTok Events API (CAPI) - server-side Lead tracking
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PIXEL_ID = "D7V8LDRC77U44OJJ090G";
const ENDPOINT = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get("TIKTOK_ACCESS_TOKEN");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "TIKTOK_ACCESS_TOKEN not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      event = "Lead",
      event_id,
      url,
      ttclid,
      ttp,
      phone,
      email,
      name,
      city,
      value,
      currency = "BRL",
      contents,
    } = body ?? {};

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    const ua = req.headers.get("user-agent") || "";

    const phoneDigits = onlyDigits(phone || "");
    // Brazilian phone -> E.164 (assume +55 if 10-11 digits)
    const phoneE164 = phoneDigits
      ? phoneDigits.startsWith("55")
        ? `+${phoneDigits}`
        : `+55${phoneDigits}`
      : "";

    const user: Record<string, string> = {};
    if (phoneE164) user.phone = await sha256(phoneE164);
    if (email) user.email = await sha256(email);
    if (name) {
      const parts = String(name).trim().split(/\s+/);
      user.first_name = await sha256(parts[0] || "");
      if (parts.length > 1) user.last_name = await sha256(parts.slice(1).join(" "));
    }
    if (city) user.city = await sha256(String(city));
    if (ip) user.ip = ip;
    if (ua) user.user_agent = ua;
    if (ttclid) user.ttclid = ttclid;
    if (ttp) user.ttp = ttp;

    const properties: Record<string, unknown> = {};
    if (typeof value === "number") properties.value = value;
    if (currency) properties.currency = currency;
    if (Array.isArray(contents)) properties.contents = contents;

    const payload = {
      event_source: "web",
      event_source_id: PIXEL_ID,
      data: [
        {
          event,
          event_time: Math.floor(Date.now() / 1000),
          event_id: event_id || crypto.randomUUID(),
          user,
          properties,
          page: url ? { url } : undefined,
        },
      ],
    };

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": token,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok: res.ok, response: data }), {
      status: res.ok ? 200 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
