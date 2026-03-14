import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SectionHeader from "./SectionHeader";

const faqs = [
  { q: "L'audit est-il vraiment gratuit ?", a: "Oui, 100 % gratuit et sans engagement. On échange 30 minutes pour comprendre votre activité et vous donner un plan d'action concret." },
  { q: "Combien de temps faut-il pour créer un site ?", a: "En moyenne, votre site est livré en 7 jours ouvrés. Chaque étape est validée avec vous avant de passer à la suivante." },
  { q: "Je n'y connais rien en digital, est-ce un problème ?", a: "Pas du tout. On s'occupe de tout et on vous explique chaque étape simplement. Vous n'avez rien de technique à gérer." },
  { q: "Est-ce adapté à mon secteur d'activité ?", a: "Nous travaillons avec des artisans, commerçants, agents immobiliers, restaurateurs et bien d'autres métiers en Aveyron et Occitanie." },
  { q: "Puis-je payer en plusieurs fois ?", a: "Oui, nous proposons le paiement mensuel sur tous nos services pour faciliter votre investissement." },
  { q: "Que se passe-t-il après la mise en ligne ?", a: "Un suivi est inclus pour s'assurer que tout fonctionne. On mesure les résultats ensemble et on ajuste si nécessaire." },
];

const FAQSection = () => (
  <section className="section-padding">
    <div className="max-w-3xl mx-auto">
      <SectionHeader
        label="FAQ"
        title="Questions"
        highlight="fréquentes"
      />
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="card-surface px-6 border-none">
            <AccordionTrigger className="text-sm font-medium hover:no-underline py-4">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pb-4">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQSection;
