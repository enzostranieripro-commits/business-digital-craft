import { motion } from "framer-motion";
import { Star, Users, Clock, ThumbsUp, Quote } from "lucide-react";
import SectionHeader from "./SectionHeader";

const stats = [
  { icon: Users, value: "50+", label: "Entreprises accompagnées en Occitanie" },
  { icon: Clock, value: "+10h", label: "Gagnées en moyenne par semaine" },
  { icon: ThumbsUp, value: "98%", label: "De clients satisfaits" },
];

const testimonials = [
  {
    text: "Grâce à Studio Nova, j'ai automatisé mes relances clients et mon site me rapporte enfin des contacts. Je gagne au moins 8h par semaine.",
    name: "Marie D.",
    role: "Gérante — Boutique à Rodez",
  },
  {
    text: "Je ne connaissais rien à l'IA. Ils m'ont tout expliqué simplement et mis en place un système de prise de rendez-vous automatique. Mes clients adorent.",
    name: "Thomas L.",
    role: "Artisan — Millau",
  },
  {
    text: "Le contenu qu'ils créent pour mes réseaux est professionnel et régulier. J'ai doublé mon engagement en 2 mois.",
    name: "Sophie R.",
    role: "Consultante — Villefranche-de-Rouergue",
  },
];

const TestimonialsSection = () => (
  <section className="section-padding">
    <div className="max-w-6xl mx-auto">
      <SectionHeader
        label="RÉSULTATS PROUVÉS"
        title="Des entreprises locales qui"
        highlight="nous font confiance"
        description="Nos clients sont des PME et TPE comme la vôtre. Voici ce qu'ils disent de notre accompagnement."
      />

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="card-surface p-6 md:p-8 grid grid-cols-3 gap-6 mb-10"
      >
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <s.icon className="size-5 text-primary" />
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-bold tabular-nums">{s.value}</span>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Testimonials */}
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="card-surface-hover p-6"
          >
            <Quote className="size-6 text-primary/40 mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="size-4 fill-primary text-primary" />
              ))}
            </div>
            <p className="font-semibold text-sm">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.role}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
