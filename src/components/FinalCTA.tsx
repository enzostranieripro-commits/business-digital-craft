import { motion } from "framer-motion";
import { ArrowRight, Gift, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FinalCTAProps {
  onOpenAuditForm: () => void;
}

const FinalCTA = ({ onOpenAuditForm }: FinalCTAProps) => (
  <section className="section-padding relative overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-[500px] h-[500px] rounded-full opacity-15 blur-[150px]" style={{ background: "hsl(var(--primary))" }} />
    </div>

    <div className="relative z-10 max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="badge-primary mb-6 inline-flex items-center gap-2">
          <Gift className="size-3" /> Audit offert — Places limitées chaque mois
        </span>

        <h2 className="text-3xl md:text-5xl font-bold mt-6 mb-6" style={{ textWrap: "balance" as any }}>
          Prêt à développer <span className="text-gradient">votre activité ?</span>
        </h2>

        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
          Réservez un appel gratuit de 30 minutes avec notre équipe. On analyse ensemble votre situation et on vous propose un plan d'action clair et concret.
        </p>

        <ul className="space-y-3 text-left max-w-md mx-auto mb-8">
          {[
            "Un diagnostic complet de votre présence en ligne",
            "Des recommandations personnalisées et actionnables",
            "Une estimation de budget transparente",
            "Aucun engagement, aucune obligation",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle className="size-4 text-primary mt-0.5 shrink-0" /> {item}
            </li>
          ))}
        </ul>

        <Button
          size="lg"
          className="bg-primary text-primary-foreground hover:brightness-110 px-10 py-6 text-base rounded-xl glow-subtle"
          onClick={onOpenAuditForm}
        >
          Réserver mon audit gratuit <ArrowRight className="ml-2 size-4" />
        </Button>

        <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-2">
          <Clock className="size-3" /> 30 min · Gratuit · Sans engagement
        </p>
      </motion.div>
    </div>
  </section>
);

export default FinalCTA;
