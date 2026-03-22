import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MetiersTicker from "@/components/MetiersTicker";

const ProblemSection       = lazy(() => import("@/components/ProblemSection"));
const SolutionsSection     = lazy(() => import("@/components/SolutionsSection"));
const PortfolioSection     = lazy(() => import("@/components/PortfolioSection"));
const TestimonialsSection  = lazy(() => import("@/components/TestimonialsSection"));
const DiagnosticSection    = lazy(() => import("@/components/DiagnosticSection"));
const ServicesSection      = lazy(() => import("@/components/ServicesSection"));
const ComparateurSection   = lazy(() => import("@/components/ComparateurSection"));
const MethodSection        = lazy(() => import("@/components/MethodSection"));
const PricingSection       = lazy(() => import("@/components/PricingSection"));
const FAQSection           = lazy(() => import("@/components/FAQSection"));
const FinalCTA             = lazy(() => import("@/components/FinalCTA"));
const SiteFooter           = lazy(() => import("@/components/SiteFooter"));
const AuditFormModal       = lazy(() => import("@/components/AuditFormModal"));
const SocialProofToast     = lazy(() => import("@/components/SocialProofToast"));

const SectionFallback = () => <div className="min-h-[200px]" />;

const Index = () => (
  <>
    <Helmet>
      <title>ASC&amp;D — Agence Web Aveyron &amp; Occitanie | Sites pour artisans et commerçants</title>
      <meta
        name="description"
        content="ASC&D crée des sites web performants pour artisans, commerçants et indépendants en Aveyron et Occitanie. Livraison en 7 jours, SEO local, audit gratuit sans engagement."
      />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://ascnd.fr/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://ascnd.fr/" />
      <meta property="og:title" content="ASC&D — Agence Web Aveyron & Occitanie" />
      <meta property="og:description" content="Sites web professionnels pour artisans et commerçants. Livraison en 7 jours, SEO local inclus. Audit gratuit sans engagement." />
      <meta property="og:image" content="https://ascnd.fr/logo.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "ASC&D — Angelot Stranieri Consulting & Development",
          "description": "Agence web pour artisans, commerçants et indépendants en Aveyron et Occitanie.",
          "url": "https://ascnd.fr",
          "email": "contact@ascnd.fr",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Rodez",
            "addressRegion": "Aveyron",
            "addressCountry": "FR"
          },
          "areaServed": ["Aveyron", "Occitanie", "France"]
        }
      `}</script>
      <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "Combien de temps faut-il pour créer mon site ?", "acceptedAnswer": { "@type": "Answer", "text": "En moyenne, votre site est en ligne en 7 jours ouvrés." } },
            { "@type": "Question", "name": "Est-ce que je suis propriétaire de mon site ?", "acceptedAnswer": { "@type": "Answer", "text": "Absolument. Le site vous appartient à 100%." } },
            { "@type": "Question", "name": "L'audit gratuit, c'est vraiment gratuit ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui, 100% gratuit et sans engagement. 20 minutes pour analyser votre situation." } },
            { "@type": "Question", "name": "Intervenez-vous uniquement en Aveyron ?", "acceptedAnswer": { "@type": "Answer", "text": "Non, nous travaillons dans toute l'Occitanie et la France entière. Tout se fait en ligne." } }
          ]
        }
      `}</script>
    </Helmet>

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
        <SocialProofToast />
      </Suspense>
    </div>
  </>
);

export default Index;
