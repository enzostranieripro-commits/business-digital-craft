import { motion } from "framer-motion";

interface SectionHeaderProps {
  label: string;
  title: string;
  highlight: string;
  description?: string;
}

const SectionHeader = ({ label, title, highlight, description }: SectionHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="text-center mb-16"
  >
    <span className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.2em] bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5">
      {label}
    </span>
    <h2 className="text-3xl md:text-5xl font-display font-black mt-6 mb-6 tracking-tight" style={{ textWrap: "balance" as any }}>
      {title} <span className="text-gradient">{highlight}</span>
    </h2>
    {description && (
      <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">{description}</p>
    )}
  </motion.div>
);

export default SectionHeader;
