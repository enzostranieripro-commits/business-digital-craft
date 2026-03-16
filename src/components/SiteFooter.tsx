import { Button } from "@/components/ui/button";

interface SiteFooterProps {
  onOpenAuditForm: () => void;
}

const SiteFooter = ({ onOpenAuditForm }: SiteFooterProps) => (
  <footer className="relative border-t border-border/50 py-16 px-4">
    <div className="divider-glow absolute top-0 left-0 right-0" />
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-2xl md:text-3xl font-display font-black mb-4 tracking-tight">
        Prêt à <span className="text-gradient">accélérer</span> votre croissance ?
      </h2>
      <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
        Réservez un appel gratuit et découvrez comment l'IA peut transformer votre entreprise en Aveyron et Occitanie.
      </p>
      <Button
        size="lg"
        className="group bg-primary text-primary-foreground hover:brightness-110 px-10 py-6 rounded-xl mb-10 transition-all duration-300"
        onClick={onOpenAuditForm}
      >
        Prendre rendez-vous
      </Button>

      <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-6">
        {["Accueil", "Expertise", "Services & Prix", "Réalisations", "À propos", "FAQ"].map((link) => (
          <a key={link} href="#" className="hover:text-foreground transition-colors duration-300">{link}</a>
        ))}
      </nav>

      <p className="text-xs text-muted-foreground">
        © 2025 Studio Nova — Agence digitale IA en Aveyron, Occitanie. Tous droits réservés.
      </p>
    </div>
  </footer>
);

export default SiteFooter;
