import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, CheckCircle, User, Mail, Phone, Briefcase, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuditFormModalProps {
  open: boolean;
  onClose: () => void;
  productType?: string | null;
}

const productIcons: Record<string, string> = {
  "Site internet": "🌐",
  "Contenu marketing": "📸",
  "Automatisation": "⚡",
};

const AuditFormModal = ({ open, onClose, productType }: AuditFormModalProps) => {
  const [step, setStep] = useState<"form" | "done">("form");
  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", telephone: "", secteur: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalForm = { ...form, besoin: productType || "Audit général" };

    // Save to audit_requests
    const requests = JSON.parse(localStorage.getItem("audit_requests") || "[]");
    requests.push({ ...finalForm, createdAt: new Date().toISOString() });
    localStorage.setItem("audit_requests", JSON.stringify(requests));

    // If from a product CTA, also save to product_requests
    if (productType) {
      const productRequests = JSON.parse(localStorage.getItem("product_requests") || "[]");
      productRequests.push({ ...finalForm, product: productType, createdAt: new Date().toISOString() });
      localStorage.setItem("product_requests", JSON.stringify(productRequests));
    }

    setStep("done");
  };

  const handleClose = () => {
    setStep("form");
    setForm({ nom: "", prenom: "", email: "", telephone: "", secteur: "" });
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ ease: [0.16, 1, 0.3, 1] }}
          className="card-surface p-6 md:p-8 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              {productType ? (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{productIcons[productType] || "📋"}</span>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {productType}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="size-4 text-primary" />
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    Audit gratuit
                  </span>
                </div>
              )}
              <h2 className="text-xl font-bold">
                {step === "form" ? "Réserver mon audit gratuit" : "Demande envoyée !"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {step === "form" ? "On vous rappelle sous 24h — gratuit & sans engagement" : ""}
              </p>
            </div>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors ml-4 mt-1">
              <X className="size-5" />
            </button>
          </div>

          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    required
                    placeholder="Nom"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    required
                    placeholder="Prénom"
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  required
                  placeholder="Téléphone"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <select
                  required
                  value={form.secteur}
                  onChange={(e) => setForm({ ...form, secteur: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                >
                  <option value="">Secteur d'activité</option>
                  <option>Artisan / BTP</option>
                  <option>Commerce</option>
                  <option>Immobilier</option>
                  <option>Services</option>
                  <option>Tourisme</option>
                  <option>Agriculture</option>
                  <option>Restaurant</option>
                  <option>Autre</option>
                </select>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:brightness-110 py-5 rounded-xl text-base mt-2"
              >
                Je veux être rappelé gratuitement
                <ArrowRight className="ml-2 size-4" />
              </Button>

              <p className="text-center text-[11px] text-muted-foreground pt-1">
                📞 Rappel sous 24h · Aucun engagement · 100% gratuit
              </p>
            </form>
          )}

          {step === "done" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="size-8 text-primary" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Demande bien reçue !</h3>
              <p className="text-muted-foreground text-sm mb-1">
                Notre équipe vous rappelle <span className="text-primary font-semibold">sous 24h</span> pour votre audit gratuit.
              </p>
              <p className="text-xs text-muted-foreground mb-6">Pensez à vérifier vos SMS et emails.</p>
              <Button onClick={handleClose} variant="outline" className="rounded-xl">
                Fermer
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuditFormModal;
