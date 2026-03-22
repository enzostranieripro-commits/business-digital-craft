import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuditModal } from "@/contexts/AuditModalContext";
import { Link } from "react-router-dom";

const links = [
  { label: "Services", href: "#services" },
  { label: "Méthode", href: "#methode" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open } = useAuditModal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "glass-strong py-3" : "py-5"}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">

        {/* Logo + nom */}
        <a href="#" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="ASC&D"
            className="h-9 w-auto object-contain"
            loading="eager"
          />
          <div className="flex items-center gap-1.5">
            <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
              ASC<span className="text-primary">&D</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
          </div>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
          <Link to="/admin" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            Admin
          </Link>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:brightness-110 rounded-xl"
            onClick={() => open()}
          >
            Audit gratuit
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <Button
                className="bg-primary text-primary-foreground rounded-xl w-full"
                onClick={() => { setMobileOpen(false); open(); }}
              >
                Audit gratuit
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
