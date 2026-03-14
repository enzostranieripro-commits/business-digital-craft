import { motion } from "framer-motion";
import { Globe, Megaphone, Zap } from "lucide-react";
import SectionHeader from "./SectionHeader";

const solutions = [
  {
    icon: Globe,
    title: "Attirer des visiteurs grâce à un site internet optimisé",
    desc: "Un site rapide, bien référencé sur Google et conçu avec un seul objectif : que chaque visiteur vous contacte.",
    features: ["Optimisé pour Google", "Design pensé conversion", "Adapté mobile"],
    stat: "×3",
    statLabel: "plus de contacts en moyenne",
  },
  {
    icon: Megaphone,
    title: "Développer la visibilité grâce au contenu marketing",
    desc: "Vidéos, visuels et textes créés avec l'IA, adaptés à votre image de marque. Publiez régulièrement sans y passer vos soirées.",
    features: ["Photos & vidéos professionnelles", "Contenu adapté à votre marque", "Calendrier éditorial inclus"],
    stat: "×2",
    statLabel: "d'engagement en plus",
  },
  {
    icon: Zap,
    title: "Gérer les demandes grâce à l'automatisation",
    desc: "Nous mettons en place des outils intelligents qui gèrent vos relances, vos rendez-vous et vos demandes — automatiquement, 24h/24.",
    features: ["Relances automatiques", "Prise de rendez-vous en ligne", "Tri intelligent des demandes"],
    stat: "+10h",
    statLabel: "gagnées par semaine en moyenne",
  },
];

const SolutionsSection = () => (
  <section className="section-padding">
    <div className="max-w-6xl mx-auto">
      <SectionHeader
        label="NOS SOLUTIONS"
        title="Des réponses concrètes pour"
        highlight="chaque défi"
        description="Pas de jargon technique, pas de promesses vagues. Des solutions claires, adaptées aux entreprises locales d'Aveyron et d'Occitanie."
      />

      <div className="grid md:grid-cols-3 gap-6">
        {solutions.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="card-surface-hover p-6 flex flex-col"
          >
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
              <s.icon className="size-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-3">{s.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">{s.desc}</p>
            <ul className="space-y-2 mb-6 flex-1">
              {s.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-4 text-center">
              <span className="text-3xl font-bold text-primary tabular-nums">{s.stat}</span>
              <p className="text-xs text-muted-foreground mt-1">{s.statLabel}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SolutionsSection;
