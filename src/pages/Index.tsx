import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MetiersTicker from "@/components/MetiersTicker";
import ProblemSection from "@/components/ProblemSection";
import SolutionsSection from "@/components/SolutionsSection";
import PortfolioSection from "@/components/PortfolioSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import DiagnosticSection from "@/components/DiagnosticSection";
import ServicesSection from "@/components/ServicesSection";
import ComparateurSection from "@/components/ComparateurSection";
import MethodSection from "@/components/MethodSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import FinalCTA from "@/components/FinalCTA";
import SiteFooter from "@/components/SiteFooter";
import AuditFormModal from "@/components/AuditFormModal";
import ChatbotBubble from "@/components/ChatbotBubble";
import SocialProofToast from "@/components/SocialProofToast";

const Index = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <Hero />
    <MetiersTicker />
    <ProblemSection />
    <SolutionsSection />
    <PortfolioSection />
    <TestimonialsSection />
    <DiagnosticSection />
    <ServicesSection />
    <ComparateurSection />
    <MethodSection />
    <PricingSection />
    <FAQSection />
    <FinalCTA />
    <MetiersTicker />
    <SiteFooter />
    <AuditFormModal />
    <ChatbotBubble />
    <SocialProofToast />
  </div>
);

export default Index;
