import { motion } from "framer-motion";
import { Globe, Clock, Share2 } from "lucide-react";
import SectionHeader from "./SectionHeader";

const problems = [
  {
    icon: Globe,
    title: "Votre site internet génère peu de visites ?",
    text: "Votre site existe, mais il ne génère ni contacts ni demandes. Les visiteurs arrivent et repartent sans jamais vous contacter.",
    badge: "90 % des sites vitrines n'ont aucun CTA",
  },
  {
    icon: Clock,
    title: "Vous perdez un temps précieux chaque semaine",
    text: "Répondre aux demandes, suivre les prospects, organiser les rendez-vous… Ces tâches répétitives vous éloignent de ce qui fait vraiment grandir votre entreprise.",
    badge: "+10h perdues chaque semaine",
  },
  {
    icon: Share2,
    title: "Votre contenu ne génère pas de retour",
    text: "Vous publiez sur les réseaux mais sans stratégie claire. Résultat : peu de visibilité et aucun prospect qualifié.",
    badge: "Du contenu sans stratégie = invisible",
  },
];

const ProblemSection = () => (
  <section className="section-padding">
    <div className="max-w-6xl mx-auto">
      <SectionHeader
        label="LE CONSTAT"
        title="Vous vous reconnaissez dans"
        highlight="ces situations ?"
        description="Ce sont les défis les plus fréquents que rencontrent les entreprises locales. La bonne nouvelle : chacun a une solution concrète."
      />

      <div className="grid md:grid-cols-3 gap-6">
        {problems.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="card-surface-hover p-6 flex flex-col"
          >
            <div className="size-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-5">
              <p.icon className="size-5 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-3">{p.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-5">{p.text}</p>
            <span className="badge-alert text-xs">{p.badge}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProblemSection;
