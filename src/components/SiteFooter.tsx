import { Link } from "react-router-dom";
import { useAuditModal } from "@/contexts/AuditModalContext";

const SiteFooter = () => {
  const { open } = useAuditModal();

  return (
    <footer className="border-t border-border/30 py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
        <div>
          <span className="font-display text-lg font-extrabold">ASC<span className="text-primary">&D</span></span>
          <p className="text-xs text-muted-foreground/60 mt-1">Angelot Stranieri Consulting & Development</p>
          <p className="text-sm text-muted-foreground mt-3">Agence web pour artisans, commerçants et indépendants en Aveyron & Occitanie.</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-4">Offres</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><button onClick={() => open("Visibilité")} className="hover:text-foreground transition-colors">Visibilité — 59€/mois</button></li>
            <li><button onClick={() => open("Autorité")} className="hover:text-foreground transition-colors">Autorité — 119€/mois</button></li>
            <li><button onClick={() => open("Conversion")} className="hover:text-foreground transition-colors">Conversion — 199€/mois</button></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-4">Zones d'intervention</h4>
          <ul className="space-y-2 text-sm text-muted-foreground"><li>Rodez & Aveyron</li><li>Occitanie</li><li>France entière</li></ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground"><li>contact@ascnd.fr</li><li>Rodez, Aveyron (12)</li><li>Lun-Ven 9h-18h</li></ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-border/30 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} ASC&D — Angelot Stranieri Consulting & Development. Tous droits réservés.</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <Link to="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</Link>
          <Link to="/politique-confidentialite" className="hover:text-foreground transition-colors">Politique de confidentialité</Link>
          <Link to="/cgv" className="hover:text-foreground transition-colors">CGV</Link>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;