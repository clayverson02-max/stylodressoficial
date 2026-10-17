declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const eventId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `quiz-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

const sendToServer = async (
  eventName: string,
  id: string,
  customData?: Record<string, unknown>,
) => {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.functions.invoke("meta-capi", {
      body: {
        event_name: eventName,
        event_id: id,
        event_source_url: window.location.href,
        custom_data: customData,
      },
    });
  } catch {
    // O Pixel do navegador continua funcionando mesmo se a API não estiver configurada.
  }
};

export const trackCustom = (
  eventName: string,
  customData?: Record<string, unknown>,
) => {
  const id = eventId();
  window.fbq?.("trackCustom", eventName, customData ?? {});
  void sendToServer(eventName, id, customData);
};

export const trackStandard = (
  eventName: string,
  customData?: Record<string, unknown>,
) => {
  const id = eventId();
  window.fbq?.("track", eventName, customData ?? {});
  void sendToServer(eventName, id, customData);
};

export const trackInitiateCheckout = (value = 5.5) => {
  trackStandard("InitiateCheckout", {
    value,
    currency: "USD",
    content_name: "Preparación Completa para el Parto Natural",
    content_type: "product",
  });
};
