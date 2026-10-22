import { trackInitiateCheckout } from "@/lib/metaPixel";

/** Carry the complete current query without overriding checkout-side parameters. */
export function checkoutDestination(href: string, search: string) {
  const destination = new URL(href);
  const source = new URLSearchParams(search);
  const existing = new Set(destination.searchParams.keys());
  source.forEach((value, key) => {
    if (!existing.has(key)) destination.searchParams.append(key, value);
  });
  return destination.toString();
}

export function beginBirthCheckout(destination: string, navigate: (url: string) => void) {
  try { trackInitiateCheckout(17.90); } catch { /* Blocked analytics must never block checkout. */ }
  return window.setTimeout(() => navigate(destination), 150);
}
