import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Calendar, CheckCircle, Clock, User, Mail, Phone, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuditFormModalProps {
  open: boolean;
  onClose: () => void;
}

const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

const AuditFormModal = ({ open, onClose }: AuditFormModalProps) => {
  const [step, setStep] = useState<"form" | "calendar" | "done">("form");
  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", telephone: "",
    secteur: "", besoin: "",
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("calendar");
  };

  const handleBook = () => {
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    bookings.push({ ...form, date: selectedDate, time: selectedTime, createdAt: new Date().toISOString() });
    localStorage.setItem("bookings", JSON.stringify(bookings));

    // Also save to audit_requests for admin
    const requests = JSON.parse(localStorage.getItem("audit_requests") || "[]");
    requests.push({ ...form, createdAt: new Date().toISOString() });
    localStorage.setItem("audit_requests", JSON.stringify(requests));

    setStep("done");
  };

  const handleClose = () => {
    setStep("form");
    setForm({ nom: "", prenom: "", email: "", telephone: "", secteur: "", besoin: "" });
    setSelectedDate("");
    setSelectedTime("");
    onClose();
  };

  // Generate next 14 weekdays
  const dates = Array.from({ length: 21 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    if (d.getDay() === 0 || d.getDay() === 6) return null;
    return d;
  }).filter(Boolean) as Date[];

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
          className="card-surface p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-6">
            {["Informations", "Créneau", "Confirmé"].map((label, i) => {
              const stepIndex = step === "form" ? 0 : step === "calendar" ? 1 : 2;
              return (
                <div key={label} className="flex-1">
                  <div className={`h-1 rounded-full transition-all duration-500 ${i <= stepIndex ? "bg-primary" : "bg-border"}`} />
                  <p className={`text-[10px] mt-1 ${i <= stepIndex ? "text-primary" : "text-muted-foreground"}`}>{label}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {step === "form" && "Réserver mon audit gratuit"}
              {step === "calendar" && "Choisir un créneau"}
              {step === "done" && "Rendez-vous confirmé !"}
            </h2>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="size-5" />
            </button>
          </div>

          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input required placeholder="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input required placeholder="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input required placeholder="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <select required value={form.secteur} onChange={(e) => setForm({ ...form, secteur: e.target.value })} className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
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
              <select required value={form.besoin} onChange={(e) => setForm({ ...form, besoin: e.target.value })} className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                <option value="">Type de besoin</option>
                <option>Site internet</option>
                <option>Contenu marketing</option>
                <option>Automatisation</option>
              </select>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:brightness-110 py-5 rounded-xl text-base">
                Continuer <ArrowRight className="ml-2 size-4" />
              </Button>
            </form>
          )}

          {step === "calendar" && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <Calendar className="size-4 text-primary" /> Choisissez une date
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {dates.slice(0, 8).map((d) => {
                    const key = d.toISOString().split("T")[0];
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedDate(key)}
                        className={`p-3 rounded-xl border text-xs text-center transition-all duration-200 ${selectedDate === key ? "border-primary bg-primary/10 text-primary ring-1 ring-primary" : "border-border hover:border-primary/50 hover:bg-secondary"}`}
                      >
                        <div className="font-semibold">{d.toLocaleDateString("fr-FR", { weekday: "short" })}</div>
                        <div className="text-muted-foreground mt-0.5">{d.getDate()}/{d.getMonth() + 1}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="size-4 text-primary" /> Choisissez un créneau
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all duration-200 ${selectedTime === t ? "border-primary bg-primary/10 text-primary ring-1 ring-primary" : "border-border hover:border-primary/50 hover:bg-secondary"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {selectedDate && selectedTime && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Button onClick={handleBook} className="w-full bg-primary text-primary-foreground hover:brightness-110 py-5 rounded-xl text-base">
                    Confirmer le rendez-vous <ArrowRight className="ml-2 size-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          )}

          {step === "done" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="size-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Rendez-vous confirmé !</h3>
              <p className="text-muted-foreground mb-2">
                Le {new Date(selectedDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {selectedTime}
              </p>
              <p className="text-sm text-muted-foreground mb-6">Vous recevrez un email de confirmation.</p>
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
