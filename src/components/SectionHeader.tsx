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
    <span className="text-primary text-sm font-semibold uppercase tracking-widest">{label}</span>
    <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-6" style={{ textWrap: "balance" as any }}>
      {title} <span className="text-gradient">{highlight}</span>
    </h2>
    {description && (
      <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">{description}</p>
    )}
  </motion.div>
);

export default SectionHeader;
