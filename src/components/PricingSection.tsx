import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Layers, ShoppingCart, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuditModal } from "@/contexts/AuditModalContext";
import { supabase } from "@/integrations/supabase/client";
import SectionHeader from "./SectionHeader";

interface OfferOption {
  id: string;
  name: string;
  setup: number;
  monthly: number;
}

interface OfferData {
  name: string;
  tagline: string;
  icon: string;
  color: string;
  monthly: number;
  oneTime: number;
  users: number;
  includes: string[];
  options: OfferOption[];
}

const ICON_MAP: Record<string, any> = { Globe, Layers, ShoppingCart };

const DEFAULT_OFFERS: OfferData[] = [
  { name: "Visibilité", tagline: "Landing page", icon: "Globe", color: "visibility", monthly: 59, oneTime: 1200, users: 18,
    includes: ["Page unique optimisée SEO", "Formulaire de contact", "Design responsive", "Hébergement inclus", "Certificat SSL", "Support email"],
    options: [{ id: "1", name: "Google Calendar", setup: 49, monthly: 9 }, { id: "2", name: "Widget WhatsApp", setup: 29, monthly: 5 }, { id: "3", name: "Analytics", setup: 39, monthly: 9 }, { id: "4", name: "Blog SEO", setup: 99, monthly: 19 }] },
  { name: "Autorité", tagline: "Site vitrine", icon: "Layers", color: "authority", monthly: 119, oneTime: 2400, users: 22,
    includes: ["Jusqu'à 5 pages", "Blog intégré", "Google My Business", "Hébergement inclus", "Certificat SSL", "Support prioritaire"],
    options: [{ id: "1", name: "CRM leads", setup: 99, monthly: 19 }, { id: "2", name: "Prise de RDV", setup: 79, monthly: 15 }, { id: "3", name: "Avis automatisés", setup: 59, monthly: 12 }, { id: "4", name: "Blog + rédaction SEO", setup: 149, monthly: 29 }] },
  { name: "Conversion", tagline: "E-commerce", icon: "ShoppingCart", color: "conversion", monthly: 199, oneTime: 3400, users: 7,
    includes: ["Boutique en ligne", "Paiement sécurisé", "Gestion des stocks", "Hébergement inclus", "Certificat SSL", "Support dédié"],
    options: [{ id: "1", name: "Codes promo", setup: 49, monthly: 9 }, { id: "2", name: "Abonnements récurrents", setup: 99, monthly: 19 }, { id: "3", name: "Analytics avancé", setup: 79, monthly: 15 }, { id: "4", name: "SMS auto", setup: 69, monthly: 12 }] },
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
  const [selectedOptions, setSelectedOptions] = useState<boolean[]>([]);
  const [selectedFormat, setSelectedFormat] = useState(0);
  const [offersData, setOffersData] = useState<OfferData[]>(DEFAULT_OFFERS);

  // Load dynamic pricing from admin_settings
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("admin_settings").select("value").eq("key", "pricing_catalog").maybeSingle() as any;
      if (data?.value && Array.isArray(data.value) && data.value.length === 3) {
        setOffersData(data.value);
      }
    };
    load();
  }, []);

  // Reset selected options when offer changes
  useEffect(() => {
    setSelectedOptions(new Array(offersData[selectedOffer]?.options?.length || 0).fill(false));
  }, [selectedOffer, offersData]);

  const offer = offersData[selectedOffer];
  const optionsMonthly = offer.options.reduce((s, o, i) => s + (selectedOptions[i] ? o.monthly : 0), 0);
  const optionsSetup = offer.options.reduce((s, o, i) => s + (selectedOptions[i] ? o.setup : 0), 0);
  const baseMonthly = offer.monthly + optionsMonthly;

  const oneTimeTotal = offer.oneTime + optionsSetup;
  const totalDisplay = selectedFormat === 0 ? `${baseMonthly}€/mois` : selectedFormat === 1 ? `${Math.round(baseMonthly * 10)}€/an` : `${oneTimeTotal.toLocaleString("fr-FR")}€`;

  const toggleOption = (i: number) => {
    const n = [...selectedOptions];
    n[i] = !n[i];
    setSelectedOptions(n);
  };

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
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid md:grid-cols-3 gap-6">
              {offersData.map((o, i) => {
                const colorMap: Record<string, { bg: string; text: string }> = {
                  visibility: { bg: "bg-visibility/10", text: "text-visibility" },
                  authority: { bg: "bg-primary/10", text: "text-primary" },
                  conversion: { bg: "bg-conversion/10", text: "text-conversion" },
                };
                const c = colorMap[o.color] || colorMap.authority;
                const OfferIcon = ICON_MAP[o.icon] || Globe;
                return (
                  <button key={o.name} onClick={() => { setSelectedOffer(i); setStep(1); }}
                    className={`card-surface p-6 text-left transition-all hover:scale-[1.02] border ${selectedOffer === i ? "ring-2 ring-primary border-primary" : "border-border"} relative`}>
                    {o.color === "authority" && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Le plus choisi</span>}
                    <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                      <OfferIcon className={`size-6 ${c.text}`} />
                    </div>
                    <h3 className="font-bold text-xl">{o.name}</h3>
                    <p className={`text-sm ${c.text} font-medium mb-4`}>{o.tagline}</p>
                    <p className="text-xs text-muted-foreground mb-1">{o.users} clients actifs</p>
                    <p className="text-xs text-muted-foreground mb-0.5">À partir de</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold">{o.monthly}€</span>
                      <span className="text-sm text-muted-foreground">/mois TTC</span>
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground">ou à partir de {o.oneTime.toLocaleString("fr-FR")}€ TTC</p>
                  </button>
                );
              })}
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
                  <button key={opt.id || opt.name} onClick={() => toggleOption(i)}
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
                {offer.options.map((o, i) => selectedOptions[i] && <p key={o.id || o.name} className="text-sm text-muted-foreground">+ {o.name} — {o.monthly}€/mois</p>)}
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
