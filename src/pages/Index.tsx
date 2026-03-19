import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MetiersTicker from "@/components/MetiersTicker";

// Lazy load below-the-fold sections
const ProblemSection = lazy(() => import("@/components/ProblemSection"));
const SolutionsSection = lazy(() => import("@/components/SolutionsSection"));
const PortfolioSection = lazy(() => import("@/components/PortfolioSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const DiagnosticSection = lazy(() => import("@/components/DiagnosticSection"));
const ServicesSection = lazy(() => import("@/components/ServicesSection"));
const ComparateurSection = lazy(() => import("@/components/ComparateurSection"));
const MethodSection = lazy(() => import("@/components/MethodSection"));
const PricingSection = lazy(() => import("@/components/PricingSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const FinalCTA = lazy(() => import("@/components/FinalCTA"));
const SiteFooter = lazy(() => import("@/components/SiteFooter"));
const AuditFormModal = lazy(() => import("@/components/AuditFormModal"));
const ChatbotBubble = lazy(() => import("@/components/ChatbotBubble"));
const SocialProofToast = lazy(() => import("@/components/SocialProofToast"));

const SectionFallback = () => <div className="min-h-[200px]" />;

const Index = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <Hero />
    <MetiersTicker />
    <Suspense fallback={<SectionFallback />}>
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
    </Suspense>
  </div>
);

export default Index;
