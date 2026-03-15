import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MetiersTicker from "@/components/MetiersTicker";
import ProblemSection from "@/components/ProblemSection";
import SolutionsSection from "@/components/SolutionsSection";
import ServicesSection from "@/components/ServicesSection";
import DiagnosticSection from "@/components/DiagnosticSection";
import PricingSection from "@/components/PricingSection";
import MethodSection from "@/components/MethodSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import FinalCTA from "@/components/FinalCTA";
import SiteFooter from "@/components/SiteFooter";
import AuditFormModal from "@/components/AuditFormModal";
import ChatbotBubble from "@/components/ChatbotBubble";

const Index = () => {
  const [auditOpen, setAuditOpen] = useState(false);
  const openAudit = () => setAuditOpen(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onOpenAuditForm={openAudit} />
      <Hero onOpenAuditForm={openAudit} />
      <MetiersTicker />
      <ProblemSection />
      <SolutionsSection />
      <ServicesSection onOpenAuditForm={openAudit} />
      <DiagnosticSection onOpenAuditForm={openAudit} />
      <PricingSection onOpenAuditForm={openAudit} />
      <MethodSection />
      <TestimonialsSection />
      <div id="faq">
        <FAQSection />
      </div>
      <FinalCTA onOpenAuditForm={openAudit} />
      <MetiersTicker />
      <SiteFooter onOpenAuditForm={openAudit} />
      <AuditFormModal open={auditOpen} onClose={() => setAuditOpen(false)} />
      <ChatbotBubble />
    </div>
  );
};

export default Index;
