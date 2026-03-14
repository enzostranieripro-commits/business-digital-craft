import { motion } from "framer-motion";
import { ArrowRight, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeader from "./SectionHeader";

interface PricingSectionProps {
  onOpenAuditForm: () => void;
}

const axe1 = [
  {
    name: "Site Essentiel",
    price: "1 290 €",
    monthly: "ou 89 €/mois",
    features: ["Site vitrine moderne", "Responsive mobile", "Formulaire de contact", "Optimisation SEO de base"],
    recommended: false,
  },
  {
    name: "Site Commercial",
    price: "2 490 €",
    monthly: "ou 149 €/mois",
    features: ["Tout de Essentiel", "Référencement local avancé", "Prise de rendez-vous en ligne", "Intégration réseaux sociaux", "Suivi analytics"],
    recommended: true,
  },
  {
    name: "Site Croissance",
    price: "4 490 €",
    monthly: "ou 249 €/mois",
    features: ["Tout de Commercial", "Tunnel de conversion", "CRM intégré", "Automatisations avancées", "Formation incluse"],
    recommended: false,
  },
];

const axe2 = [
  {
    name: "Pack Présence",
    price: "290 €",
    monthly: "ou 249 €/mois",
    features: ["5 publications/mois", "Visuels professionnels", "Calendrier éditorial"],
    recommended: false,
  },
  {
    name: "Pack Visibilité",
    price: "590 €",
    monthly: "ou 449 €/mois",
    features: ["10 publications/mois", "Photos & vidéos pro", "Stratégie de contenu", "Rapports mensuels"],
    recommended: true,
  },
  {
    name: "Pack Campagne",
    price: "990 €",
    monthly: "ou 749 €/mois",
    features: ["20 publications/mois", "Campagnes publicitaires", "Community management", "Reporting avancé"],
    recommended: false,
  },
];

const PricingTable = ({ title, plans, onOpenAuditForm }: { title: string; plans: typeof axe1; onOpenAuditForm: () => void }) => (
  <div className="mb-16">
    <h3 className="text-xl font-bold text-center mb-8">{title}</h3>
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map((plan, i) => (
        <motion.div
          key={plan.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className={`relative card-surface p-6 flex flex-col ${plan.recommended ? "ring-2 ring-primary" : ""}`}
        >
          {plan.recommended && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
              Le plus choisi
            </span>
          )}
          <h4 className="text-lg font-bold mb-2">{plan.name}</h4>
          <div className="mb-4">
            <span className="text-3xl font-bold tabular-nums">{plan.price}</span>
            <span className="text-sm text-muted-foreground ml-2">{plan.monthly}</span>
          </div>
          <ul className="space-y-3 mb-6 flex-1">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="size-4 text-primary mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            onClick={onOpenAuditForm}
            className={plan.recommended ? "bg-primary text-primary-foreground hover:brightness-110 rounded-xl" : "bg-secondary text-foreground hover:bg-secondary/80 rounded-xl"}
          >
            Demander un devis <ArrowRight className="ml-2 size-4" />
          </Button>
        </motion.div>
      ))}
    </div>
  </div>
);

const PricingSection = ({ onOpenAuditForm }: PricingSectionProps) => (
  <section id="pricing" className="section-padding">
    <div className="max-w-6xl mx-auto">
      <SectionHeader
        label="NOS TARIFS"
        title="Des offres claires pour"
        highlight="chaque budget"
        description="Chaque projet est unique. L'audit gratuit permet d'identifier la solution la plus adaptée à votre entreprise."
      />

      <PricingTable title="Axe 1 — Création & Refonte Web" plans={axe1} onOpenAuditForm={onOpenAuditForm} />
      <PricingTable title="Axe 2 — Contenu Marketing" plans={axe2} onOpenAuditForm={onOpenAuditForm} />

      {/* Axe 3 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="card-surface p-8 ring-2 ring-primary relative"
      >
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full flex items-center gap-1">
          <Zap className="size-3" /> Système complet
        </span>
        <div className="text-center mb-6">
          <h4 className="text-xl font-bold mb-2">Système Client Automatisé</h4>
          <span className="text-3xl font-bold tabular-nums">À partir de 990 €</span>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium mb-3">Inclus :</p>
            <ul className="space-y-2">
              {["Automatisation des demandes", "Capture des prospects", "Dashboard de suivi", "Configuration complète"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="size-4 text-primary shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium mb-3">Adapté à votre secteur :</p>
            <div className="flex flex-wrap gap-2">
              {["Artisan", "Commerce", "Immobilier", "Services", "Tourisme", "Agriculture"].map((s) => (
                <span key={s} className="badge-primary">{s}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center mt-6">
          <Button onClick={onOpenAuditForm} className="bg-primary text-primary-foreground hover:brightness-110 rounded-xl px-8">
            Demander un devis <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default PricingSection;
