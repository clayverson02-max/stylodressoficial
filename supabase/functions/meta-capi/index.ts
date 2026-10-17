import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get("META_CAPI_ACCESS_TOKEN");
    if (!token) {
      return new Response(JSON.stringify({ ok: false, error: "META_CAPI_ACCESS_TOKEN is not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const eventName = String(body.event_name ?? "QuizEvent");
    const eventId = String(body.event_id ?? crypto.randomUUID());
    const eventSourceUrl = String(body.event_source_url ?? "");
    const customData = body.custom_data && typeof body.custom_data === "object" ? body.custom_data : {};

    const response = await fetch("https://graph.facebook.com/v20.0/2149847235657959/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: [{
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: "website",
          event_source_url: eventSourceUrl,
          user_data: {},
          custom_data: customData,
        }],
      }),
    });

    const result = await response.json();
    return new Response(JSON.stringify({ ok: response.ok, result }), {
      status: response.ok ? 200 : response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
