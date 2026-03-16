import { motion } from "framer-motion";
import { ArrowRight, Shield, Clock, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  onOpenAuditForm: () => void;
}

const Hero = ({ onOpenAuditForm }: HeroProps) => {
  const reassurance = [
    { icon: Shield, text: "Audit gratuit et sans engagement" },
    { icon: Clock, text: "Réponse sous 24h" },
    { icon: Users, text: "Accompagnement sur mesure" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center section-padding overflow-hidden grain">
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-20 blur-[150px] animate-float" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(300 80% 60%))" }} />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-10 blur-[120px]" style={{ background: "hsl(var(--premium-gold))", animation: "float 8s ease-in-out infinite reverse" }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(hsl(var(--foreground) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8"
        >
          <Sparkles className="size-3.5 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Agence digitale IA — Aveyron & Occitanie</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-6xl lg:text-7xl font-display font-black leading-[0.95] mb-8 tracking-tight"
        >
          Artisans, commerçants, agences immobilières : votre entreprise mérite un site qui{" "}
          <span className="text-gradient">travaille pour vous</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Nous aidons les PME et TPE en Aveyron et en Occitanie à attirer plus de clients grâce à un site web performant, du contenu marketing percutant et des automatisations qui vous font gagner du temps.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
        >
          <Button
            size="lg"
            className="group bg-primary text-primary-foreground hover:brightness-110 text-base px-8 py-6 rounded-xl animate-pulse-glow transition-all duration-300"
            onClick={onOpenAuditForm}
          >
            Réserver mon audit gratuit
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="glass border-border/50 text-foreground hover:bg-secondary text-base px-8 py-6 rounded-xl transition-all duration-300 hover:border-primary/30"
            onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
          >
            Découvrir nos services
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="flex flex-wrap justify-center gap-6 md:gap-8"
        >
          {reassurance.map(({ icon: Icon, text }, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-2.5 text-sm text-muted-foreground glass rounded-full px-4 py-2"
            >
              <Icon className="size-4 text-primary" />
              <span>{text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
