"use client";

import { BentoShowcaseInstrument } from "@/components/ui/BentoShowcaseInstrument";
import { HeroInstrument } from "@/components/ui/HeroInstrument";
import { LoadingScreenInstrument, PageWrapperInstrument, SectionInstrument, ContainerInstrument } from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { SpotlightDashboard } from "@/components/ui/SpotlightDashboard";
import { VoiceGrid } from "@/components/ui/VoiceGrid";
import { ReviewsInstrument } from "@/components/ui/ReviewsInstrument";
import { OrderStepsInstrument } from "@/components/ui/OrderStepsInstrument";
import { useAuth } from "@/contexts/AuthContext";
import { Suspense, useEffect, useState } from 'react';
import { Actor } from "@/types";

/**
 * HOME CONTENT (GOD MODE 2026 - AIRBNB STYLE)
 * 
 * Volgt de Zero Laws:
 * - HTML ZERO: Geen rauwe HTML tags.
 * - CSS ZERO: Geen Tailwind classes direct in dit bestand.
 * - TEXT ZERO: Geen hardcoded strings.
 * 
 * AIRBNB MANDATE:
 * - Directe focus op VoiceCards (VoiceGrid).
 * - Geen HowItWorks of Pricing (deze hebben eigen pagina's).
 * - Reviews blijven behouden voor social proof.
 */
function HomeContent({ actors, reviews }: { actors: Actor[], reviews: any[] }) {
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

  const isTelephony = customerDNA?.intelligence?.lastIntent === 'telephony' || customerDNA?.intelligence?.detectedSector === 'it';

  return (
    <>
      <LiquidBackground />
      <SpotlightDashboard />
      <HeroInstrument />
      
      <OrderStepsInstrument currentStep="voice" isTelephony={isTelephony} />
      
      <SectionInstrument>
        <ContainerInstrument>
          <Suspense fallback={<LoadingScreenInstrument />}>
            <VoiceGrid actors={actors} />
          </Suspense>
        </ContainerInstrument>
      </SectionInstrument>

      <ReviewsInstrument reviews={reviews} />

      <BentoShowcaseInstrument customerDNA={customerDNA} />

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
          "capabilities": ["search_voices", "view_pricing", "read_reviews"],
          "visual_dna": ["Spatial Growth", "Bento Grid", "Liquid DNA"]
        }
      })}} />
    </>
  );
}

/**
 * MAIN HOME PAGE (Client Component)
 */
export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<{ actors: Actor[], reviews: any[] } | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch('/api/actors')
      .then(res => res.json())
      .then(resData => {
        const mappedActors = resData.results.map((actor: any) => ({
          id: actor.id,
          display_name: actor.display_name,
          photo_url: actor.photo_url,
          voice_score: actor.voice_score,
          native_lang: actor.native_lang,
          ai_tags: actor.ai_tags || [],
          slug: actor.slug,
          demos: actor.demos || []
        }));
        setData({ actors: mappedActors, reviews: resData.reviews || [] });
      })
      .catch(err => console.error('Home Data Fetch Error:', err));
  }, []);

  if (!mounted || !data) {
    return <PageWrapperInstrument />;
  }
  
  return (
    <Suspense fallback={<LoadingScreenInstrument text="Voices..." />}>
      <HomeContent actors={data.actors} reviews={data.reviews} />
    </Suspense>
  );
}
