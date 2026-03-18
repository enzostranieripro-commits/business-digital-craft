import { motion } from "framer-motion";
import SectionHeader from "./SectionHeader";
import { Check, X, Minus } from "lucide-react";
import { useAuditModal } from "@/contexts/AuditModalContext";

const criteria = [
  { label: "Design professionnel sur-mesure", agency: true, freelance: "partial", diy: false },
  { label: "Référencement local Google Maps", agency: true, freelance: "partial", diy: false },
  { label: "Délai de livraison < 7 jours", agency: true, freelance: false, diy: "partial" },
  { label: "Suivi & maintenance inclus", agency: true, freelance: false, diy: false },
  { label: "Stratégie de conversion", agency: true, freelance: false, diy: false },
  { label: "Support réactif (< 24h)", agency: true, freelance: "partial", diy: false },
  { label: "Adapté mobile & rapide", agency: true, freelance: "partial", diy: "partial" },
  { label: "Prix transparent, sans surprise", agency: true, freelance: false, diy: true },
];

const renderIcon = (val: boolean | string) => {
  if (val === true) return <Check className="size-5 text-visibility" />;
  if (val === "partial") return <Minus className="size-5 text-conversion" />;
  return <X className="size-5 text-destructive/60" />;
};

const ComparateurSection = () => {
  const { open } = useAuditModal();

  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          label="COMPARATIF"
          title="Pourquoi choisir"
          highlight="AS Consulting ?"
          description="Comparez objectivement les 3 options qui s'offrent à vous."
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card-surface rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="p-4 text-left text-muted-foreground font-medium w-[40%]">Critère</th>
                  <th className="p-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-display font-bold text-primary">Studio Nova</span>
                      <span className="text-xs text-muted-foreground">Agence locale</span>
                    </div>
                  </th>
                  <th className="p-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-semibold">Freelance</span>
                      <span className="text-xs text-muted-foreground">Variable</span>
                    </div>
                  </th>
                  <th className="p-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-semibold">DIY / Wix</span>
                      <span className="text-xs text-muted-foreground">Faites-le vous-même</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((c, i) => (
                  <tr key={i} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                    <td className="p-4 font-medium">{c.label}</td>
                    <td className="p-4 text-center"><div className="flex justify-center">{renderIcon(c.agency)}</div></td>
                    <td className="p-4 text-center"><div className="flex justify-center">{renderIcon(c.freelance)}</div></td>
                    <td className="p-4 text-center"><div className="flex justify-center">{renderIcon(c.diy)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 text-center border-t border-border/20">
            <button onClick={() => open()} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors">
              Obtenir mon audit gratuit
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparateurSection;
