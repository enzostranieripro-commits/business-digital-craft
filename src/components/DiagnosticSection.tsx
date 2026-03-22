import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuditModal } from "@/contexts/AuditModalContext";
import { supabase } from "@/integrations/supabase/client";
import SectionHeader from "./SectionHeader";

const villes = [
  "Rodez","Millau","Villefranche-de-Rouergue","Onet-le-Château","Decazeville",
  "Espalion","Saint-Affrique","Toulouse","Montpellier","Albi","Cahors",
  "Montauban","Nîmes","Perpignan","Carcassonne","Béziers","Figeac","Castres","Mende",
];

const questions = [
  {
    q: "Quel est votre secteur d'activité ?",
    type: "select" as const,
    options: ["Artisan BTP","Restauration","Commerce","Santé","Immobilier","Tourisme","Services","Autre"],
  },
  {
    q: "Avez-vous déjà un site internet ?",
    type: "single" as const,
    options: ["Oui, mais il est ancien","Oui, il est récent","Non, pas encore","Je ne sais pas"],
  },
  {
    q: "Combien de demandes clients recevez-vous par semaine ?",
    type: "single" as const,
    options: ["Plus de 5","2 à 5","Moins de 2","Aucune"],
  },
  {
    q: "Êtes-vous présent sur les réseaux sociaux ?",
    type: "single" as const,
    options: ["Oui, régulièrement","Oui, mais rarement","Non, pas du tout","Compte inactif"],
  },
  {
    q: "Quelles tâches répétitives aimeriez-vous automatiser ?",
    type: "multi" as const,
    options: ["Prise de RDV","Envoi de devis","Relances clients","Gestion des réseaux","Facturation","Aucune"],
  },
];

/**
 * Logique améliorée :
 * - Conversion  : beaucoup de demandes (>5/sem) OU secteur Commerce/Immobilier avec site existant
 * - Autorité    : site existant ancien OU 2-5 demandes/sem OU secteur à forte crédibilité (Santé, Immobilier)
 * - Visibilité  : pas de site OU peu/aucune demande
 */
function getRecommendation(answers: string[]): string {
  const [secteur, aSite, demandes, , taches] = answers;

  const secteurConversion = ["Commerce", "Immobilier"].includes(secteur);
  const secteurAutorite = ["Santé", "Tourisme", "Services"].includes(secteur);
  const beaucoupDemandes = demandes === "Plus de 5";
  const demandes2a5 = demandes === "2 à 5";
  const siteAncien = aSite === "Oui, mais il est ancien";
  const pasDeSite = aSite === "Non, pas encore" || aSite === "Je ne sais pas";
  const automatisationPoussee = taches && !taches.includes("Aucune") && taches.split(", ").length >= 3;

  if (beaucoupDemandes || (secteurConversion && !pasDeSite) || automatisationPoussee) {
    return "Conversion";
  }
  if (siteAncien || demandes2a5 || secteurAutorite) {
    return "Autorité";
  }
  return "Visibilité";
}

const DiagnosticSection = () => {
  const { open } = useAuditModal();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [multiSelect, setMultiSelect] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [recommendation, setRecommendation] = useState("");

  const handleAnswer = async (answer: string) => {
    const na = [...answers, answer];
    setAnswers(na);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      const rec = getRecommendation(na);
      setRecommendation(rec);
      setDone(true);
      await supabase.from("diagnostics" as any).insert({
        secteur: na[0],
        a_un_site: na[1],
        demandes_semaine: na[2],
        reseaux_sociaux: na[3],
        taches_repetitives: answer.split(", "),
        offre_recommandee: rec,
      } as any);
    }
  };

  const toggleMulti = (o: string) =>
    setMultiSelect((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));

  const reset = () => {
    setStarted(false);
    setStep(0);
    setAnswers([]);
    setMultiSelect([]);
    setDone(false);
    setRecommendation("");
  };

  const q = questions[step];

  return (
    <section id="diagnostic" className="section-padding">
      <div className="overflow-hidden mask-fade-x mb-12">
        <div className="flex animate-marquee-slow whitespace-nowrap">
          {[...villes, ...villes].map((v, i) => (
            <span key={i} className="mx-4 text-xs text-muted-foreground/40">{v}</span>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <SectionHeader
          label="DIAGNOSTIC GRATUIT"
          title="Découvrez l'offre idéale pour"
          highlight="votre activité"
        />

        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:brightness-110 px-10 py-6 text-base rounded-xl"
                onClick={() => setStarted(true)}
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
              className="card-surface p-8 relative"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-border rounded-t-xl overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mb-4">Question {step + 1} / {questions.length}</p>
              <h3 className="text-xl font-semibold mb-6">{q.q}</h3>

              {q.type === "multi" ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {q.options.map((o) => (
                      <button
                        key={o}
                        onClick={() => toggleMulti(o)}
                        className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                          multiSelect.includes(o)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleAnswer(multiSelect.length > 0 ? multiSelect.join(", ") : "Aucune")}
                    className="w-full"
                  >
                    Valider <ArrowRight className="ml-2 size-4" />
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {q.options.map((o) => (
                    <motion.button
                      key={o}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(o)}
                      className="text-left px-4 py-3 rounded-xl border border-border text-sm hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      {o}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-surface p-8 text-center glow-primary"
            >
              <CheckCircle className="size-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">
                Notre recommandation : <span className="text-gradient">{recommendation}</span>
              </h3>
              <p className="text-muted-foreground mb-2">
                L'offre <strong>{recommendation}</strong> est la plus adaptée pour votre profil.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {recommendation === "Conversion" &&
                  "Votre activité est prête à passer à la vitesse supérieure avec un site qui génère des ventes."}
                {recommendation === "Autorité" &&
                  "Vous avez besoin d'un site professionnel qui inspire confiance et capte de nouveaux clients."}
                {recommendation === "Visibilité" &&
                  "La priorité est de vous rendre visible en ligne et d'attirer vos premiers clients digitaux."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground rounded-xl"
                  onClick={() => { reset(); open(recommendation); }}
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
