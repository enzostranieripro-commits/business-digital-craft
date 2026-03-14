import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeader from "./SectionHeader";

const questions = [
  {
    q: "Quel est votre secteur d'activité ?",
    options: ["Artisan / BTP", "Commerce", "Immobilier", "Services", "Tourisme", "Agriculture", "Restaurant", "Autre"],
  },
  {
    q: "Avez-vous déjà un site internet ?",
    options: ["Oui, mais il est ancien", "Oui, il est récent", "Non, pas encore", "Je ne sais pas"],
  },
  {
    q: "Recevez-vous des demandes clients régulièrement ?",
    options: ["Oui, plusieurs par semaine", "Quelques-unes par mois", "Très rarement", "Jamais via le digital"],
  },
  {
    q: "Êtes-vous présent sur les réseaux sociaux ?",
    options: ["Oui, je publie régulièrement", "Oui, mais rarement", "Non, pas du tout", "J'ai un compte mais inactif"],
  },
  {
    q: "Avez-vous des tâches répétitives dans votre quotidien ?",
    options: ["Oui, beaucoup", "Quelques-unes", "Pas vraiment", "Je ne sais pas lesquelles automatiser"],
  },
];

interface DiagnosticSectionProps {
  onOpenAuditForm: () => void;
}

const DiagnosticSection = ({ onOpenAuditForm }: DiagnosticSectionProps) => {
  const [quizOpen, setQuizOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
      // Save to localStorage for admin
      const diagnostics = JSON.parse(localStorage.getItem("diagnostics") || "[]");
      diagnostics.push({ answers: newAnswers, date: new Date().toISOString() });
      localStorage.setItem("diagnostics", JSON.stringify(diagnostics));
    }
  };

  const reset = () => {
    setQuizOpen(false);
    setStep(0);
    setAnswers([]);
    setDone(false);
  };

  return (
    <section id="diagnostic" className="section-padding">
      <div className="max-w-3xl mx-auto">
        <SectionHeader
          label="DIAGNOSTIC GRATUIT"
          title="Découvrez comment votre entreprise peut"
          highlight="attirer plus de clients"
          description="Analysez votre présence en ligne en répondant à quelques questions rapides."
        />

        <AnimatePresence mode="wait">
          {!quizOpen ? (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:brightness-110 px-10 py-6 text-base rounded-xl"
                onClick={() => setQuizOpen(true)}
              >
                Lancer le diagnostic gratuit <ArrowRight className="ml-2 size-4" />
              </Button>
            </motion.div>
          ) : !done ? (
            <motion.div
              key={`q-${step}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="card-surface p-8 relative"
            >
              {/* Progress bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-border rounded-t-xl overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Question {step + 1} / {questions.length}
              </p>
              <h3 className="text-xl font-semibold mb-6">{questions[step].q}</h3>
              <div className="grid grid-cols-2 gap-3">
                {questions[step].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className="text-left px-4 py-3 rounded-lg border border-border text-sm hover:border-primary hover:bg-primary/5 transition-all duration-200"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-surface p-8 text-center glow-subtle"
            >
              <CheckCircle className="size-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Diagnostic terminé !</h3>
              <p className="text-muted-foreground mb-6">
                D'après vos réponses, votre entreprise a un fort potentiel de croissance digitale. Un expert peut vous proposer un plan d'action concret et personnalisé.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:brightness-110 rounded-xl"
                  onClick={() => { reset(); onOpenAuditForm(); }}
                >
                  Réserver un audit gratuit <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button variant="outline" onClick={reset} className="rounded-xl">
                  Recommencer
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DiagnosticSection;
