import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Layers, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuditModal } from "@/contexts/AuditModalContext";
import SectionHeader from "./SectionHeader";
import { supabase } from "@/integrations/supabase/client";

interface OfferData {
  name: string;
  tagline: string;
  icon: string;
  color: "visibility" | "authority" | "conversion";
  monthly: number;
  oneTime: number;
  users: number;
  includes: string[];
  options: { id: string; name: string; setup: number; monthly: number }[];
}

const ICON_MAP: Record<string, React.ElementType> = { Globe, Layers, ShoppingCart };

const DEFAULT_OFFERS: OfferData[] = [
  {
    name: "Visibilité", tagline: "Landing page", icon: "Globe", color: "visibility",
    monthly: 59, oneTime: 1200, users: 18,
    includes: ["Page unique optimisée SEO", "Formulaire de contact", "Responsive mobile"],
    options: [],
  },
  {
    name: "Autorité", tagline: "Site vitrine multi-pages", icon: "Layers", color: "authority",
    monthly: 119, oneTime: 2400, users: 22,
    includes: ["Jusqu'à 5 pages", "Blog intégré", "Google My Business"],
    options: [],
  },
  {
    name: "Conversion", tagline: "Site e-commerce", icon: "ShoppingCart", color: "conversion",
    monthly: 199, oneTime: 3400, users: 7,
    includes: ["Boutique en ligne", "Paiement sécurisé", "Gestion des stocks"],
    options: [],
  },
];

const colorClasses = {
  visibility: { bg: "bg-visibility/10", text: "text-visibility", btn: "bg-visibility hover:bg-visibility/90" },
  authority:  { bg: "bg-primary/10",    text: "text-primary",    btn: "bg-primary hover:bg-primary/90" },
  conversion: { bg: "bg-conversion/10", text: "text-conversion", btn: "bg-conversion hover:bg-conversion/90" },
};

const ServicesSection = () => {
  const { open } = useAuditModal();
  const [offers, setOffers] = useState<OfferData[]>(DEFAULT_OFFERS);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "pricing_catalog")
        .maybeSingle() as any;
      if (data?.value && Array.isArray(data.value) && data.value.length === 3) {
        setOffers(data.value);
      }
    };
    load();
  }, []);

  return (
    <section id="services" className="section-padding">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          label="NOS OFFRES"
          title="Une offre adaptée à"
          highlight="chaque besoin"
          description="Du simple site vitrine au e-commerce, nous avons la solution pour développer votre activité."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {offers.map((o, i) => {
            const c = colorClasses[o.color] || colorClasses.authority;
            const OfferIcon = ICON_MAP[o.icon] || Globe;
            const isPopular = o.color === "authority";
            return (
              <motion.div
                key={o.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-surface p-6 relative border border-border"
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Le plus choisi
                  </span>
                )}
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                  <OfferIcon className={`size-6 ${c.text}`} />
                </div>
                <h3 className="font-bold text-xl">{o.name}</h3>
                <p className={`text-sm ${c.text} font-medium mb-4`}>{o.tagline}</p>
                <ul className="space-y-2 mb-6">
                  {o.includes.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className={`size-4 ${c.text}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mb-0.5">À partir de</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-extrabold">{o.monthly}€</span>
                  <span className="text-sm text-muted-foreground">/mois TTC</span>
                </div>
                <p className="text-xs text-muted-foreground mb-5">
                  ou {o.oneTime.toLocaleString("fr-FR")}€ achat unique TTC
                </p>
                <Button
                  className={`w-full rounded-xl ${c.btn} text-white`}
                  onClick={() => open(o.name)}
                >
                  Demander un audit
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
