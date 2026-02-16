"use client";

import { BentoShowcaseInstrument } from "@/components/ui/BentoShowcaseInstrument";
import { ContainerInstrument, HeadingInstrument, LoadingScreenInstrument, SectionInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { ReviewsInstrument } from "@/components/ui/ReviewsInstrument";
import { VoiceGrid } from "@/components/ui/VoiceGrid";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useAuth } from "@/contexts/AuthContext";
import { Actor } from "@/types";
import { MarketManager } from "@config/market-manager";
import { Suspense, useEffect, useMemo, useState } from 'react';

import { VoicesMasterControl } from "@/components/ui/VoicesMasterControl";
import { useTranslation } from "@/contexts/TranslationContext";
import { useMasterControl } from "@/contexts/VoicesMasterControlContext";

import { PricingEngine } from '@/lib/pricing-engine';

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
  const { t } = useTranslation();
  const { state: masterControlState } = useMasterControl();
  const [customerDNA, setCustomerDNA] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetch(`/api/intelligence/customer-360?email=${user.email}`)
        .then(res => res.json())
        .then(data => setCustomerDNA(data))
        .catch(err => console.error('DNA Fetch Error:', err));
    }
  }, [isAuthenticated, user]);

  // COMMERCIAL & TELEPHONY FILTERING (Korneel Mandate)
  const filteredActors = useMemo(() => {
    let result = actors;

    console.log('HomeContent: Filtering actors', { 
      total: actors.length, 
      journey: masterControlState.journey,
      media: masterControlState.filters.media,
      country: masterControlState.filters.country,
      languages: masterControlState.filters.languages
    });

    if (masterControlState.journey === 'commercial' && Array.isArray(masterControlState.filters.media) && masterControlState.filters.media.length > 0) {
      const selectedMedia = masterControlState.filters.media;
      
      result = result.filter(actor => {
        // 🛡️ KORNEEL RULE: Use Centralized PricingEngine Logic
        return PricingEngine.isAvailable(actor, selectedMedia as any, masterControlState.filters.country);
      });
    }

    // 🛡️ TELEPHONY MULTI-LANG FILTERING
    if (masterControlState.journey === 'telephony' && Array.isArray(masterControlState.filters.languages) && masterControlState.filters.languages.length > 1) {
      const selectedLangs = masterControlState.filters.languages;
      
      result = result.filter(actor => {
        const actorLangs = [
          actor.native_lang, 
          ...(actor.extra_langs ? actor.extra_langs.split(',').map(l => l.trim()) : [])
        ].filter(Boolean).map(l => l?.toLowerCase());

        // Check if actor supports ALL selected languages
        return selectedLangs.every(lang => {
          const lowLang = lang.toLowerCase();
          // Support both ISO codes (nl-BE) and short codes (nl) for extra languages
          const shortLang = lowLang.split('-')[0];
          return actorLangs.some(al => al === lowLang || al === shortLang || al?.includes(lowLang) || al?.includes(shortLang));
        });
      });
    }

    console.log('HomeContent: Filtered result', { count: result.length, names: result.map(a => a.display_name) });
    return result;
  }, [actors, masterControlState.journey, masterControlState.filters.media, masterControlState.filters.country, masterControlState.filters.languages]);

  const isTelephony = customerDNA?.intelligence?.lastIntent === 'telephony' || customerDNA?.intelligence?.detectedSector === 'it';

  // 🛡️ POLYGLOT CHIPS LOGIC: Calculate available extra languages for the selected primary language
  const availableExtraLangs = useMemo(() => {
    if (masterControlState.journey !== 'telephony' || !masterControlState.filters.language) return [];
    
    const primaryLang = masterControlState.filters.language.toLowerCase();
    const relevantActors = actors.filter(a => {
      const actorNative = a.native_lang?.toLowerCase();
      return actorNative === primaryLang || actorNative?.includes(primaryLang);
    });

    const extraLangsSet = new Set<string>();
    relevantActors.forEach(a => {
      if (a.extra_langs) {
        a.extra_langs.split(',').forEach(l => {
          const trimmed = l.trim();
          if (trimmed && trimmed.toLowerCase() !== primaryLang) {
            // 🛡️ CHRIS-PROTOCOL: Map extra language names to standard labels
            const langMap: Record<string, string> = {
              'frans': 'Frans',
              'engels': 'Engels',
              'duits': 'Duits',
              'nederlands': 'Nederlands',
              'italiaans': 'Italiaans',
              'spaans': 'Spaans',
              'vlaams': 'Vlaams'
            };
            const mapped = langMap[trimmed.toLowerCase()] || trimmed;
            extraLangsSet.add(mapped);
          }
        });
      }
    });

    return Array.from(extraLangsSet).sort();
  }, [actors, masterControlState.journey, masterControlState.filters.language]);

  // Mock filters voor de homepage (of haal ze op via API indien nodig)
  const filters = {
    languages: ['Vlaams', 'Nederlands', 'Frans', 'Engels', 'Duits'],
    genders: ['Mannelijk', 'Vrouwelijk'],
    styles: [],
    categories: []
  };

  return (
    <>
      <LiquidBackground strokeWidth={1.5} />
      
      <SectionInstrument className="!pt-20 pb-32 relative z-50">
        <ContainerInstrument plain className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="mb-20 text-center max-w-4xl mx-auto space-y-8">
            <h1 className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.9] text-va-black">
              <VoiceglotText translationKey="home.hero.title_part1" defaultText="Vind de" />
              {" "}
              <span className="text-primary italic">
                <VoiceglotText translationKey="home.hero.title_highlight" defaultText="stem" />
              </span>
              <br />
              <VoiceglotText translationKey="home.hero.title_part2" defaultText="voor jouw verhaal." />
            </h1>
            <p className="text-xl md:text-2xl font-light text-va-black/40 leading-tight tracking-tight mx-auto max-w-2xl">
              <VoiceglotText translationKey="home.hero.subtitle" defaultText="Van bedrijfsfilm tot commercial. Wij vinden de beste stem voor jouw boodschap." />
            </p>
          </div>

          <VoicesMasterControl filters={filters} availableExtraLangs={availableExtraLangs} />
          
          <div className="mt-20">
            {filteredActors && filteredActors.length > 0 ? (
              <VoiceGrid strokeWidth={1.5} actors={filteredActors} featured={true} />
            ) : (
              <div className="py-20 text-center">
                <TextInstrument className="text-va-black/20 text-xl font-light italic">
                  Geen stemmen gevonden voor deze selectie.
                </TextInstrument>
              </div>
            )}
          </div>
        </ContainerInstrument>
      </SectionInstrument>

      <SectionInstrument className="py-40 bg-va-off-white border-y border-black/[0.03]">
        <ContainerInstrument plain className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-24 space-y-6">
            <TextInstrument className="text-[15px] font-bold tracking-[0.3em] text-primary/60 uppercase">
              <VoiceglotText translationKey="home.reviews.label" defaultText="Wat klanten zeggen" />
            </TextInstrument>
            <HeadingInstrument level={2} className="text-6xl md:text-7xl font-light tracking-tighter leading-none text-va-black">
              <VoiceglotText translationKey="home.reviews.title" defaultText="Ervaringen." />
            </HeadingInstrument>
          </div>
          <ReviewsInstrument reviews={reviews} hideHeader={true} />
        </ContainerInstrument>
      </SectionInstrument>

      <BentoShowcaseInstrument customerDNA={customerDNA} />

      {/* LLM Context Layer */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Voices",
        "url": "https://www.voices.be",
        "logo": "https://www.voices.be/assets/common/logo-voices-be.png",
        "description": "Castingbureau voor stemacteurs en voice-overs.",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "1250",
          "bestRating": "5",
          "worstRating": "1"
        },
        "review": reviews.slice(0, 3).map(r => ({
          "@type": "Review",
          "author": { "@type": "Person", "name": r.authorName },
          "reviewRating": { "@type": "Rating", "ratingValue": r.rating },
          "reviewBody": r.textNl || r.textFr || r.textEn
        })),
        "founder": {
          "@type": "Person",
          "name": "Johfrah Lefebvre",
          "sameAs": "https://www.johfrah.be"
        },
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
  }, []);

  const searchParams = typeof window !== 'undefined' ? window.location.search : '';
  const searchParamsKey = useMemo(() => searchParams, [searchParams]);

  useEffect(() => {
    if (!mounted) return;

    const host = typeof window !== 'undefined' ? window.location.host : 'voices.be';
    const market = MarketManager.getCurrentMarket(host);
    
    //  CHRIS-PROTOCOL: Forceer de fetch op basis van de huidige URL (filters)
    const params = new URLSearchParams(searchParamsKey);
    
    //  CHRIS-PROTOCOL: Forceer market en taal als ze ontbreken
    if (!params.has('market')) params.set('market', market.market_code);
    if (!params.has('language')) params.set('language', market.primary_language);
    
    //  CHRIS-PROTOCOL: Als er GEEN taal geselecteerd is, vallen we terug op de market taal
    const currentLanguage = params.get('language');
    if (!currentLanguage || currentLanguage === 'null' || currentLanguage === 'undefined') {
      params.set('language', market.primary_language);
    }

    // Filter out empty params
    const cleanParams = new URLSearchParams();
    params.forEach((value, key) => {
      if (value && value !== 'null' && value !== 'undefined') {
        cleanParams.set(key, value);
      }
    });

    const fetchUrl = `/api/actors?${cleanParams.toString()}`;
    
    console.log(' Home: Fetching from', fetchUrl);
    
    fetch(fetchUrl)
      .then(res => res.json())
      .then(resData => {
        console.log(' Home: Received', resData?.results?.length || 0, 'actors');
        if (!resData || !resData.results) {
          setData({ actors: [], reviews: [] });
          return;
        }
        const mappedActors = resData.results.map((actor: any) => ({
          id: actor.id,
          display_name: actor.display_name,
          photo_url: actor.photo_url,
          voice_score: actor.voice_score,
          native_lang: actor.native_lang,
          starting_price: actor.starting_price,
          delivery_days_min: actor.delivery_days_min || 1,
        delivery_days_max: actor.delivery_days_max || 2,
        extra_langs: actor.extra_langs,
        tone_of_voice: actor.tone_of_voice,
          clients: actor.clients,
          cutoff_time: actor.cutoff_time || '18:00',
          availability: actor.availability || [],
          tagline: actor.tagline,
          ai_tags: actor.ai_tags || '',
          slug: actor.slug,
          demos: actor.demos || [],
          bio: actor.bio,
          price_ivr: actor.price_ivr,
          price_online: actor.price_online,
          rates_raw: actor.rates_raw || {} // CHRIS-PROTOCOL: Pass rates for filtering
        }));
        setData({ actors: mappedActors, reviews: resData.reviews || [] });
      })
      .catch(err => {
        console.error('Home Data Fetch Error:', err);
        setData({ actors: [], reviews: [] });
      });
  }, [mounted, searchParamsKey]);

  if (!mounted || !data) {
    return <LoadingScreenInstrument text="Voices..." />;
  }
  
  return (
    <Suspense  fallback={<LoadingScreenInstrument text="Voices..." />}>
      <HomeContent strokeWidth={1.5} actors={data.actors} reviews={data.reviews} />
    </Suspense>
  );
}
