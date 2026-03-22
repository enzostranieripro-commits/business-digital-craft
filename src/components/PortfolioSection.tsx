import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SectionHeader from "./SectionHeader";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  name: string;
  sector: string;
  image: string;
  result: string;
  offer: string;
  color: string;
  description?: string;
}

const DEFAULT_PROJECTS: Project[] = [
  { name: "Durand Plomberie",   sector: "Artisan BTP",       image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop", result: "+320% de demandes de devis", offer: "Visibilité", color: "visibility" },
  { name: "Le Petit Comptoir",  sector: "Restauration",      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop", result: "Top 3 Google Maps en 2 mois",  offer: "Autorité",   color: "authority"  },
  { name: "Studio Lumière",     sector: "Photographe",       image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&h=400&fit=crop", result: "9 réservations/mois (vs 4 avant)", offer: "Autorité", color: "authority" },
  { name: "Maison Fleurie",     sector: "Fleuriste",         image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&h=400&fit=crop", result: "30% du CA en ligne",          offer: "Conversion", color: "conversion" },
  { name: "Cabinet Vidal",      sector: "Kinésithérapeute",  image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop", result: "2h/jour de secrétariat économisées", offer: "Autorité", color: "authority" },
  { name: "Immo Sud",           sector: "Immobilier",        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop", result: "+250% de mandats en 3 mois", offer: "Conversion", color: "conversion" },
];

const badgeColor = (c: string) =>
  c === "visibility" ? "bg-visibility/20 text-visibility" :
  c === "authority"  ? "bg-primary/20 text-primary" :
                       "bg-conversion/20 text-conversion";

const PortfolioSection = () => {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "portfolio")
        .maybeSingle() as any;
      if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
        setProjects(data.value);
      }
    };
    load();
  }, []);

  return (
    <section id="portfolio" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          label="NOS RÉALISATIONS"
          title="Des résultats concrets,"
          highlight="pas des promesses."
          description="Découvrez comment nos clients ont transformé leur activité grâce à leur nouveau site."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <motion.div
              key={`${p.name}-${i}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-surface group overflow-hidden rounded-2xl"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={p.image}
                  alt={`Projet ${p.name}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor(p.color)}`}>
                  {p.offer}
                </span>
              </div>
              <div className="p-5">
                <p className="text-xs text-muted-foreground">{p.sector}</p>
                <h3 className="font-display font-bold text-lg mt-1">{p.name}</h3>
                {p.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                )}
                <div className="flex items-center gap-2 mt-3 text-sm font-semibold text-visibility">
                  <TrendingUp className="size-4" />
                  {p.result}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <p className="text-muted-foreground text-sm">
            <span className="font-bold text-foreground">47+</span> projets livrés avec succès en Aveyron & Occitanie
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PortfolioSection;
