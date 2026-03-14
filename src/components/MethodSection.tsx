import { motion } from "framer-motion";
import { Search, Settings, Rocket } from "lucide-react";
import SectionHeader from "./SectionHeader";

const steps = [
  { num: "01", icon: Search, title: "Audit gratuit", desc: "On échange 30 minutes pour comprendre votre activité, vos défis et vos objectifs. Aucun engagement, aucun jargon.", highlight: "Vous repartez avec un diagnostic clair et un plan d'action personnalisé." },
  { num: "02", icon: Settings, title: "Mise en place", desc: "On construit votre solution sur-mesure : site web, automatisations ou contenu marketing. Vous validez chaque étape.", highlight: "Livraison rapide en 7 jours ouvrés en moyenne." },
  { num: "03", icon: Rocket, title: "Résultats mesurables", desc: "Votre solution est en ligne. On mesure les résultats ensemble et on ajuste si nécessaire pour maximiser votre retour.", highlight: "Suivi inclus pour garantir votre satisfaction." },
];

const MethodSection = () => (
  <section className="section-padding">
    <div className="max-w-6xl mx-auto">
      <SectionHeader
        label="NOTRE MÉTHODE"
        title="Un accompagnement"
        highlight="simple et transparent"
        description="Pas besoin d'être expert en technologie. On vous guide à chaque étape, de l'audit initial jusqu'aux premiers résultats."
      />

      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="card-surface-hover p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="size-5 text-primary" />
              </div>
              <span className="text-4xl font-bold text-muted-foreground/20 tabular-nums">{s.num}</span>
            </div>
            <h3 className="text-lg font-semibold mb-3">{s.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">{s.desc}</p>
            <p className="text-primary text-sm">{s.highlight}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default MethodSection;
