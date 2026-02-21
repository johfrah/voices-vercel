"use client";

import { ContainerInstrument, HeadingInstrument, LoadingScreenInstrument, SectionInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceCardSkeleton } from "@/components/ui/VoiceCardSkeleton";
import { VoiceGrid } from "@/components/ui/VoiceGrid";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { VoicesMasterControl } from "@/components/ui/VoicesMasterControl";
import { useAuth } from "@/contexts/AuthContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { useMasterControl } from "@/contexts/VoicesMasterControlContext";
import { SlimmeKassa } from '@/lib/pricing-engine';
import { VoiceFilterEngine } from "@/lib/voice-filter-engine";
import { Actor } from "@/types";
import { MarketManager } from "@config/market-manager";
import { Suspense, useEffect, useMemo, useState } from 'react';
import dynamic from "next/dynamic";

//  NUCLEAR LOADING MANDATE
const LiquidBackground = dynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-va-off-white" />
});
const ReviewsInstrument = dynamic(() => import("@/components/ui/ReviewsInstrument").then(mod => mod.ReviewsInstrument), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-va-black/5 animate-pulse rounded-[40px]" />
});

import ConfiguratorPageClient from '@/app/checkout/configurator/ConfiguratorPageClient';
import { VoiceCard } from "@/components/ui/VoiceCard";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useSonicDNA } from "@/lib/sonic-dna";
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

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
function HomeContent({ actors: initialActors, reviews, reviewStats, dynamicConfig }: { actors: Actor[], reviews: any[], reviewStats?: { averageRating: number, totalCount: number }, dynamicConfig?: any }) {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { state: masterControlState, updateStep, resetFilters } = useMasterControl();
  const { selectActor, state: checkoutState } = useCheckout();
  const { playClick } = useSonicDNA();
  const router = useRouter();

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

    // COMMERCIAL & TELEPHONY FILTERING (VoiceFilterEngine Mandate 2026)
    const filteredActors = useMemo(() => {
      console.log(`[HomeContent] Filtering ${actors.length} actors with criteria:`, {
        journey: masterControlState.journey,
        language: masterControlState.filters.language,
        media: masterControlState.filters.media,
        country: masterControlState.filters.country
      });
      const results = VoiceFilterEngine.filter(actors, {
        journey: masterControlState.journey,
        language: masterControlState.filters.language,
        languageId: masterControlState.filters.languageId,
        languages: masterControlState.filters.languages,
        languageIds: masterControlState.filters.languageIds,
        gender: masterControlState.filters.gender,
        media: masterControlState.filters.media,
        country: masterControlState.filters.country,
        countryId: masterControlState.filters.countryId,
        toneIds: masterControlState.filters.toneIds,
        sortBy: masterControlState.filters.sortBy,
        currentStep: masterControlState.currentStep,
        selectedActorId: checkoutState.selectedActor?.id
      });
      console.log(`[HomeContent] Filtered results: ${results.length} actors`);
      return results;
    }, [actors, masterControlState.journey, masterControlState.filters, checkoutState.selectedActor?.id, masterControlState.currentStep]);

  const isTelephony = customerDNA?.intelligence?.lastIntent === 'telephony' || customerDNA?.intelligence?.detectedSector === 'it';

  //  EXTRA LANGUAGES LOGIC: Calculate available extra languages for the selected primary language
  const availableExtraLangs = useMemo(() => {
    if (masterControlState.journey !== 'telephony' || !masterControlState.filters.language || !actors) return [];
    
    const primaryLang = (masterControlState.filters.language || '').toLowerCase();
    const primaryCode = MarketManager.getLanguageCode(primaryLang);

    const relevantActors = (actors || []).filter(a => {
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

  //  CHRIS-PROTOCOL: Dynamic Filters from DB
  const filters = useMemo(() => {
    if (dynamicConfig?.languages) {
      return {
        languages: dynamicConfig.languages.map((l: any) => l.label),
        genders: [
          t('gender.mannelijk', 'Mannelijk'), 
          t('gender.vrouwelijk', 'Vrouwelijk')
        ],
        styles: [],
        categories: []
      };
    }
    return {
      languages: [
        t('language.vlaams', 'Vlaams'), 
        t('language.nederlands', 'Nederlands'), 
        t('language.frans', 'Frans'), 
        t('language.engels', 'Engels'), 
        t('language.duits', 'Duits')
      ],
      genders: [
        t('gender.mannelijk', 'Mannelijk'), 
        t('gender.vrouwelijk', 'Vrouwelijk')
      ],
      styles: [],
      categories: []
    };
  }, [dynamicConfig, t]);

  const journeyContent = useMemo(() => {
    const journey = masterControlState.journey;
    if (dynamicConfig?.journeyContent?.[journey]) {
      return dynamicConfig.journeyContent[journey];
    }

    switch (journey) {
      case 'telephony':
        return {
          titlePart1: t('home.hero.telephony.title_part1', "Maak jouw"),
          titleHighlight: t('home.hero.telephony.title_highlight', "telefooncentrale"),
          titlePart2: t('home.hero.telephony.title_part2', "menselijk."),
          subtitle: t('home.hero.telephony.subtitle', "Van welkomstboodschap tot wachtmuziek. Professionele stemmen die jouw klanten direct vertrouwen geven."),
          usps: [
            { key: 'telephony.warm', text: t('home.usp.telephony.warm', 'menselijke begroeting'), icon: 'mic' },
            { key: 'telephony.mix', text: t('home.usp.telephony.mix', 'inclusief muziek-mix'), icon: 'music' },
            { key: 'telephony.speed', text: t('home.usp.telephony.speed', '90% binnen 24 uur klaar'), icon: 'zap' }
          ]
        };
      case 'video':
        return {
          titlePart1: t('home.hero.video.title_part1', "Geef jouw"),
          titleHighlight: t('home.hero.video.title_highlight', "video"),
          titlePart2: t('home.hero.video.title_part2', "een eigen stem."),
          subtitle: t('home.hero.video.subtitle', "Bedrijfsfilms, explanimations of documentaires. Vind de perfecte match voor jouw visuele verhaal."),
          usps: [
            { key: 'video.timing', text: t('home.usp.video.timing', 'perfecte timing & flow'), icon: 'clock' },
            { key: 'video.guarantee', text: t('home.usp.video.guarantee', 'foutloze opname-garantie'), icon: 'check' },
            { key: 'video.quality', text: t('home.usp.video.quality', 'technisch perfect (48kHz)'), icon: 'shield' }
          ]
        };
      case 'commercial':
        return {
          titlePart1: t('home.hero.commercial.title_part1', "Scoor met"),
          titleHighlight: t('home.hero.commercial.title_highlight', "high-end"),
          titlePart2: t('home.hero.commercial.title_part2', "commercials."),
          subtitle: t('home.hero.commercial.subtitle', "Radio, TV of Online. Stemmen met autoriteit die jouw merkwaarde en conversie direct verhogen."),
          usps: [
            { key: 'commercial.buyout', text: t('home.usp.commercial.buyout', 'directe buy-out calculatie'), icon: 'pricing' },
            { key: 'commercial.authority', text: t('home.usp.commercial.authority', 'stemmen met autoriteit'), icon: 'megaphone' },
            { key: 'commercial.master', text: t('home.usp.commercial.master', 'broadcast-ready master'), icon: 'zap' }
          ]
        };
      default:
        return {
          titlePart1: t('home.hero.default.title_part1', "Vind de"),
          titleHighlight: t('home.hero.default.title_highlight', "stem"),
          titlePart2: t('home.hero.default.title_part2', "voor jouw verhaal."),
          subtitle: t('home.hero.default.subtitle', "Snel, simpel en technisch perfect. Wij selecteren de beste stemmen zodat jij dat niet hoeft te doen."),
          usps: [
            { key: 'home.usp.speed', text: t('home.usp.default.speed', '90% binnen 24 uur klaar'), icon: 'zap' },
            { key: 'home.usp.quality', text: t('home.usp.default.quality', 'top-selectie van vakmensen'), icon: 'shield' },
            { key: 'home.usp.retake', text: t('home.usp.default.retake', 'foutloze opname-garantie'), icon: 'check' }
          ]
        };
    }
  }, [masterControlState.journey, dynamicConfig]);

  const renderUspIcon = (type: string) => {
    switch (type) {
      case 'zap': return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
      case 'shield': return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
      case 'check': return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 6L9 17l-5-5"/></svg>;
      case 'mic': return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
      case 'music': return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
      case 'clock': return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
      case 'megaphone': return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/><path d="M4 8.13v15.47"/><path d="M11.6 16.8l10.1-10.1a1 1 0 0 0 0-1.4l-4.2-4.2a1 1 0 0 0-1.4 0l-10.1 10.1"/><path d="M17.5 6.5l2.5 2.5"/></svg>;
      case 'pricing': return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
      default: return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>;
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <LiquidBackground strokeWidth={1.5} />
      </Suspense>
      
      <SectionInstrument className="!pt-40 pb-32 relative z-50">
        <ContainerInstrument plain className="max-w-[1440px] mx-auto px-0">
          <ContainerInstrument plain className="mb-20 text-center max-w-4xl mx-auto space-y-8 px-4 md:px-6">
            <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.9] text-va-black">
              <VoiceglotText translationKey={`home.hero.title_part1_${masterControlState.journey}`} defaultText={journeyContent.titlePart1} />
              {" "}
              <TextInstrument as="span" className="text-primary italic font-light text-inherit">
                <VoiceglotText translationKey={`home.hero.title_highlight_${masterControlState.journey}`} defaultText={journeyContent.titleHighlight} />
              </TextInstrument>
              <br />
              <VoiceglotText translationKey={`home.hero.title_part2_${masterControlState.journey}`} defaultText={journeyContent.titlePart2} />
            </HeadingInstrument>
            <TextInstrument className="text-xl md:text-2xl font-light text-va-black/40 leading-tight tracking-tight mx-auto max-w-2xl">
              <VoiceglotText translationKey={`home.hero.subtitle_${masterControlState.journey}`} defaultText={journeyContent.subtitle} />
            </TextInstrument>

            {/* USP Trust-Bar (Bob-methode) */}
            <ContainerInstrument plain className="flex flex-wrap justify-center gap-x-12 gap-y-6 pt-8">
              {journeyContent.usps.map((usp) => (
                <ContainerInstrument key={usp.key} plain className="flex items-center gap-3">
                  <ContainerInstrument plain className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
                    {renderUspIcon(usp.icon)}
                  </ContainerInstrument>
                  <TextInstrument className="text-[14px] font-medium tracking-tight text-va-black/60">
                    <VoiceglotText translationKey={`home.usp.${usp.key}`} defaultText={usp.text} />
                  </TextInstrument>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          </ContainerInstrument>

          <div className="w-full relative z-50 px-4 md:px-6">
            <VoicesMasterControl actors={actors} filters={filters} availableExtraLangs={availableExtraLangs} />
          </div>
          
          <div className="mt-20 relative min-h-[600px] w-full px-4 md:px-6">
            <AnimatePresence mode="wait">
              {masterControlState.currentStep === 'voice' ? (
                <motion.div
                  key="voice-grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="w-full"
                >
                  {/* CHRIS-PROTOCOL: Deterministic Skeletons (Moby-methode) */}
                  {(!filteredActors || filteredActors.length === 0) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
                      {[...Array(8)].map((_, i) => (
                        <VoiceCardSkeleton key={`skeleton-${i}`} />
                      ))}
                    </div>
                  ) : (
                    <VoiceGrid 
                      strokeWidth={1.5} 
                      actors={filteredActors.map(a => ({
                        ...a,
                        // Ensure we use the latest photo_url from our local state
                        photo_url: actors.find(actor => actor.id === a.id)?.photo_url || a.photo_url
                      }))} 
                      featured={false} 
                      onSelect={(actor) => {
                        //  CHRIS-PROTOCOL: The "Ultimate SPA" Way
                        // We stay on the homepage and just switch the step!
                        console.log(`[Home] Initiating in-page SPA transition for: ${actor.display_name}`);
                        playClick('success');
                        
                        // 1. Set the actor in global checkout context
                        selectActor(actor);
                        
                        // 2. Set the step to script
                        updateStep('script');
                        
                        // 3. Update URL for Smart Routing
                        const newUrl = `/${actor.slug}/${masterControlState.journey}`;
                        window.history.pushState(null, '', newUrl);
                        
                        // 4. Scroll to top of the section
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="configurator"
                  initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -20 }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="w-full"
                >
                  <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start w-full">
                    {/* Script & Prijs (9 kolommen breed) - EERST op mobiel */}
                    <div className="order-1 lg:order-2 lg:col-span-9 w-full">
                      <ConfiguratorPageClient 
                        isEmbedded={true} 
                        hideMediaSelector={true} 
                        minimalMode={true} 
                        hidePriceBlock={true}
                      />
                    </div>

                    {/* VoiceCard (3 kolommen breed) - LATER op mobiel, compact */}
                    <div className="order-2 lg:order-1 lg:col-span-3 w-full">
                      <motion.div
                        layoutId={`actor-${checkoutState.selectedActor?.id}`}
                        className="lg:sticky lg:top-10 w-full"
                      >
                        {checkoutState.selectedActor && (
                          <VoiceCard 
                            voice={checkoutState.selectedActor} 
                            onSelect={() => {}} 
                            hideButton
                            hidePrice // CHRIS-PROTOCOL: Hide price in sidebar
                            isCornered
                            compact={true} 
                          />
                        )}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ContainerInstrument>
      </SectionInstrument>

      <SectionInstrument className="py-48 bg-white/80 backdrop-blur-md relative z-10">
        <ContainerInstrument plain className="max-w-7xl mx-auto px-4 md:px-6">
          <Suspense fallback={
            <div className="space-y-16">
              <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                <div className="space-y-4 w-full md:w-auto">
                  <div className="h-6 w-32 bg-va-black/5 rounded-full animate-pulse" />
                  <div className="h-24 w-full md:w-[600px] bg-va-black/5 rounded-2xl animate-pulse" />
                </div>
                <div className="h-20 w-64 bg-va-black/5 rounded-[24px] animate-pulse" />
              </div>
              <div className="flex gap-8 overflow-hidden">
                {[1, 2, 3].map(i => (
                  <div key={i} className="min-w-[400px] h-[450px] bg-va-black/5 rounded-[40px] animate-pulse" />
                ))}
              </div>
            </div>
          }>
            <ReviewsInstrument 
              reviews={reviews} 
              hideHeader={false} 
              averageRating={reviewStats?.averageRating?.toString() || "4.9"}
              totalReviews={reviewStats?.totalCount?.toString() || "392"}
              distribution={reviewStats?.distribution}
            />
          </Suspense>
        </ContainerInstrument>
      </SectionInstrument>

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
          "ratingValue": reviewStats?.averageRating || 4.9,
          "reviewCount": reviewStats?.totalCount || 392,
          "bestRating": "5",
          "worstRating": "1"
        },
        "review": reviews.slice(0, 3).map(r => ({
          "@type": "Review",
          "author": { "@type": "Person", "name": r.name || r.authorName },
          "reviewRating": { "@type": "Rating", "ratingValue": r.rating },
          "reviewBody": r.text || r.textNl || r.textFr || r.textEn
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
  const [data, setData] = useState<{ actors: Actor[], reviews: any[], reviewStats?: { averageRating: number, totalCount: number, distribution?: Record<number, number> }, dynamicConfig?: any } | null>(null);
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
    
    //  CHRIS-PROTOCOL: We fetch ALL live actors to handle extra language UI context on client
    const cleanParams = new URLSearchParams();
    params.forEach((value, key) => {
      //  CHRIS-PROTOCOL: Filter out legacy path segments that might have leaked into searchParams
      if (['journey', 'words', 'market', 'country', 'spots', 'years'].includes(key)) {
        if (value && value !== 'null' && value !== 'undefined' && !value.includes('/')) {
          cleanParams.set(key, value);
        }
      }
    });

    const fetchUrl = `/api/actors/?${cleanParams.toString()}`;
    const controller = new AbortController();
    
    setIsLoading(true);
    
    // Fetch both actors and dynamic home config
    Promise.all([
      fetch(fetchUrl, { signal: controller.signal }).then(res => res.json()),
      fetch('/api/home/config', { signal: controller.signal }).then(res => res.json())
    ])
      .then(([resData, homeConfig]) => {
        if (!mounted) return;
        if (!resData || !resData.results) {
          setData({ actors: [], reviews: [], dynamicConfig: homeConfig });
          return;
        }
        const mappedActors = resData.results.map((actor: any) => {
          let photoUrl = actor.photo_url;
          if (photoUrl && !photoUrl.startsWith('http') && !photoUrl.startsWith('/api/proxy') && !photoUrl.startsWith('/assets')) {
            photoUrl = `/api/proxy/?path=${encodeURIComponent(photoUrl)}`;
          }

          return {
            ...actor,
            photo_url: photoUrl,
            native_lang_label: MarketManager.getLanguageLabel(actor.native_lang || ''),
          };
        });
        setData({ 
          actors: mappedActors, 
          reviews: resData.reviews || [], 
          reviewStats: resData.reviewStats, 
          dynamicConfig: homeConfig 
        });
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error('Home Data Fetch Error:', err);
        setData(prev => prev || { actors: [], reviews: [], reviewStats: { averageRating: 4.9, totalCount: 392 } });
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [mounted, searchParamsKey]);

  if (!mounted || (!data && isLoading)) {
    return (
      <SectionInstrument className="!pt-40 pb-32 relative z-50">
        <ContainerInstrument plain className="max-w-[1440px] mx-auto px-0">
          <div className="mb-20 text-center max-w-4xl mx-auto space-y-8 px-4 md:px-6">
            <div className="h-20 w-3/4 bg-va-black/5 rounded-2xl mx-auto animate-pulse" />
            <div className="h-6 w-1/2 bg-va-black/5 rounded-xl mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch px-4 md:px-6">
            {[...Array(8)].map((_, i) => (
              <VoiceCardSkeleton key={`skeleton-initial-${i}`} />
            ))}
          </div>
        </ContainerInstrument>
      </SectionInstrument>
    );
  }
  
  return (
    <Suspense fallback={
      <SectionInstrument className="!pt-40 pb-32 relative z-50">
        <ContainerInstrument plain className="max-w-[1440px] mx-auto px-0">
          <div className="mb-20 text-center max-w-4xl mx-auto space-y-8 px-4 md:px-6">
            <div className="h-20 w-3/4 bg-va-black/5 rounded-2xl mx-auto animate-pulse" />
            <div className="h-6 w-1/2 bg-va-black/5 rounded-xl mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch px-4 md:px-6">
            {[...Array(8)].map((_, i) => (
              <VoiceCardSkeleton key={`skeleton-suspense-${i}`} />
            ))}
          </div>
        </ContainerInstrument>
      </SectionInstrument>
    }>
      {data && <HomeContent strokeWidth={1.5} actors={data.actors} reviews={data.reviews} reviewStats={data.reviewStats} dynamicConfig={data.dynamicConfig} />}
      {isLoading && data && (
        <div className="fixed top-0 left-0 w-full h-1 bg-primary/20 z-[9999]">
          <div className="h-full bg-primary animate-progress-fast" style={{ width: '30%' }} />
        </div>
      )}
    </Suspense>
  );
}
