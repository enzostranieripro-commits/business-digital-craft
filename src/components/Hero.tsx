import { motion } from "framer-motion";
import { ArrowRight, Shield, Clock, Users } from "lucide-react";
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
    <section className="relative min-h-screen flex items-center justify-center section-padding overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-[120px]" style={{ background: "hsl(var(--primary))" }} />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-8"
          style={{ textWrap: "balance" as any }}
        >
          Artisans, commerçants, agences immobilières : votre entreprise mérite un site qui{" "}
          <span className="text-gradient">travaille pour vous</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Nous aidons les PME et TPE en Aveyron et en Occitanie à attirer plus de clients grâce à un site web performant, du contenu marketing percutant et des automatisations qui vous font gagner du temps.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:brightness-110 text-base px-8 py-6 rounded-xl"
            onClick={onOpenAuditForm}
          >
            Réserver mon audit gratuit <ArrowRight className="ml-2 size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-border text-foreground hover:bg-secondary text-base px-8 py-6 rounded-xl"
            onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
          >
            Découvrir nos services
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 md:gap-8"
        >
          {reassurance.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="size-4 text-primary" />
              <span>{text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
