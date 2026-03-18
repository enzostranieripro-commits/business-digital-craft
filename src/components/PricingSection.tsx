import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Layers, ShoppingCart, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuditModal } from "@/contexts/AuditModalContext";
import SectionHeader from "./SectionHeader";

const offersData = [
  { name: "Visibilité", tagline: "Landing page", icon: Globe, color: "visibility", monthly: 59, oneTime: 1200, users: 18,
    includes: ["Page unique optimisée SEO", "Formulaire de contact", "Design responsive", "Hébergement inclus", "Certificat SSL", "Support email"],
    options: [{ name: "Google Calendar", setup: 49, monthly: 9 }, { name: "Widget WhatsApp", setup: 29, monthly: 5 }, { name: "Analytics", setup: 39, monthly: 9 }, { name: "Blog SEO", setup: 99, monthly: 19 }] },
  { name: "Autorité", tagline: "Site vitrine", icon: Layers, color: "authority", monthly: 119, oneTime: 2400, users: 22,
    includes: ["Jusqu'à 5 pages", "Blog intégré", "Google My Business", "Hébergement inclus", "Certificat SSL", "Support prioritaire"],
    options: [{ name: "CRM leads", setup: 99, monthly: 19 }, { name: "Prise de RDV", setup: 79, monthly: 15 }, { name: "Avis automatisés", setup: 59, monthly: 12 }, { name: "Blog + rédaction SEO", setup: 149, monthly: 29 }] },
  { name: "Conversion", tagline: "E-commerce", icon: ShoppingCart, color: "conversion", monthly: 199, oneTime: 3400, users: 7,
    includes: ["Boutique en ligne", "Paiement sécurisé", "Gestion des stocks", "Hébergement inclus", "Certificat SSL", "Support dédié"],
    options: [{ name: "Codes promo", setup: 49, monthly: 9 }, { name: "Abonnements récurrents", setup: 99, monthly: 19 }, { name: "Analytics avancé", setup: 79, monthly: 15 }, { name: "SMS auto", setup: 69, monthly: 12 }] },
];

const formats = [
  { name: "Mensuel", label: "Sans engagement", badge: null },
  { name: "Annuel", label: "2 mois offerts", badge: "Économique" },
  { name: "Achat unique", label: "Paiement unique", badge: null },
];

const stepLabels = ["Offre", "Contenu", "Options", "Prix"];

const PricingSection = () => {
  const { open } = useAuditModal();
  const [step, setStep] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([false, false, false, false]);
  const [selectedFormat, setSelectedFormat] = useState(0);

  const offer = offersData[selectedOffer];
  const optionsMonthly = offer.options.reduce((s, o, i) => s + (selectedOptions[i] ? o.monthly : 0), 0);
  const optionsSetup = offer.options.reduce((s, o, i) => s + (selectedOptions[i] ? o.setup : 0), 0);
  const baseMonthly = offer.monthly + optionsMonthly;

  const totalDisplay = selectedFormat === 0 ? `${baseMonthly}€/mois` : selectedFormat === 1 ? `${Math.round(baseMonthly * 10)}€/an` : `${baseMonthly * 12 + optionsSetup}€ unique`;

  const toggleOption = (i: number) => { const n = [...selectedOptions]; n[i] = !n[i]; setSelectedOptions(n); };

  return (
    <section id="tarifs" className="section-padding">
      <div className="max-w-4xl mx-auto">
        <SectionHeader label="TARIFS" title="Configurez votre" highlight="offre sur-mesure" />
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {stepLabels.map((s, i) => (
            <button key={s} onClick={() => setStep(i)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${step === i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {i + 1}. {s}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid md:grid-cols-3 gap-4">
              {offersData.map((o, i) => (
                <button key={o.name} onClick={() => { setSelectedOffer(i); setSelectedOptions([false, false, false, false]); setStep(1); }}
                  className={`card-surface p-6 text-left transition-all hover:scale-[1.02] ${selectedOffer === i ? "ring-2 ring-primary" : ""}`}>
                  <div className={`h-1 rounded-full mb-4 ${o.color === "visibility" ? "bg-visibility" : o.color === "authority" ? "bg-primary" : "bg-conversion"}`} />
                  <o.icon className={`size-6 mb-2 ${o.color === "visibility" ? "text-visibility" : o.color === "authority" ? "text-primary" : "text-conversion"}`} />
                  <h3 className="font-bold text-lg">{o.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{o.tagline}</p>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">À partir de</p>
                    <p className="text-2xl font-extrabold">{o.monthly}€<span className="text-sm font-normal text-muted-foreground">/mois TTC</span></p>
                    <p className="text-sm font-semibold text-muted-foreground">ou {o.oneTime.toLocaleString("fr-FR")}€ <span className="text-xs font-normal">achat unique TTC</span></p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{o.users} clients actifs</p>
                </button>
              ))}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card-surface p-8">
              <h3 className="font-bold text-xl mb-6">Contenu inclus — {offer.name}</h3>
              <ul className="space-y-3 mb-6">
                {offer.includes.map((inc) => <li key={inc} className="flex items-center gap-3 text-sm"><Check className="size-4 text-primary" />{inc}</li>)}
              </ul>
              <p className="text-xs text-muted-foreground">{offer.users} entreprises ont choisi cette offre</p>
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setStep(0)}><ArrowLeft className="size-4 mr-2" />Retour</Button>
                <Button onClick={() => setStep(2)}>Options<ArrowRight className="size-4 ml-2" /></Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card-surface p-8">
              <h3 className="font-bold text-xl mb-6">Options — {offer.name}</h3>
              <div className="space-y-3">
                {offer.options.map((opt, i) => (
                  <button key={opt.name} onClick={() => toggleOption(i)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedOptions[i] ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                    <div className="text-left"><p className="font-medium text-sm">{opt.name}</p><p className="text-xs text-muted-foreground">Setup {opt.setup}€ + {opt.monthly}€/mois</p></div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOptions[i] ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                      {selectedOptions[i] && <Check className="size-3 text-primary-foreground" />}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="size-4 mr-2" />Retour</Button>
                <Button onClick={() => setStep(3)}>Voir le prix<ArrowRight className="size-4 ml-2" /></Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card-surface p-8">
              <h3 className="font-bold text-xl mb-6">Format & prix — {offer.name}</h3>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {formats.map((f, i) => (
                  <button key={f.name} onClick={() => setSelectedFormat(i)}
                    className={`p-4 rounded-xl border text-center transition-all ${selectedFormat === i ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                    <p className="font-medium text-sm">{f.name}</p><p className="text-xs text-muted-foreground">{f.label}</p>
                    {f.badge && <span className="section-label text-[10px] mt-2">{f.badge}</span>}
                  </button>
                ))}
              </div>
              <div className="bg-secondary/50 rounded-xl p-6 mb-6">
                <p className="text-sm text-muted-foreground mb-2">Récapitulatif</p>
                <p className="text-sm">Offre {offer.name} — à partir de {offer.monthly}€/mois TTC</p>
                <p className="text-sm text-muted-foreground">ou à partir de {offer.oneTime.toLocaleString("fr-FR")}€ achat unique TTC</p>
                {offer.options.map((o, i) => selectedOptions[i] && <p key={o.name} className="text-sm text-muted-foreground">+ {o.name} — {o.monthly}€/mois</p>)}
                <div className="border-t border-border mt-4 pt-4">
                  <p className="text-xs text-muted-foreground mb-1">À partir de</p>
                  <p className="text-2xl font-extrabold">{totalDisplay} <span className="text-sm font-normal text-muted-foreground">TTC</span></p>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="size-4 mr-2" />Retour</Button>
                <Button className="bg-primary text-primary-foreground animate-pulse-glow" onClick={() => open(offer.name)}>Demander un audit gratuit<ArrowRight className="size-4 ml-2" /></Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default PricingSection;
