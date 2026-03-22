import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck } from "lucide-react";

const notifications = [
  { name: "Marc D.",      city: "Rodez",       action: "vient de réserver son audit gratuit" },
  { name: "Claire L.",    city: "Albi",         action: "a demandé un devis" },
  { name: "Sophie M.",    city: "Millau",       action: "vient de lancer son projet" },
  { name: "Pierre V.",    city: "Cahors",       action: "vient de réserver son audit gratuit" },
  { name: "Léa B.",       city: "Figeac",       action: "a demandé un devis" },
  { name: "Thomas R.",    city: "Montauban",    action: "vient de lancer son projet" },
  { name: "Julie F.",     city: "Toulouse",     action: "vient de réserver son audit gratuit" },
  { name: "Antoine G.",   city: "Villefranche", action: "a demandé un devis" },
  { name: "Nathalie P.",  city: "Tarbes",       action: "vient de lancer son projet" },
  { name: "Sébastien K.", city: "Auch",         action: "vient de réserver son audit gratuit" },
  { name: "Emma C.",      city: "Narbonne",     action: "a demandé un devis" },
  { name: "Lucas H.",     city: "Castres",      action: "vient de lancer son projet" },
];

const SocialProofToast = () => {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const indexRef = useRef(0);

  useEffect(() => {
    const showNext = () => {
      setCurrent(indexRef.current);
      setVisible(true);
      indexRef.current = (indexRef.current + 1) % notifications.length;
      setTimeout(() => setVisible(false), 4000);
    };

    const initial = setTimeout(showNext, 15000);
    const interval = setInterval(showNext, 35000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);

  const notif = notifications[current];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-24 left-4 z-40 glass rounded-xl p-4 pr-6 flex items-center gap-3 max-w-xs shadow-lg border border-border/30"
        >
          <div className="w-10 h-10 rounded-full bg-visibility/20 flex items-center justify-center flex-shrink-0">
            <UserCheck className="size-5 text-visibility" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {notif.name}{" "}
              <span className="text-muted-foreground font-normal">— {notif.city}</span>
            </p>
            <p className="text-xs text-muted-foreground">{notif.action}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Il y a quelques instants</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SocialProofToast;
