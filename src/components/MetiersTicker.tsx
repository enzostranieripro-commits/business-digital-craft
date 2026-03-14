const metiers = [
  "ARTISANS / BTP",
  "COMMERCES",
  "IMMOBILIER",
  "SERVICES",
  "TOURISME",
  "AGRICULTURE",
  "RESTAURANTS",
  "PME LOCALES",
];

const MetiersTicker = () => {
  const items = [...metiers, ...metiers];

  return (
    <div className="py-6 border-y border-border overflow-hidden mask-fade-x">
      <div className="flex animate-infinite-scroll whitespace-nowrap">
        {items.map((metier, i) => (
          <span key={i} className="flex items-center">
            <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground/40 font-medium px-8">
              {metier}
            </span>
            <span className="text-muted-foreground/20">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default MetiersTicker;
