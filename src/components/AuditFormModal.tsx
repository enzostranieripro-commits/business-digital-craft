import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Calendar, CheckCircle, Clock } from "lucide-react";
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
    secteur: "", besoin: "", description: "",
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
    setStep("done");
  };

  const handleClose = () => {
    setStep("form");
    setForm({ nom: "", prenom: "", email: "", telephone: "", secteur: "", besoin: "", description: "" });
    setSelectedDate("");
    setSelectedTime("");
    onClose();
  };

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {step === "form" && "Réserver mon audit gratuit"}
              {step === "calendar" && "Choisir un créneau"}
              {step === "done" && "Rendez-vous confirmé !"}
            </h2>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
              <X className="size-5" />
            </button>
          </div>

          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground" />
                <input required placeholder="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className="bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground" />
              </div>
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground" />
              <input required placeholder="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground" />
              <select required value={form.secteur} onChange={(e) => setForm({ ...form, secteur: e.target.value })} className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground">
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
              <select required value={form.besoin} onChange={(e) => setForm({ ...form, besoin: e.target.value })} className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground">
                <option value="">Type de besoin</option>
                <option>Site internet</option>
                <option>Contenu marketing</option>
                <option>Automatisation</option>
              </select>
              <textarea placeholder="Description rapide du besoin" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none" />
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:brightness-110 py-5 rounded-xl">
                Continuer <ArrowRight className="ml-2 size-4" />
              </Button>
            </form>
          )}

          {step === "calendar" && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <Calendar className="size-4" /> Choisissez une date
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {dates.slice(0, 8).map((d) => {
                    const key = d.toISOString().split("T")[0];
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedDate(key)}
                        className={`p-2 rounded-lg border text-xs text-center transition-all ${selectedDate === key ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}
                      >
                        <div className="font-medium">{d.toLocaleDateString("fr-FR", { weekday: "short" })}</div>
                        <div className="text-muted-foreground">{d.getDate()}/{d.getMonth() + 1}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="size-4" /> Choisissez un créneau
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`p-2 rounded-lg border text-sm transition-all ${selectedTime === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedDate && selectedTime && (
                <Button onClick={handleBook} className="w-full bg-primary text-primary-foreground hover:brightness-110 py-5 rounded-xl">
                  Confirmer le rendez-vous <ArrowRight className="ml-2 size-4" />
                </Button>
              )}
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-6">
              <CheckCircle className="size-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Rendez-vous confirmé !</h3>
              <p className="text-muted-foreground mb-2">
                Le {new Date(selectedDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {selectedTime}
              </p>
              <p className="text-sm text-muted-foreground mb-6">Vous recevrez un email de confirmation.</p>
              <Button onClick={handleClose} variant="outline" className="rounded-xl">
                Fermer
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuditFormModal;
