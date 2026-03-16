import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Star, Users, Clock, ThumbsUp, Quote } from "lucide-react";
import { useEffect } from "react";
import SectionHeader from "./SectionHeader";

const stats = [
  { icon: Users, value: 50, suffix: "+", label: "Entreprises accompagnées en Occitanie" },
  { icon: Clock, value: 10, suffix: "h+", label: "Gagnées en moyenne par semaine" },
  { icon: ThumbsUp, value: 98, suffix: "%", label: "De clients satisfaits" },
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

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => `${Math.round(latest)}${suffix}`);

  useEffect(() => {
    const controls = animate(count, value, { duration: 2, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span className="text-2xl md:text-3xl font-display font-black tabular-nums">{rounded}</motion.span>;
}

const TestimonialsSection = () => (
  <section className="section-padding relative grain">
    <div className="max-w-6xl mx-auto relative z-10">
      <SectionHeader
        label="RÉSULTATS PROUVÉS"
        title="Des entreprises locales qui"
        highlight="nous font confiance"
        description="Nos clients sont des PME et TPE comme la vôtre. Voici ce qu'ils disent de notre accompagnement."
      />

      {/* Stats with glass */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass rounded-2xl p-6 md:p-8 grid grid-cols-3 gap-6 mb-10"
      >
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
              <s.icon className="size-5 text-primary" />
            </div>
            <div>
              <AnimatedCounter value={s.value} suffix={s.suffix} />
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
            className="group card-surface-hover p-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <Quote className="size-6 text-primary/30 mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="size-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="font-semibold text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
