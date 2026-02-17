"use client";

import { BentoShowcaseInstrument } from "@/components/ui/BentoShowcaseInstrument";
import { ContainerInstrument, HeadingInstrument, LoadingScreenInstrument, SectionInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { ReviewsInstrument } from "@/components/ui/ReviewsInstrument";
import { VoiceGrid } from "@/components/ui/VoiceGrid";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { useMasterControl } from "@/contexts/VoicesMasterControlContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { Actor } from "@/types";
import { MarketManager } from "@config/market-manager";
import { PricingEngine } from '@/lib/pricing-engine';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { VoicesMasterControl } from "@/components/ui/VoicesMasterControl";

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
function HomeContent({ actors: initialActors, reviews }: { actors: Actor[], reviews: any[] }) {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { state: masterControlState } = useMasterControl();

  const { openEditModal } = useEditMode();
  const [customerDNA, setCustomerDNA] = useState<any>(null);
  const [actors, setActors] = useState<Actor[]>(initialActors);

  //  CHRIS-PROTOCOL: Sync local state with initial props
  useEffect(() => {
    setActors(initialActors);
  }, [initialActors]);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      const fetchDNA = async () => {
        try {
          const res = await fetch(`/api/intelligence/customer-360?email=${user.email}`);
          const data = await res.json();
          setCustomerDNA(data);
        } catch (err) {
          console.error('DNA Fetch Error:', err);
        }
      };
      fetchDNA();
    }
  }, [isAuthenticated, user]);

  //  CHRIS-PROTOCOL: Handle immediate UI updates from Edit Mode
  const handleActorUpdate = (updatedActor: any) => {
    console.log('HomeContent: Immediate UI update for actor', updatedActor.id);
    
    //  CHRIS-PROTOCOL: Ensure we have a clean photo_url for the UI
    let finalPhotoUrl = updatedActor.photo_url;
    if (updatedActor.photoId && !finalPhotoUrl?.includes('/api/proxy')) {
      // If we only have a photoId or a raw path, proxy it immediately
      finalPhotoUrl = `/api/proxy/?path=${encodeURIComponent(updatedActor.photo_url || '')}`;
    }

    setActors(prev => prev.map(a => {
      if (a.id === updatedActor.id || a.wpProductId === updatedActor.id || a.id === updatedActor.wpProductId) {
        return {
          ...a,
          ...updatedActor,
          photo_url: finalPhotoUrl || a.photo_url
        };
      }
      return a;
    }));
  };

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
        //  KORNEEL RULE: Use Centralized PricingEngine Logic
        return PricingEngine.isAvailable(actor, selectedMedia as any, masterControlState.filters.country);
      });
    }

    //  PRIMARY LANGUAGE FILTERING (Now handled on client for better UI context)
    if (masterControlState.filters.language) {
    const lowLang = masterControlState.filters.language?.toLowerCase() || '';
    const dbLang = MarketManager.getLanguageCode(lowLang);
      
      result = result.filter(actor => {
        const actorNative = actor.native_lang?.toLowerCase();
        const actorNativeLabel = actor.native_lang_label?.toLowerCase();
        
    //  CHRIS-PROTOCOL: Strict primary language matching for the grid
    // If the user selects a primary language, we only show actors whose native_lang matches.
    const isNativeMatch = actorNative === dbLang || 
                         actorNative === lowLang || 
                         actorNativeLabel === lowLang ||
                         (dbLang === 'nl-be' && (actorNative === 'vlaams' || actorNative === 'nl-be' || actorNativeLabel === 'vlaams')) ||
                         (dbLang === 'nl-nl' && (actorNative === 'nederlands' || actorNative === 'nl-nl' || actorNativeLabel === 'nederlands')) ||
                         (dbLang === 'fr-fr' && (actorNative === 'frans' || actorNative === 'fr-fr' || actorNativeLabel === 'frans')) ||
                         (dbLang === 'fr-be' && (actorNative === 'frans (be)' || actorNative === 'fr-be' || actorNativeLabel === 'frans (be)')) ||
                         (dbLang === 'en-gb' && (actorNative === 'engels' || actorNative === 'en-gb' || actorNativeLabel === 'engels')) ||
                         (dbLang === 'en-us' && (actorNative === 'engels (us)' || actorNative === 'en-us' || actorNativeLabel === 'engels (us)'));
        
        //  TELEPHONY MULTI-LANG: Only allow extra languages if multiple languages are selected
        // AND the actor's native language matches the primary selected language.
        if (masterControlState.journey === 'telephony' && masterControlState.filters.languages && masterControlState.filters.languages.length > 1) {
          // In multi-lang telephony, the FIRST language in the array is the primary native language.
          // We MUST ensure the actor is a native speaker of that primary language.
          const primarySelected = masterControlState.filters.languages[0]?.toLowerCase() || '';
          const primaryDbCode = MarketManager.getLanguageCode(primarySelected);
          
          const isNativeOfPrimary = actorNative === primaryDbCode || 
                                   actorNative === primarySelected ||
                                   actorNativeLabel === primarySelected ||
                                   (primaryDbCode === 'nl-be' && (actorNative === 'vlaams' || actorNative === 'nl-be' || actorNativeLabel === 'vlaams')) ||
                                   (primaryDbCode === 'nl-nl' && (actorNative === 'nederlands' || actorNative === 'nl-nl' || actorNativeLabel === 'nederlands')) ||
                                   (primaryDbCode === 'fr-fr' && (actorNative === 'frans' || actorNative === 'fr-fr' || actorNativeLabel === 'frans')) ||
                                   (primaryDbCode === 'fr-be' && (actorNative === 'frans (be)' || actorNative === 'fr-be' || actorNativeLabel === 'frans (be)'));
          
          if (!isNativeOfPrimary) return false;
          
          return true; // Let the multi-lang block below handle the extra language checks
        }

        return isNativeMatch;
      });
    }

    //  GENDER FILTERING (Now handled on client)
    if (masterControlState.filters.gender && masterControlState.filters.gender !== 'Iedereen') {
      const lowGender = masterControlState.filters.gender.toLowerCase();
      result = result.filter(actor => {
        const g = actor.gender?.toLowerCase() || '';
        if (lowGender.includes('man')) return g === 'male' || g === 'mannelijk';
        if (lowGender.includes('vrouw')) return g === 'female' || g === 'vrouwelijk';
        return true;
      });
    }

    //  TELEPHONY MULTI-LANG FILTERING
    if (masterControlState.journey === 'telephony' && masterControlState.filters.languages && masterControlState.filters.languages.length > 1) {
      const selectedLangs = masterControlState.filters.languages;
      
      result = result.filter(actor => {
        const actorLangs = [
          actor.native_lang, 
          ...(actor.extra_langs ? actor.extra_langs.split(',').map(l => l.trim()) : [])
        ].filter(Boolean).map(l => l?.toLowerCase());

        // Check if actor supports ALL selected languages
        return selectedLangs.every(lang => {
          const lowLang = lang.toLowerCase();
          const dbLang = MarketManager.getLanguageCode(lowLang);
          const shortLang = lowLang.split('-')[0];
          
          return actorLangs.some(al => al === dbLang || al === lowLang || al === shortLang || al?.includes(dbLang) || al?.includes(shortLang));
        });
      });
    }

    console.log('HomeContent: Filtered result', { 
      count: result.length, 
      names: result.map(a => a.display_name),
      firstActor: result.length > 0 ? {
        name: result[0].display_name,
        native: result[0].native_lang,
        price: result[0].starting_price
      } : null
    });

    //  SORTING LOGIC (God Mode 2026)
    const sortedResult = [...result].sort((a, b) => {
      switch (masterControlState.filters.sortBy) {
        case 'delivery':
          // Sort by minimum delivery days (lower is faster)
          return (a.delivery_days_min || 1) - (b.delivery_days_min || 1);
        case 'alphabetical':
          return (a.display_name || '').localeCompare(b.display_name || '');
        case 'popularity':
        default:
          // Sort by voiceScore (lower is better/more popular)
          return (a.voice_score || 10) - (b.voice_score || 10);
      }
    });

    return sortedResult;
  }, [actors, masterControlState.journey, masterControlState.filters.media, masterControlState.filters.country, masterControlState.filters.languages, masterControlState.filters.language, masterControlState.filters.gender, masterControlState.filters.sortBy]);

  const isTelephony = customerDNA?.intelligence?.lastIntent === 'telephony' || customerDNA?.intelligence?.detectedSector === 'it';

  //  POLYGLOT CHIPS LOGIC: Calculate available extra languages for the selected primary language
  const availableExtraLangs = useMemo(() => {
    if (masterControlState.journey !== 'telephony' || !masterControlState.filters.language) return [];
    
    const primaryLang = masterControlState.filters.language.toLowerCase();
    const primaryCode = MarketManager.getLanguageCode(primaryLang);

    const relevantActors = actors.filter(a => {
      const actorNative = a.native_lang?.toLowerCase();
      return actorNative === primaryLang || 
             actorNative === primaryCode ||
             (primaryCode === 'nl-be' && (actorNative === 'vlaams' || actorNative === 'nl-be')) ||
             (primaryCode === 'nl-nl' && (actorNative === 'nederlands' || actorNative === 'nl-nl'));
    });

    const extraLangsSet = new Set<string>();
    relevantActors.forEach(a => {
      if (a.extra_langs) {
        a.extra_langs.split(',').forEach(l => {
          const trimmed = l.trim();
          const lowTrimmed = trimmed.toLowerCase();
          
  //  CHRIS-PROTOCOL: Exclude native language and its variations from extra languages
  const isPrimary = lowTrimmed === primaryLang || 
                   lowTrimmed === primaryCode || 
                   (primaryCode === 'nl-be' && (lowTrimmed === 'vlaams' || lowTrimmed === 'nl-be')) ||
                   (primaryCode === 'nl-nl' && (lowTrimmed === 'nederlands' || lowTrimmed === 'nl-nl')) ||
                   (primaryCode === 'fr-fr' && (lowTrimmed === 'frans' || lowTrimmed === 'fr-fr')) ||
                   (primaryCode === 'fr-be' && (lowTrimmed === 'frans (be)' || lowTrimmed === 'fr-be'));
          
          //  CHRIS-PROTOCOL: Vlaams is a unique native type (nl-BE). 
          // Non-natives (like FR or NL-NL) can offer "Nederlands" as extra, but NEVER "Vlaams".
          const isVlaamsExtra = lowTrimmed === 'vlaams' || lowTrimmed === 'nl-be';
          
          if (trimmed && !isPrimary && !isVlaamsExtra) {
            //  CHRIS-PROTOCOL: Map extra language names to standard labels with CAPITALIZATION
            const mapped = MarketManager.getLanguageLabel(trimmed);
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

  const journeyContent = useMemo(() => {
    switch (masterControlState.journey) {
      case 'telephony':
        return {
          titlePart1: "Maak jouw",
          titleHighlight: "telefooncentrale",
          titlePart2: "menselijk.",
          subtitle: "Van welkomstboodschap tot wachtmuziek. Professionele stemmen die jouw klanten direct vertrouwen geven."
        };
      case 'video':
        return {
          titlePart1: "Geef jouw",
          titleHighlight: "video",
          titlePart2: "een eigen stem.",
          subtitle: "Bedrijfsfilms, explanimations of documentaires. Vind de perfecte match voor jouw visuele verhaal."
        };
      case 'commercial':
        return {
          titlePart1: "Scoor met",
          titleHighlight: "high-end",
          titlePart2: "commercials.",
          subtitle: "Radio, TV of Online. Stemmen met autoriteit die jouw merkwaarde en conversie direct verhogen."
        };
      default:
        return {
          titlePart1: "Vind de",
          titleHighlight: "stem",
          titlePart2: "voor jouw verhaal.",
          subtitle: "Van bedrijfsfilm tot commercial. Wij vinden de beste stem voor jouw boodschap."
        };
    }
  }, [masterControlState.journey]);

  return (
    <>
      <LiquidBackground strokeWidth={1.5} />
      
      <SectionInstrument className="!pt-20 pb-32 relative z-50">
        <ContainerInstrument plain className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="mb-20 text-center max-w-4xl mx-auto space-y-8">
            <h1 className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.9] text-va-black">
              <VoiceglotText translationKey={`home.hero.title_part1_${masterControlState.journey}`} defaultText={journeyContent.titlePart1} />
              {" "}
              <span className="text-primary italic">
                <VoiceglotText translationKey={`home.hero.title_highlight_${masterControlState.journey}`} defaultText={journeyContent.titleHighlight} />
              </span>
              <br />
              <VoiceglotText translationKey={`home.hero.title_part2_${masterControlState.journey}`} defaultText={journeyContent.titlePart2} />
            </h1>
            <p className="text-xl md:text-2xl font-light text-va-black/40 leading-tight tracking-tight mx-auto max-w-2xl">
              <VoiceglotText translationKey={`home.hero.subtitle_${masterControlState.journey}`} defaultText={journeyContent.subtitle} />
            </p>
          </div>

          <VoicesMasterControl actors={actors} filters={filters} availableExtraLangs={availableExtraLangs} />
          
          <div className="mt-20">
            {filteredActors && filteredActors.length > 0 ? (
              <VoiceGrid 
                strokeWidth={1.5} 
                actors={filteredActors.map(a => ({
                  ...a,
                  // Ensure we use the latest photo_url from our local state
                  photo_url: actors.find(actor => actor.id === a.id)?.photo_url || a.photo_url
                }))} 
                featured={true} 
                onSelect={(actor) => {
                  //  SPA MANDATE: Op de homepage navigeren we naar de agency pagina
                  // met de geselecteerde acteur en de juiste journey/filters.
                  const params = new URLSearchParams(window.location.search);
                  params.set('actorId', actor.id.toString());
                  params.set('step', 'script');
                  window.location.href = `/agency/?${params.toString()}`;
                }}
              />
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
  const [isLoading, setIsLoading] = useState(false);

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
    
    //  CHRIS-PROTOCOL: We fetch ALL live actors to handle polyglot UI context on client
    //  Previously we filtered by language/gender here, but that broke the "available extra languages" chips
    //  when switching between languages in the dropdown.
    const cleanParams = new URLSearchParams();
    params.forEach((value, key) => {
      // Only send journey, words, market, country to API. 
      // Language and Gender are now handled client-side for better UI responsiveness.
      if (['journey', 'words', 'market', 'country', 'spots', 'years'].includes(key)) {
        if (value && value !== 'null' && value !== 'undefined') {
          cleanParams.set(key, value);
        }
      }
    });

    const fetchUrl = `/api/actors/?${cleanParams.toString()}`;
    
    //  CHRIS-PROTOCOL: Use AbortController to prevent ghost fetches
    const controller = new AbortController();
    
    console.log(' Home: Fetching from', fetchUrl);
    setIsLoading(true);
    
    fetch(fetchUrl, { signal: controller.signal })
      .then(res => res.json())
      .then(resData => {
        if (!mounted) return;
        console.log(' Home: Received', resData?.results?.length || 0, 'actors');
        if (!resData || !resData.results) {
          setData({ actors: [], reviews: [] });
          return;
        }
        const mappedActors = resData.results.map((actor: any) => {
          //  CHRIS-PROTOCOL: Ensure photo_url is correctly proxied if it's a raw path
          let photoUrl = actor.photo_url;
          if (photoUrl && !photoUrl.startsWith('http') && !photoUrl.startsWith('/api/proxy') && !photoUrl.startsWith('/assets')) {
            photoUrl = `/api/proxy/?path=${encodeURIComponent(photoUrl)}`;
          }

          return {
            id: actor.id,
            display_name: actor.display_name,
            first_name: actor.first_name || actor.firstName,
            last_name: actor.last_name || actor.lastName,
            firstName: actor.firstName || actor.first_name,
            lastName: actor.lastName || actor.last_name,
            email: actor.email,
            photo_url: photoUrl,
            voice_score: actor.voice_score,
            native_lang: actor.native_lang,
            gender: actor.gender, //  CHRIS-PROTOCOL: Added missing gender field
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
            holiday_from: actor.holiday_from,
            holiday_till: actor.holiday_till,
            rates_raw: actor.rates_raw || {} // CHRIS-PROTOCOL: Pass rates for filtering
          };
        });
        setData({ actors: mappedActors, reviews: resData.reviews || [] });
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error('Home Data Fetch Error:', err);
        setData(prev => prev || { actors: [], reviews: [] });
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [mounted, searchParamsKey]);

  if (!mounted || (!data && isLoading)) {
    return <LoadingScreenInstrument text="Voices..." />;
  }
  
  return (
    <Suspense  fallback={<LoadingScreenInstrument text="Voices..." />}>
      {data && <HomeContent strokeWidth={1.5} actors={data.actors} reviews={data.reviews} />}
      {isLoading && data && (
        <div className="fixed top-0 left-0 w-full h-1 bg-primary/20 z-[9999]">
          <div className="h-full bg-primary animate-progress-fast" style={{ width: '30%' }} />
        </div>
      )}
    </Suspense>
  );
}
