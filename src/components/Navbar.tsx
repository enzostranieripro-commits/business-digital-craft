import { useState } from "react";
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

  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b border-border/50" style={{ background: "hsl(var(--background) / 0.8)" }}>
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <a href="#" className="text-lg font-bold">Studio Nova</a>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button size="sm" className="bg-primary text-primary-foreground hover:brightness-110 rounded-lg" onClick={onOpenAuditForm}>
            Audit gratuit <ArrowRight className="ml-1 size-3" />
          </Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border px-4 py-4 space-y-3" style={{ background: "hsl(var(--background))" }}>
          {links.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">
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
