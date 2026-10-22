import { type ReactNode } from "react";
import { trackCustom } from "@/lib/metaPixel";

import { scrollToSection } from "@/lib/scrollToOffer";

export function OfferLink({ location, children = "VER A OFERTA ↓", beforeScroll }: { location: string; children?: ReactNode; beforeScroll?: () => void }) {
  return <a className="sos-cta" href="#oferta" data-offer-scroll={location} onClick={event => {
    event.preventDefault();
    try { trackCustom("ClickParaOferta", { local: location }); } catch { /* Tracking never prevents reading. */ }
    beforeScroll?.();
    window.setTimeout(() => scrollToSection("oferta", true), 30);
  }}>{children}</a>;
}
