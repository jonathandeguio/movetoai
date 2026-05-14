import type { Metadata } from "next";

import { Architecture } from "@/components/landing/Architecture";
import { CtaFinal } from "@/components/landing/CtaFinal";
import { ExplainerCanvas } from "@/components/landing/ExplainerCanvas";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Metrics } from "@/components/landing/Metrics";
import { Pricing } from "@/components/landing/Pricing";
import { Profiles } from "@/components/landing/Profiles";
import { Stats } from "@/components/landing/Stats";
import { Ticker } from "@/components/landing/Ticker";
import { CategoryTable } from "@/components/marketing/CategoryTable";
import { WhyFreeList } from "@/components/marketing/WhyFreeList";
import { PersonaCards } from "@/components/marketing/PersonaCards";
import { TestimonialSlider } from "@/components/marketing/TestimonialSlider";
import { FAQAccordion } from "@/components/marketing/FAQAccordion";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export const metadata: Metadata = {
  title: "Move to AI — Votre premier consultant IA, sans le prix du cabinet",
  description:
    "Move to AI identifie vos opportunités d'automatisation en 48h, structure vos use cases et les connecte aux bons experts. Gratuit pour toujours.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Move to AI",
  },
};

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      {/* 1. Hero — nouvelle accroche "consultant IA sans le prix du cabinet" */}
      <Hero />
      {/* 2. Ticker — preuves sociales en mouvement */}
      <Ticker />
      {/* 3. Stats — < 48h · 14 000€ · 50× */}
      <Stats />
      {/* 4. Comparatif vs cabinets et concurrents */}
      <CategoryTable />
      {/* 5. Comment ça marche */}
      <HowItWorks />
      <ExplainerCanvas />
      {/* 6. Pourquoi c'est gratuit */}
      <WhyFreeList />
      {/* 7. Personas — un message par rôle */}
      <PersonaCards />
      {/* 8. Métriques plateforme */}
      <Metrics />
      {/* 9. Tarifs */}
      <Pricing />
      {/* 10. Architecture technique */}
      <Architecture />
      {/* 11. Témoignages */}
      <TestimonialSlider />
      {/* 12. FAQ */}
      <FAQAccordion />
      {/* 13. CTA final */}
      <CtaFinal />
      <SiteFooter />
    </>
  );
}
