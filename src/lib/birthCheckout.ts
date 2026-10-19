import { trackInitiateCheckout } from "@/lib/metaPixel";

export function checkoutDestination(href: string, search: string) {
  const destination = new URL(href);
  const source = new URLSearchParams(search);
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "sck", "xcod", "fbclid", "ttclid"].forEach(key => {
    const value = source.get(key);
    if (value && !destination.searchParams.has(key)) destination.searchParams.set(key, value);
  });
  return destination.toString();
}

/** The pixel call is synchronous; navigation always proceeds after 150ms, even if tracking fails. */
export function beginBirthCheckout(destination: string, navigate: (url: string) => void) {
  try { trackInitiateCheckout(4); } catch { /* Ad blockers must not prevent a purchase. */ }
  return window.setTimeout(() => navigate(destination), 150);
}
