import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

const ChatbotBubble = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>([
    { role: "bot", text: "Bonjour ! 👋 Comment puis-je vous aider ? Posez-moi une question sur nos services." },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");

    // Simple auto-reply
    setTimeout(() => {
      let reply = "Merci pour votre message ! Un membre de notre équipe vous répondra très bientôt. En attendant, vous pouvez réserver un audit gratuit directement sur notre site.";
      const lower = userMsg.toLowerCase();
      if (lower.includes("prix") || lower.includes("tarif") || lower.includes("coût")) {
        reply = "Nos tarifs sont disponibles dans la section Tarifs du site. L'audit gratuit vous permet d'obtenir un devis personnalisé selon vos besoins !";
      } else if (lower.includes("audit") || lower.includes("rendez-vous") || lower.includes("rdv")) {
        reply = "Vous pouvez réserver un audit gratuit directement via le bouton 'Réserver mon audit gratuit' présent sur le site. C'est gratuit et sans engagement !";
      } else if (lower.includes("site") || lower.includes("web")) {
        reply = "Nous créons des sites internet optimisés pour la conversion. De la vitrine simple au site e-commerce, nous vous accompagnons. Réservez un audit gratuit pour en discuter !";
      }
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    }, 800);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:brightness-110 flex items-center justify-center transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-50 w-80 max-h-[450px] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3">
              <p className="font-semibold text-sm">Studio Nova</p>
              <p className="text-xs opacity-80">Réponse instantanée</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[300px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Votre message..."
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
              />
              <button onClick={handleSend} className="bg-primary text-primary-foreground rounded-lg p-2 hover:brightness-110 transition-all">
                <Send className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotBubble;
