import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Zap, Star } from "lucide-react";
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

const tabs = [
  { id: "web", label: "Création Web", icon: "🌐" },
  { id: "marketing", label: "Contenu Marketing", icon: "📣" },
  { id: "automation", label: "Automatisation", icon: "⚡" },
];

const PricingSection = ({ onOpenAuditForm }: PricingSectionProps) => {
  const [activeTab, setActiveTab] = useState("web");

  const currentPlans = activeTab === "web" ? axe1 : axe2;

  return (
    <section id="pricing" className="section-padding">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          label="NOS TARIFS"
          title="Des offres claires pour"
          highlight="chaque budget"
          description="Chaque projet est unique. L'audit gratuit permet d'identifier la solution la plus adaptée à votre entreprise."
        />

        {/* Tab switcher */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-secondary/50 border border-border rounded-2xl p-1.5 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plans grid */}
        {activeTab !== "automation" ? (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            {currentPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`relative rounded-2xl border p-6 flex flex-col transition-all duration-300 ${
                  plan.recommended
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)] scale-[1.03]"
                    : "border-border bg-secondary/30 hover:border-primary/30"
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-lg">
                      <Star className="size-3 fill-current" /> Le plus choisi
                    </span>
                  </div>
                )}
                <h4 className="text-lg font-bold mb-3">{plan.name}</h4>
                <div className="mb-5">
                  <span className="text-4xl font-extrabold tabular-nums">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-2">{plan.monthly}</span>
                </div>
                <div className="h-px bg-border mb-5" />
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="size-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={onOpenAuditForm}
                  className={`rounded-xl py-5 ${
                    plan.recommended
                      ? "bg-primary text-primary-foreground hover:brightness-110 shadow-lg"
                      : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                  }`}
                >
                  Demander un devis <ArrowRight className="ml-2 size-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="automation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="rounded-2xl border border-primary bg-primary/5 ring-1 ring-primary p-8 relative shadow-[0_0_60px_-15px_hsl(var(--primary)/0.3)]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-lg">
                  <Zap className="size-3" /> Système complet
                </span>
              </div>
              <div className="text-center mb-8">
                <h4 className="text-2xl font-bold mb-2">Système Client Automatisé</h4>
                <span className="text-4xl font-extrabold tabular-nums">À partir de 990 €</span>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-semibold mb-4 text-foreground">Inclus :</p>
                  <ul className="space-y-3">
                    {["Automatisation des demandes", "Capture des prospects", "Dashboard de suivi", "Configuration complète"].map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Check className="size-4 text-primary shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-4 text-foreground">Adapté à votre secteur :</p>
                  <div className="flex flex-wrap gap-2">
                    {["Artisan", "Commerce", "Immobilier", "Services", "Tourisme", "Agriculture"].map((s) => (
                      <span key={s} className="badge-primary">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-center mt-8">
                <Button onClick={onOpenAuditForm} size="lg" className="bg-primary text-primary-foreground hover:brightness-110 rounded-xl px-8 py-5 shadow-lg">
                  Demander un devis <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <p className="text-center text-sm text-muted-foreground max-w-xl mx-auto">
          Chaque projet est unique. L'audit gratuit permet d'identifier la solution la plus adaptée à votre entreprise.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
