import { Link } from "react-router-dom";
import { ShoppingBag, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import logo from "@/assets/stylo-logo.jpeg";

export const Header = () => {
  const { totalItems, setOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Coleção", href: "#colecao" },
    { label: "Sobre", href: "#sobre" },
    { label: "Atacado", href: "#atacado" },
    { label: "Contato", href: "#contato" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/85 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Stylo Dress" className="h-12 w-12 rounded-full object-cover ring-1 ring-primary/20" />
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-display text-xl font-semibold text-secondary tracking-wide">STYLO DRESS</span>
            <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Moda Feminina</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors tracking-wide uppercase"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setOpen(true)}
            aria-label="Abrir carrinho"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-border/40 bg-background">
          <div className="container py-4 flex flex-col gap-4">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-foreground/80 uppercase tracking-wide"
              >
                {l.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};
