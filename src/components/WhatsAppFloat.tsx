import { MessageCircle } from "lucide-react";

const WHATS_URL = "https://wa.me/5585992985379?text=" + encodeURIComponent(
  "Olá Stylo Dress! Vim pelo site e quero tirar uma dúvida 💖"
);

export const WhatsAppFloat = () => {
  return (
    <a
      href={WHATS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 group flex items-center gap-2 bg-whatsapp text-whatsapp-foreground rounded-full pl-4 pr-5 py-3 shadow-elegant hover:scale-105 active:scale-95 transition-all"
    >
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full rounded-full bg-whatsapp-foreground/40 animate-ping" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-whatsapp-foreground" />
      </span>
      <MessageCircle className="h-5 w-5" />
      <span className="text-sm font-semibold hidden sm:inline">Fale conosco</span>
    </a>
  );
};
