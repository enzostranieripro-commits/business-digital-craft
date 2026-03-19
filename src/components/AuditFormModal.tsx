import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, CheckCircle, Calendar, Clock, User, Mail, Phone, Briefcase, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuditModal } from "@/contexts/AuditModalContext";
import { supabase } from "@/integrations/supabase/client";

const secteurs = ["Artisan BTP", "Restauration", "Commerce", "Santé", "Immobilier", "Tourisme", "Services", "Autre"];
const besoins = ["Site vitrine", "E-commerce", "Refonte de site", "SEO / Référencement", "Automatisation", "Autre"];
const timeSlots = [
  { time: "09:00", label: "09h00" },
  { time: "10:00", label: "10h00" },
  { time: "11:00", label: "11h00" },
  { time: "14:00", label: "14h00" },
  { time: "15:00", label: "15h00" },
  { time: "16:00", label: "16h00" },
  { time: "17:00", label: "17h00" },
];

function getAvailableDays(weekOffset: number): Date[] {
  const days: Date[] = [];
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1 + weekOffset * 7);
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    if (d > now) days.push(d);
  }
  return days;
}

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

const AuditFormModal = () => {
  const { isOpen, productType, close } = useAuditModal();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", telephone: "", secteur: "", besoin: "" });
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const weekDays = useMemo(() => getAvailableDays(weekOffset), [weekOffset]);

  const weekLabel = useMemo(() => {
    if (weekDays.length === 0) return "";
    const first = weekDays[0];
    const last = weekDays[weekDays.length - 1];
    return `${first.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} — ${last.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;
  }, [weekDays]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.prenom.trim()) e.prenom = "Requis";
    if (!form.nom.trim()) e.nom = "Requis";
    if (!form.email.trim()) e.email = "Requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide";
    if (!form.secteur) e.secteur = "Requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToStep1 = () => {
    if (validate()) setStep(1);
  };

  const handleClose = () => {
    close();
    setStep(0);
    setForm({ prenom: "", nom: "", email: "", telephone: "", secteur: "", besoin: productType || "" });
    setSelectedDay(null);
    setSelectedTime("");
    setWeekOffset(0);
    setErrors({});
  };

  const submitBooking = async () => {
    if (!selectedDay || !selectedTime) return;
    setSubmitting(true);
    const dateStr = selectedDay.toISOString().split("T")[0];
    const base = {
      prenom: form.prenom.trim(),
      nom: form.nom.trim(),
      email: form.email.trim(),
      telephone: form.telephone.trim() || null,
      secteur: form.secteur,
      besoin: form.besoin || null,
    };
    await Promise.all([
      supabase.from("audit_requests" as any).insert({ ...base } as any),
      supabase.from("bookings" as any).insert({ ...base, date: dateStr, time: selectedTime, status: "pending" } as any),
    ]);
    setSubmitting(false);
    setStep(2);
  };

  if (!isOpen) return null;

  const inputClass = (field: string) =>
    `w-full bg-secondary/60 rounded-xl px-4 py-3 pl-11 text-sm outline-none border transition-all duration-200 ${
      errors[field] ? "border-destructive/50 focus:border-destructive" : "border-border/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
    }`;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handleClose}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-lg card-surface z-10 max-h-[90vh] overflow-y-auto overflow-x-hidden">

          {/* Progress bar */}
          <div className="h-1 bg-secondary/50">
            <motion.div className="h-full bg-primary rounded-r-full"
              animate={{ width: step === 0 ? "33%" : step === 1 ? "66%" : "100%" }}
              transition={{ duration: 0.4 }} />
          </div>

          <div className="p-8">
            <button onClick={handleClose} className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-secondary/50">
              <X className="size-5" />
            </button>

            {/* Step indicators */}
            {step < 2 && (
              <div className="flex items-center gap-3 mb-6">
                {[
                  { n: 1, label: "Vos informations" },
                  { n: 2, label: "Choix du créneau" },
                ].map((s, i) => (
                  <div key={s.n} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step >= i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {step > i ? "✓" : s.n}
                    </div>
                    <span className={`text-xs font-medium hidden sm:inline ${step >= i ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                    {i === 0 && <div className="w-8 h-px bg-border/30" />}
                  </div>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* STEP 0: Contact info */}
              {step === 0 && (
                <motion.div key="step0" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="size-5 text-primary" />
                    <h3 className="text-xl font-display font-bold">Audit gratuit & sans engagement</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">Remplissez vos coordonnées pour réserver votre appel découverte</p>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <input placeholder="Prénom *" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })}
                            className={inputClass("prenom")} />
                        </div>
                        {errors.prenom && <p className="text-[10px] text-destructive mt-1 ml-1">{errors.prenom}</p>}
                      </div>
                      <div>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <input placeholder="Nom *" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                            className={inputClass("nom")} />
                        </div>
                        {errors.nom && <p className="text-[10px] text-destructive mt-1 ml-1">{errors.nom}</p>}
                      </div>
                    </div>

                    <div>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input placeholder="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                          className={inputClass("email")} />
                      </div>
                      {errors.email && <p className="text-[10px] text-destructive mt-1 ml-1">{errors.email}</p>}
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input placeholder="Téléphone (optionnel)" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })}
                        className={inputClass("telephone")} />
                    </div>

                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground mb-2 ml-1">Secteur d'activité *</p>
                      <div className="flex flex-wrap gap-2">
                        {secteurs.map(s => (
                          <button key={s} onClick={() => setForm({ ...form, secteur: s })}
                            className={`text-xs px-3 py-2 rounded-xl font-medium transition-all border ${
                              form.secteur === s
                                ? "bg-primary/15 text-primary border-primary/30"
                                : "bg-secondary/50 text-muted-foreground border-border/20 hover:border-border hover:text-foreground"
                            }`}>
                            {s}
                          </button>
                        ))}
                      </div>
                      {errors.secteur && <p className="text-[10px] text-destructive mt-1 ml-1">{errors.secteur}</p>}
                    </div>

                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground mb-2 ml-1">Votre besoin (optionnel)</p>
                      <div className="flex flex-wrap gap-2">
                        {besoins.map(b => (
                          <button key={b} onClick={() => setForm({ ...form, besoin: form.besoin === b ? "" : b })}
                            className={`text-xs px-3 py-2 rounded-xl font-medium transition-all border ${
                              form.besoin === b
                                ? "bg-conversion/15 text-conversion border-conversion/30"
                                : "bg-secondary/50 text-muted-foreground border-border/20 hover:border-border hover:text-foreground"
                            }`}>
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button className="w-full mt-6 rounded-xl h-12 text-sm font-semibold" onClick={goToStep1}>
                    Choisir mon créneau <ArrowRight className="ml-2 size-4" />
                  </Button>
                </motion.div>
              )}

              {/* STEP 1: Calendar */}
              {step === 1 && (
                <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="size-5 text-primary" />
                    <h3 className="text-xl font-display font-bold">Choisissez votre créneau</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">Sélectionnez un jour puis une heure — Appel de 30 min</p>

                  {/* Week navigation */}
                  <div className="flex items-center justify-between mb-4 bg-secondary/30 rounded-xl px-4 py-2.5 border border-border/20">
                    <button onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
                      className={`text-xs font-medium flex items-center gap-1 transition-colors ${weekOffset === 0 ? "text-muted-foreground/30 cursor-not-allowed" : "text-muted-foreground hover:text-foreground"}`}
                      disabled={weekOffset === 0}>
                      <ArrowLeft className="size-3" /> Précédent
                    </button>
                    <span className="text-xs font-semibold">{weekLabel}</span>
                    <button onClick={() => setWeekOffset(w => w + 1)}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                      Suivant <ArrowRight className="size-3" />
                    </button>
                  </div>

                  {/* Day selector */}
                  <div className="grid grid-cols-5 gap-2 mb-5">
                    {weekDays.length === 0 ? (
                      <p className="col-span-5 text-center text-xs text-muted-foreground py-4">Aucun jour disponible cette semaine</p>
                    ) : weekDays.map(d => {
                      const isSelected = selectedDay?.toDateString() === d.toDateString();
                      const isToday = d.toDateString() === new Date().toDateString();
                      return (
                        <button key={d.toISOString()} onClick={() => { setSelectedDay(d); setSelectedTime(""); }}
                          className={`p-3 rounded-xl text-center transition-all border ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                              : "bg-secondary/40 border-border/20 hover:border-primary/30 hover:bg-secondary/70"
                          }`}>
                          <div className={`text-[10px] uppercase font-semibold ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {d.toLocaleDateString("fr-FR", { weekday: "short" })}
                          </div>
                          <div className="text-lg font-bold">{d.getDate()}</div>
                          {isToday && <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-0.5 ${isSelected ? "bg-primary-foreground" : "bg-primary"}`} />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Time slots */}
                  <AnimatePresence>
                    {selectedDay && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}>
                        <p className="text-[11px] font-medium text-muted-foreground mb-2 ml-1 flex items-center gap-1.5">
                          <Clock className="size-3" /> Créneaux disponibles
                        </p>
                        <div className="grid grid-cols-4 gap-2 mb-5">
                          {timeSlots.map(({ time, label }) => (
                            <button key={time} onClick={() => setSelectedTime(time)}
                              className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                                selectedTime === time
                                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                                  : "bg-secondary/40 border-border/20 hover:border-primary/30 hover:bg-secondary/70"
                              }`}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Summary */}
                  {selectedDay && selectedTime && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <Calendar className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {selectedDay.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                        <p className="text-xs text-muted-foreground">à {selectedTime} — Durée : 30 min</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl" onClick={() => setStep(0)}>
                      <ArrowLeft className="size-4 mr-1" /> Retour
                    </Button>
                    <Button className="flex-1 rounded-xl h-12 text-sm font-semibold"
                      disabled={!selectedDay || !selectedTime || submitting} onClick={submitBooking}>
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Envoi en cours...
                        </span>
                      ) : "Confirmer mon rendez-vous ✓"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Success */}
              {step === 2 && (
                <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}
                  className="text-center py-6 relative overflow-hidden">

                  {/* Confetti burst */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 40 }).map((_, i) => {
                      const colors = [
                        "hsl(265, 89%, 60%)", "hsl(158, 60%, 48%)", "hsl(35, 85%, 56%)",
                        "#3b82f6", "#ec4899", "#f59e0b", "#06b6d4",
                      ];
                      const left = Math.random() * 100;
                      const size = 4 + Math.random() * 8;
                      const delay = Math.random() * 0.6;
                      const duration = 1.5 + Math.random() * 1.5;
                      const rotation = Math.random() * 720 - 360;
                      const color = colors[i % colors.length];
                      const shape = i % 3; // 0=square, 1=circle, 2=rectangle

                      return (
                        <motion.div
                          key={i}
                          initial={{ y: -20, x: 0, opacity: 1, rotate: 0, scale: 1 }}
                          animate={{
                            y: [0, 300 + Math.random() * 200],
                            x: [0, (Math.random() - 0.5) * 150],
                            opacity: [1, 1, 0],
                            rotate: rotation,
                            scale: [1, 0.5],
                          }}
                          transition={{ duration, delay, ease: "easeOut" }}
                          style={{
                            position: "absolute",
                            left: `${left}%`,
                            top: 0,
                            width: shape === 2 ? size * 2 : size,
                            height: size,
                            backgroundColor: color,
                            borderRadius: shape === 1 ? "50%" : shape === 0 ? "2px" : "1px",
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Radiating glow */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: [0, 3], opacity: [0.6, 0] }}
                    transition={{ duration: 1, delay: 0.1 }}
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-visibility/30 pointer-events-none"
                  />

                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}>
                    <motion.div
                      animate={{ boxShadow: ["0 0 0 0 hsl(158, 60%, 48%, 0.3)", "0 0 0 20px hsl(158, 60%, 48%, 0)", "0 0 0 0 hsl(158, 60%, 48%, 0)"] }}
                      transition={{ duration: 1.5, delay: 0.3 }}
                      className="w-20 h-20 rounded-full bg-visibility/15 flex items-center justify-center mx-auto mb-5"
                    >
                      <motion.div initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}>
                        <CheckCircle className="size-10 text-visibility" />
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="text-xl font-display font-bold mb-2">
                    Rendez-vous confirmé ! 🎉
                  </motion.h3>
                  {selectedDay && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                      className="text-muted-foreground mb-6">
                      📅 {selectedDay.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {selectedTime}
                    </motion.p>
                  )}
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="bg-secondary/30 rounded-xl p-5 text-left max-w-xs mx-auto mb-6 border border-border/20">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ce qui vous attend :</p>
                    <ul className="space-y-2.5">
                      {[
                        "Analyse complète de votre situation",
                        "Recommandations personnalisées",
                        "Plan d'action concret",
                        "100% gratuit & sans engagement",
                      ].map((t, i) => (
                        <motion.li key={t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                          className="flex items-start gap-2 text-sm">
                          <CheckCircle className="size-4 text-visibility flex-shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                    <Button variant="outline" onClick={handleClose} className="rounded-xl">Fermer</Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuditFormModal;
