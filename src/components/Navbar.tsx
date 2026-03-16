import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onOpenAuditForm: () => void;
}

const links = [
  { label: "Accueil", href: "#" },
  { label: "Services", href: "#services" },
  { label: "Tarifs", href: "#pricing" },
  { label: "Diagnostic", href: "#diagnostic" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = ({ onOpenAuditForm }: NavbarProps) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? "glass-strong border-b border-border/30 py-2 shadow-lg shadow-background/50"
          : "bg-transparent border-b border-transparent py-4"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4">
        <a href="#" className="text-lg font-display font-black tracking-tight hover:text-primary transition-colors duration-300">
          Studio Nova
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="relative px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 rounded-lg hover:bg-secondary/50"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button
            size="sm"
            className="group bg-primary text-primary-foreground hover:brightness-110 rounded-lg transition-all duration-300"
            onClick={onOpenAuditForm}
          >
            Audit gratuit
            <ArrowRight className="ml-1 size-3 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass-strong border-t border-border/30 px-4 py-4 space-y-3">
          {links.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-1">
              {l.label}
            </a>
          ))}
          <Button size="sm" className="w-full bg-primary text-primary-foreground rounded-lg mt-2" onClick={() => { setOpen(false); onOpenAuditForm(); }}>
            Audit gratuit
          </Button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
