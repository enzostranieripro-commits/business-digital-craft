import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
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

function getResultMessage(answers: string[]) {
  let score = 0;
  // Site
  if (answers[1] === "Non, pas encore" || answers[1] === "Je ne sais pas") score += 3;
  else if (answers[1] === "Oui, mais il est ancien") score += 2;
  // Demandes
  if (answers[2] === "Jamais via le digital" || answers[2] === "Très rarement") score += 3;
  else if (answers[2] === "Quelques-unes par mois") score += 1;
  // Réseaux
  if (answers[3] === "Non, pas du tout" || answers[3] === "J'ai un compte mais inactif") score += 2;
  else if (answers[3] === "Oui, mais rarement") score += 1;
  // Tâches
  if (answers[4] === "Oui, beaucoup" || answers[4] === "Je ne sais pas lesquelles automatiser") score += 2;
  else if (answers[4] === "Quelques-unes") score += 1;

  if (score >= 7) {
    return {
      icon: AlertTriangle,
      color: "text-orange-400",
      title: "Potentiel de croissance très élevé !",
      text: `Votre entreprise dans le secteur "${answers[0]}" a un potentiel digital considérable encore inexploité. Nos experts peuvent vous aider à générer des dizaines de demandes clients supplémentaires chaque mois grâce à un site optimisé, du contenu ciblé et des automatisations sur mesure.`,
      cta: "Ne laissez pas vos concurrents prendre de l'avance — réservez votre audit gratuit maintenant.",
    };
  } else if (score >= 4) {
    return {
      icon: TrendingUp,
      color: "text-primary",
      title: "Vous avez une bonne base, mais du potentiel à exploiter !",
      text: `Pour une entreprise dans le secteur "${answers[0]}", il y a clairement des leviers de croissance à activer. Un audit gratuit vous permettra d'identifier les actions prioritaires pour doubler vos résultats digitaux.`,
      cta: "Découvrez exactement quoi améliorer — c'est gratuit et sans engagement.",
    };
  }
  return {
    icon: Sparkles,
    color: "text-primary",
    title: "Vous êtes sur la bonne voie !",
    text: `Votre présence digitale est déjà en place, mais il reste des optimisations pour maximiser votre retour sur investissement dans le secteur "${answers[0]}". Un expert peut identifier les 2-3 actions clés qui feront la différence.`,
    cta: "Validez votre stratégie avec un expert — audit 100% gratuit.",
  };
}

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

  const result = done ? getResultMessage(answers) : null;

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
              <div className="absolute top-0 left-0 right-0 h-1 bg-border rounded-t-xl overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: `${(step / questions.length) * 100}%` }}
                  animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Question {step + 1} / {questions.length}
              </p>
              <h3 className="text-xl font-semibold mb-6">{questions[step].q}</h3>
              <div className="grid grid-cols-2 gap-3">
                {questions[step].options.map((opt) => (
                  <motion.button
                    key={opt}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(opt)}
                    className="text-left px-4 py-3 rounded-xl border border-border text-sm hover:border-primary hover:bg-primary/5 transition-all duration-200"
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-surface p-8 text-center glow-subtle"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <result.icon className={`size-8 ${result.color}`} />
              </div>
              <h3 className="text-2xl font-bold mb-3">{result.title}</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {result.text}
              </p>
              <p className="text-sm font-medium text-foreground mb-6">
                {result.cta}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:brightness-110 rounded-xl glow-subtle"
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
