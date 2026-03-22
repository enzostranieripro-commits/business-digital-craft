import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  name: string;
  job: string;
  city: string;
  quote: string;
  before: string;
  after: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { name: "Marc D.",    job: "Plombier",       city: "Rodez",    quote: "En 3 semaines, je suis passé de 0 contact en ligne à 10 demandes par semaine.", before: "0 contact/sem.",      after: "10 contacts/sem." },
  { name: "Claire L.",  job: "Photographe",    city: "Albi",     quote: "Mon nouveau site reflète enfin la qualité de mon travail. Les réservations ont doublé.", before: "4 réservations/mois", after: "9 réservations/mois" },
  { name: "Sophie M.",  job: "Restauratrice",  city: "Millau",   quote: "De invisible sur Google à Top 3 Google Maps en 2 mois.",          before: "Invisible",             after: "Top 3 Google Maps" },
  { name: "Pierre V.",  job: "Kiné",           city: "Cahors",   quote: "La prise de RDV en ligne m'a fait gagner un temps fou.",          before: "2h/jour au tél.",        after: "15 min/jour" },
  { name: "Léa B.",     job: "Fleuriste",      city: "Figeac",   quote: "Ma boutique en ligne représente maintenant 30% de mon chiffre d'affaires.", before: "0€ en ligne", after: "30% du CA" },
  { name: "Thomas R.",  job: "Agent immo",     city: "Montauban",quote: "Le site génère des mandats qualifiés chaque semaine.",            before: "2 mandats/mois",         after: "7 mandats/mois" },
];

// Génère des initiales depuis un nom
const getInitials = (name: string) => {
  const parts = name.replace(".", "").trim().split(" ");
  return parts.map((p) => p[0]?.toUpperCase()).join("").slice(0, 2);
};

const avatarColors = [
  "bg-primary/20 text-primary",
  "bg-visibility/20 text-visibility",
  "bg-conversion/20 text-conversion",
];

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "testimonials")
        .maybeSingle() as any;
      if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
        setTestimonials(data.value);
      }
    };
    load();
  }, []);

  return (
    <section className="section-padding">
      <div className="max-w-6xl mx-auto">
        <SectionHeader label="TÉMOIGNAGES" title="Ils nous font" highlight="confiance" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={`${t.name}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-surface p-6"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="size-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 italic">"{t.quote}"</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar avec initiales */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                    {getInitials(t.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.job}, {t.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground line-through">{t.before}</p>
                  <p className="text-sm font-semibold text-primary">{t.after}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
