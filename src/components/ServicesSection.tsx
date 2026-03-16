import { motion } from "framer-motion";
import { Globe, Image, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeader from "./SectionHeader";

interface ServicesSectionProps {
  onOpenProductForm: (productType: string) => void;
}

const services = [
  {
    icon: Globe,
    title: "Site internet optimisé pour attirer des clients",
    desc: "Un site web performant conçu pour transformer les visiteurs en demandes clients.",
    features: ["Livré en 7 jours", "Optimisé SEO local", "Pensé pour convertir"],
    price: "À partir de 500 €",
    product: "Site internet",
  },
  {
    icon: Image,
    title: "Contenu marketing qui attire l'attention",
    desc: "Des visuels et contenus marketing impactants pour améliorer votre visibilité.",
    features: ["Photos & vidéos pro", "Calendrier éditorial", "Cohérent avec votre image"],
    price: "À partir de 150 €",
    product: "Contenu marketing",
  },
  {
    icon: BarChart3,
    title: "Système automatisé et tableau de bord",
    desc: "Un système simple pour capter et suivre vos prospects.",
    features: ["Gain de temps immédiat", "Fonctionnel 24h/24", "Adapté à votre activité"],
    price: "À partir de 300 €",
    product: "Automatisation",
  },
];

const ServicesSection = ({ onOpenProductForm }: ServicesSectionProps) => (
  <section id="services" className="section-padding relative grain">
    <div className="max-w-6xl mx-auto relative z-10">
      <SectionHeader
        label="NOS SERVICES"
        title="Trois leviers pour"
        highlight="développer votre activité"
        description="Chaque service est pensé pour répondre à un besoin concret des entreprises locales."
      />

      <div className="grid md:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="group card-surface-hover p-6 flex flex-col relative overflow-hidden"
          >
            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/10 group-hover:border-primary/30 transition-colors duration-300">
                  <s.icon className="size-5 text-primary" />
                </div>
                <span className="badge-primary">{s.price}</span>
              </div>
              <h3 className="text-lg font-display font-bold mb-3">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">{s.desc}</p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-primary/60" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full border-primary/30 text-primary hover:bg-primary/10 rounded-xl group/btn transition-all duration-300"
                onClick={() => onOpenProductForm(s.product)}
              >
                Demander un devis
                <ArrowRight className="ml-2 size-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
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
        <button
          onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
          className="group text-primary text-sm hover:underline inline-flex items-center gap-1"
        >
          Voir tous nos services et tarifs détaillés
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </div>
  </section>
);

export default ServicesSection;
