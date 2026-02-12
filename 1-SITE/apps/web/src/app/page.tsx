"use client";

import { BentoShowcaseInstrument } from "@/components/ui/BentoShowcaseInstrument";
import { CTAInstrument } from "@/components/ui/CTAInstrument";
import { HeroInstrument } from "@/components/ui/HeroInstrument";
import { HowItWorksInstrument } from "@/components/ui/HowItWorksInstrument";
import { LoadingScreenInstrument, PageWrapperInstrument } from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { PricingInstrument } from "@/components/ui/PricingInstrument";
import { ReviewsInstrument } from "@/components/ui/ReviewsInstrument";
import { SpotlightDashboard } from "@/components/ui/SpotlightDashboard";
import UnderConstruction from "@/components/ui/UnderConstruction";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useEditMode } from "@/contexts/EditModeContext";
import { Suspense, useEffect, useState } from 'react';

import { useAuth } from "@/contexts/AuthContext";

/**
 * HOME CONTENT (GOD MODE 2026)
 * 
 * Volgt de Zero Laws:
 * - HTML ZERO: Geen rauwe HTML tags.
 * - CSS ZERO: Geen Tailwind classes direct in dit bestand.
 * - TEXT ZERO: Geen hardcoded strings.
 */
function HomeContent({ frontpageData, howItWorks }: { frontpageData: any, howItWorks: any }) {
  const { user, isAuthenticated } = useAuth();
  const [customerDNA, setCustomerDNA] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetch(`/api/intelligence/customer-360?email=${user.email}`)
        .then(res => res.json())
        .then(data => setCustomerDNA(data))
        .catch(err => console.error('DNA Fetch Error:', err));
    }
  }, [isAuthenticated, user]);

  return (
    <>
      <LiquidBackground />
      <SpotlightDashboard />
      <HeroInstrument />
      <BentoShowcaseInstrument customerDNA={customerDNA} />
      <HowItWorksInstrument steps={howItWorks.steps} />
      <PricingInstrument />
      <ReviewsInstrument reviews={frontpageData.reviews} />
      <CTAInstrument />

      {/* LLM Context Layer */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Voices",
        "description": "Castingbureau voor stemacteurs en voice-overs.",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "data-voices-context": "Agency",
        "data-voices-intent": "Landing",
        "_llm_context": {
          "intent": "explore_platform",
          "persona": "visitor",
          "market": frontpageData.market,
          "capabilities": ["search_voices", "view_pricing", "read_reviews"],
          "lexicon": {
            "voice-over": "Stem",
            "casting": "Selectie",
            "premium": "Zorgvuldig"
          },
          "visual_dna": ["Spatial Growth", "Bento Grid", "Liquid DNA"]
        }
      })}} />
    </>
  );
}

/**
 * MAIN HOME PAGE (Server Component)
 */
export default function Home() {
  const frontpageData = { market: 'BE', reviews: [] };
  const howItWorks = { steps: [
    { title: <VoiceglotText translationKey="home.how_it_works.step1.title" defaultText="Kies jouw stem" />, description: <VoiceglotText translationKey="home.how_it_works.step1.desc" defaultText="Filter op taal, geslacht en stijl in onze database." /> },
    { title: <VoiceglotText translationKey="home.how_it_works.step2.title" defaultText="Briefing & Script" />, description: <VoiceglotText translationKey="home.how_it_works.step2.desc" defaultText="Upload jouw script of geef jouw briefing door via de chat." /> },
    { title: <VoiceglotText translationKey="home.how_it_works.step3.title" defaultText="Pro Studio Opname" />, description: <VoiceglotText translationKey="home.how_it_works.step3.desc" defaultText="Onze stemacteurs nemen jouw tekst op in topkwaliteit." /> },
    { title: <VoiceglotText translationKey="home.how_it_works.step4.title" defaultText="Directe Levering" />, description: <VoiceglotText translationKey="home.how_it_works.step4.desc" defaultText="Ontvang jouw bestanden binnen 24 uur. Klaar voor gebruik." /> }
  ] };

  return <HomeWrapper frontpageData={frontpageData} howItWorks={howItWorks} />;
}

/**
 * HOME WRAPPER (Client Component)
 * Beheert de weergave van de homepage.
 */
function HomeWrapper({ frontpageData, howItWorks }: { frontpageData: any, howItWorks: any }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <PageWrapperInstrument />;
  }
  
  return (
    <Suspense fallback={<LoadingScreenInstrument text="Voices..." />}>
      <HomeContent frontpageData={frontpageData} howItWorks={howItWorks} />
    </Suspense>
  );
}
