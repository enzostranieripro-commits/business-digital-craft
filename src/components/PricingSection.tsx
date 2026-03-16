import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Zap, Star, ChevronLeft, LayoutDashboard } from "lucide-react";
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

const sectors = [
  {
    id: "artisan",
    label: "Artisan / BTP",
    icon: "🔨",
    desc: "Plombiers, électriciens, maçons, menuisiers...",
    tasks: [
      { title: "Relance devis automatique", detail: "Envoi automatique d'un SMS/email de relance 48h après chaque devis non signé." },
      { title: "Fiche chantier hebdo", detail: "Génération automatique d'un récapitulatif chantier chaque vendredi pour chaque client actif." },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    icon: "🏪",
    desc: "Boutiques, épiceries, fleuristes...",
    tasks: [
      { title: "Alerte stock bas", detail: "Notification automatique quand un produit passe sous le seuil minimum défini." },
      { title: "Email fidélité mensuel", detail: "Envoi automatique d'une offre personnalisée aux clients n'ayant pas commandé depuis 30 jours." },
    ],
  },
  {
    id: "immobilier",
    label: "Immobilier",
    icon: "🏠",
    desc: "Agences immobilières, mandataires...",
    tasks: [
      { title: "Matching acheteur/bien", detail: "Alerte automatique aux acheteurs inscrits dès qu'un bien correspond à leurs critères." },
      { title: "Rapport vendeur hebdo", detail: "Rapport automatisé envoyé chaque semaine au propriétaire : vues, contacts, retours marché." },
    ],
  },
  {
    id: "services",
    label: "Services",
    icon: "💼",
    desc: "Comptables, avocats, consultants...",
    tasks: [
      { title: "Rappel rendez-vous client", detail: "SMS/email automatique 24h avant chaque rendez-vous pour réduire les absences." },
      { title: "Relance facture impayée", detail: "Envoi automatique d'une relance polie à J+7 et J+14 après une facture non réglée." },
    ],
  },
  {
    id: "tourisme",
    label: "Tourisme",
    icon: "🏔️",
    desc: "Hôtels, gîtes, activités...",
    tasks: [
      { title: "Message de bienvenue", detail: "Envoi automatique des infos pratiques (accès, WiFi, recommandations) à la confirmation de réservation." },
      { title: "Demande d'avis post-séjour", detail: "Email automatique 24h après le départ pour inviter le client à laisser un avis Google." },
    ],
  },
  {
    id: "agriculture",
    label: "Agriculture",
    icon: "🌾",
    desc: "Exploitants, coopératives, vente directe...",
    tasks: [
      { title: "Bon de commande hebdo", detail: "Récapitulatif automatique des commandes de la semaine envoyé chaque lundi matin." },
      { title: "Alerte météo culture", detail: "Notification ciblée en cas de gel ou forte pluie prévue dans les 48h sur votre zone." },
    ],
  },
  {
    id: "restaurant",
    label: "Restauration",
    icon: "🍽️",
    desc: "Restaurants, traiteurs, food trucks...",
    tasks: [
      { title: "Confirmation réservation auto", detail: "SMS de confirmation immédiat + rappel la veille pour chaque réservation en ligne." },
      { title: "Collecte d'avis post-repas", detail: "Message automatique envoyé 2h après le service pour recueillir l'avis du client." },
    ],
  },
  {
    id: "autre",
    label: "Autre secteur",
    icon: "📋",
    desc: "Toute activité professionnelle",
    tasks: [
      { title: "Suivi prospect automatisé", detail: "Séquence d'emails de nurturing envoyée automatiquement après chaque nouvelle demande." },
      { title: "Rapport d'activité mensuel", detail: "Synthèse automatique des indicateurs clés envoyée le 1er de chaque mois." },
    ],
  },
];

const tabs = [
  { id: "web", label: "Création Web", icon: "🌐" },
  { id: "marketing", label: "Contenu Marketing", icon: "📣" },
  { id: "automation", label: "Automatisation", icon: "⚡" },
];

const PricingSection = ({ onOpenAuditForm }: PricingSectionProps) => {
  const [activeTab, setActiveTab] = useState("web");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const currentPlans = activeTab === "web" ? axe1 : axe2;
  const currentSector = sectors.find((s) => s.id === selectedSector);

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
                onClick={() => { setActiveTab(tab.id); setSelectedSector(null); }}
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

        {/* Plans grid for web & marketing */}
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
          <AnimatePresence mode="wait">
            {!selectedSector ? (
              <motion.div
                key="sector-select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-3xl mx-auto mb-12"
              >
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold mb-2">Sélectionnez votre secteur d'activité</h3>
                  <p className="text-sm text-muted-foreground">
                    Découvrez les automatisations concrètes prévues pour votre métier
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {sectors.map((s) => (
                    <motion.button
                      key={s.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedSector(s.id)}
                      className="p-5 rounded-2xl border border-border bg-secondary/30 hover:border-primary hover:bg-primary/5 transition-all duration-200 text-center group"
                    >
                      <span className="text-3xl block mb-2">{s.icon}</span>
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors">{s.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{s.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="automation-pricing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl mx-auto mb-12"
              >
                <button
                  onClick={() => setSelectedSector(null)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                  <ChevronLeft className="size-4" /> Changer de secteur
                </button>

                <div className="rounded-2xl border border-primary bg-primary/5 ring-1 ring-primary p-8 relative shadow-[0_0_60px_-15px_hsl(var(--primary)/0.3)]">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-lg">
                      <Zap className="size-3" /> Système complet
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">{currentSector?.icon}</span>
                    <div>
                      <p className="text-xs text-muted-foreground">Solution pour</p>
                      <p className="font-semibold text-primary">{currentSector?.label}</p>
                    </div>
                  </div>

                  <div className="text-center mb-8">
                    <h4 className="text-2xl font-bold mb-2">Système Client Automatisé</h4>
                    <span className="text-4xl font-extrabold tabular-nums">À partir de 990 €</span>
                  </div>

                  <div className="space-y-6">
                    {/* Dashboard de suivi */}
                    <div className="rounded-xl bg-primary/10 border border-primary/20 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <LayoutDashboard className="size-4 text-primary" />
                        <p className="text-sm font-bold text-primary">Dashboard de suivi inclus</p>
                      </div>
                      <ul className="space-y-2">
                        {["Vue en temps réel de vos prospects", "Suivi des automatisations actives", "Tableau de bord personnalisé à votre activité", "Configuration complète incluse"].map((f) => (
                          <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                            <Check className="size-4 text-primary shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tâches récurrentes par métier */}
                    <div>
                      <p className="text-sm font-bold mb-3 text-foreground">
                        2 automatisations clés pour votre métier :
                      </p>
                      <div className="space-y-3">
                        {currentSector?.tasks.map((task, i) => (
                          <motion.div
                            key={task.title}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-xl border border-border bg-secondary/40 p-4"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
                                {i + 1}
                              </span>
                              <p className="text-sm font-semibold">{task.title}</p>
                            </div>
                            <p className="text-xs text-muted-foreground pl-7">{task.detail}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Capture des prospects */}
                    <div>
                      <p className="text-sm font-semibold mb-3 text-foreground">Également inclus :</p>
                      <ul className="space-y-2">
                        {["Capture automatique des prospects", "Notifications en temps réel"].map((f) => (
                          <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                            <Check className="size-4 text-primary shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="text-center mt-8">
                    <Button
                      onClick={onOpenAuditForm}
                      size="lg"
                      className="bg-primary text-primary-foreground hover:brightness-110 rounded-xl px-8 py-5 shadow-lg"
                    >
                      Demander un devis <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <p className="text-center text-sm text-muted-foreground max-w-xl mx-auto">
          Chaque projet est unique. L'audit gratuit permet d'identifier la solution la plus adaptée à votre entreprise.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
