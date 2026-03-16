import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Zap } from "lucide-react";

type Message = { role: "bot" | "user"; text: string };

const knowledgeBase: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["prix", "tarif", "coût", "combien", "budget"],
    reply: "Nos tarifs démarrent à 1 290 € pour un site vitrine, 290 € pour un pack contenu marketing et 990 € pour un système automatisé. Des formules mensuelles sont disponibles. Consultez la section Tarifs ou réservez un audit gratuit pour un devis personnalisé !",
  },
  {
    keywords: ["audit", "gratuit", "rdv", "rendez-vous", "appel", "rappel"],
    reply: "L'audit est 100 % gratuit et sans engagement. Cliquez sur 'Réserver mon audit gratuit' — on vous rappelle sous 24h pour faire le point sur votre situation et vous proposer un plan d'action concret.",
  },
  {
    keywords: ["site", "web", "internet", "vitrine", "création", "refonte"],
    reply: "On crée des sites web modernes, rapides et optimisés pour convertir vos visiteurs en clients. Livraison en 7 jours ouvrés. Chaque site est responsive, optimisé SEO local et pensé pour votre secteur d'activité.",
  },
  {
    keywords: ["délai", "temps", "jours", "livraison", "rapide"],
    reply: "Votre site est livré en moyenne en 7 jours ouvrés. Chaque étape est validée avec vous avant de passer à la suivante. Pour les autres services, on vous donne un planning précis dès l'audit.",
  },
  {
    keywords: ["seo", "référencement", "google", "visibilité", "recherche"],
    reply: "Tous nos sites incluent une optimisation SEO locale : balises, structure, vitesse, fiche Google Business. L'objectif : que vos clients vous trouvent en premier sur Google quand ils cherchent votre métier en Aveyron ou Occitanie.",
  },
  {
    keywords: ["photo", "vidéo", "contenu", "marketing", "réseaux", "publication", "instagram", "facebook"],
    reply: "Notre équipe produit des photos et vidéos professionnelles adaptées à votre activité, avec un calendrier éditorial et une stratégie de contenu cohérente. Résultat : une image soignée sur vos réseaux sociaux.",
  },
  {
    keywords: ["automatisation", "automatique", "robot", "workflow", "tâche", "process"],
    reply: "On met en place des systèmes qui travaillent pour vous : relances automatiques, confirmations de RDV, suivi client, alertes... Tout est configuré selon votre métier. Vous gagnez du temps sans changer vos habitudes.",
  },
  {
    keywords: ["paiement", "mensuel", "abonnement", "facilité", "mensualité", "financement"],
    reply: "Oui, tous nos services sont disponibles en paiement mensuel. Le site Essentiel démarre à 89 €/mois, par exemple. On s'adapte à votre budget — discutons-en lors de l'audit gratuit.",
  },
  {
    keywords: ["artisan", "plombier", "électricien", "maçon", "menuisier", "btp"],
    reply: "On travaille régulièrement avec des artisans du BTP en Aveyron. On sait ce dont vous avez besoin : un site qui génère des demandes de devis, un agenda optimisé et des relances automatiques. Réservez un audit gratuit !",
  },
  {
    keywords: ["commerce", "boutique", "magasin", "fleuriste"],
    reply: "Pour les commerces locaux, on crée des vitrines en ligne qui attirent de nouveaux clients et fidélisent les existants. Alertes stock, emails fidélité, réseaux sociaux — tout est automatisable.",
  },
  {
    keywords: ["immobilier", "agence", "mandataire", "appartement", "maison"],
    reply: "On accompagne les agences immobilières avec des sites de présentation performants, du matching acheteur/bien automatisé et des rapports vendeurs hebdomadaires. Un vrai gain de temps pour vos équipes.",
  },
  {
    keywords: ["restaurant", "restauration", "traiteur", "food"],
    reply: "Pour les restaurants, on gère les réservations en ligne, les confirmations automatiques et la collecte d'avis Google. Résultat : moins d'absences et plus de bouche-à-oreille numérique.",
  },
  {
    keywords: ["occitanie", "aveyron", "local", "région", "rodez"],
    reply: "On est une agence locale, implantée en Aveyron et Occitanie. On connaît le tissu économique local et on accompagne les entreprises du territoire avec des solutions concrètes et un suivi humain.",
  },
  {
    keywords: ["garantie", "résultat", "efficace", "fonctionne"],
    reply: "Chaque projet démarre par un audit gratuit où on définit ensemble les objectifs. On vous livre un plan d'action transparent et des indicateurs de suivi clairs. Notre objectif : que vous voyiez des résultats concrets.",
  },
  {
    keywords: ["technique", "complexe", "difficile", "débutant", "nul"],
    reply: "Pas besoin de connaissances techniques ! On s'occupe de tout de A à Z, et on vous forme à l'utilisation des outils livrés. Vous restez maître de votre activité, sans rien avoir à gérer techniquement.",
  },
  {
    keywords: ["contact", "email", "joindre", "parler"],
    reply: "Le plus simple : réservez un audit gratuit via le bouton en haut de page. On vous rappelle sous 24h. Vous pouvez aussi nous laisser vos coordonnées via le formulaire et notre équipe vous contacte rapidement.",
  },
];

const defaultReply =
  "Merci pour votre message ! Un membre de notre équipe vous répondra très bientôt. En attendant, vous pouvez réserver un audit gratuit directement sur notre site — c'est gratuit et on vous rappelle sous 24h.";

function getReply(input: string): string {
  const lower = input.toLowerCase();
  for (const entry of knowledgeBase) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.reply;
    }
  }
  return defaultReply;
}

const ChatbotBubble = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Bonjour 👋 Je suis l'assistant Studio Nova. Posez-moi vos questions sur nos services, nos tarifs ou notre fonctionnement !",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: "bot", text: getReply(userMsg) }]);
    }, 900);
  };

  const quickQuestions = [
    "Quels sont vos tarifs ?",
    "Délai de livraison ?",
    "Comment fonctionne l'audit ?",
  ];

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:brightness-110 flex items-center justify-center transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle className="size-6" />
            </motion.span>
          )}
        </AnimatePresence>
        {/* Notification dot */}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-background animate-pulse" />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Zap className="size-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">Studio Nova</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs opacity-80">Disponible maintenant</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[280px]">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-secondary px-4 py-3 rounded-xl rounded-bl-sm flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                        style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick questions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border p-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Votre message..."
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={handleSend}
                className="bg-primary text-primary-foreground rounded-lg p-2 hover:brightness-110 transition-all disabled:opacity-50"
                disabled={!input.trim()}
              >
                <Send className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
};

export default ChatbotBubble;
