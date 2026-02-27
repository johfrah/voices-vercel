"use client";

import ConfiguratorPageClient from '@/app/checkout/configurator/ConfiguratorPageClient';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { PricingSummary } from '@/components/checkout/PricingSummary';
import { QuoteDownloadButton } from '@/components/checkout/QuoteDownloadButton';
import { ContainerInstrument, HeadingInstrument, LoadingScreenInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { VoiceGrid } from "@/components/ui/VoiceGrid";
import { VoicesMasterControl } from "@/components/ui/VoicesMasterControl";
import { useCheckout } from '@/contexts/CheckoutContext';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { SlimmeKassa } from '@/lib/engines/pricing-engine';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { useRouter } from 'next/navigation';
import { calculateDeliveryDate } from '@/lib/utils/delivery-logic';
import { VoiceFilterEngine } from '@/lib/engines/voice-filter-engine';

import { RecentlyPlayedBar } from "@/components/ui/RecentlyPlayedBar";

export function AgencyContent({ mappedActors, filters }: { mappedActors: any[], filters: any }) {
  const { state, updateStep } = useMasterControl();
  const [dynamicConfig, setDynamicConfig] = useState<{ languages: any[], genders: any[], journeys: any[], mediaTypes: any[], countries: any[] } | null>(null);

  useEffect(() => {
    // 🛡️ CHRIS-PROTOCOL: Handshake Truth Priming (v2.14.714)
    Promise.all([
      fetch('/api/admin/config?type=languages').then(res => res.json()),
      fetch('/api/admin/config?type=genders').then(res => res.json()),
      fetch('/api/admin/config?type=journeys').then(res => res.json()),
      fetch('/api/admin/config?type=media_types').then(res => res.json()),
      fetch('/api/admin/config?type=countries').then(res => res.json())
    ]).then(([langs, genders, journeys, mediaTypes, countries]) => {
      setDynamicConfig({
        languages: langs.results || [],
        genders: genders.results || [],
        journeys: journeys.results || [],
        mediaTypes: mediaTypes.results || [],
        countries: countries.results || []
      });
    });
  }, []);

  const { selectActor, state: checkoutState } = useCheckout();
  const { playClick } = useSonicDNA();
  const router = useRouter();

  //  CHRIS-PROTOCOL: Use a simple mounted guard to prevent hydration errors
  //  while keeping the structure identical between server and client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  //  CHRIS-PROTOCOL: Filter and Sort actors using the VoiceFilterEngine (2026)
  //  This ensures the grid "slides together" and sorting is identical across all pages.
  const filteredActors = useMemo(() => {
    if (!mappedActors || mappedActors.length === 0) return [];

    // 🛡️ CHRIS-PROTOCOL: Hydration Safety (v2.15.089)
    // We no longer return the raw mappedActors when !mounted.
    // Instead, we perform a basic filter that is safe for both server and client.
    // This prevents the "Text content does not match" error #425.
    
    const filterOptions = {
      journey: state.journey,
      language: state.filters.language,
      languageId: state.filters.languageId,
      languages: state.filters.languages,
      languageIds: state.filters.languageIds,
      gender: state.filters.gender,
      genderId: state.filters.genderId,
      media: state.filters.media,
      country: state.filters.country,
      countries: state.filters.countries,
      sortBy: state.filters.sortBy,
      currentStep: state.currentStep,
      selectedActorId: checkoutState.selectedActor?.id
    };

    if (mounted) {
      console.log(`[AgencyContent] Input actors: ${mappedActors.length}. Filters:`, filterOptions);
    }

    const result = VoiceFilterEngine.filter(mappedActors, filterOptions) || [];

    if (mounted) {
      console.log(`[AgencyContent] Result actors: ${result.length}`, {
        firstActor: result[0] ? { id: result[0].id, name: result[0].display_name } : 'none'
      });
    }

    return result;
  }, [mappedActors, state.journey, state.filters, state.currentStep, checkoutState.selectedActor?.id, mounted]);

  //  CHRIS-PROTOCOL: Handle initial actor selection from URL (Homepage SPA flow)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const actorId = params.get('actorId');
      const step = params.get('step');
      
      if (actorId && mappedActors) {
        const actor = mappedActors.find(a => a.id.toString() === actorId);
        if (actor && !checkoutState.selectedActor) {
          console.log(`[AgencyContent] Initializing with actor from homepage: ${actor.display_name}`);
          
          selectActor(actor);
          if (step === 'script') {
            updateStep('script');
          }
          
          // Clean up URL params to prevent re-triggering on refresh
          const cleanParams = new URLSearchParams(window.location.search);
          cleanParams.delete('actorId');
          cleanParams.delete('step');
          const cleanSearch = cleanParams.toString();
          const newUrl = (typeof window !== 'undefined' ? window.location.pathname : '') + (cleanSearch ? `?${cleanSearch}` : '');
          if (typeof window !== 'undefined') window.history.replaceState(null, '', newUrl);
        }
      } else if (!actorId && !checkoutState.selectedActor && state.currentStep === 'script' && (typeof window !== 'undefined' && window.location.pathname.startsWith('/agency'))) {
        // BOB-FIX: If we are in 'script' step but NO actor is selected (e.g. after refresh),
        // we MUST go back to 'voice' step to prevent an empty/broken state.
        // 🛡️ CHRIS-PROTOCOL: Only revert if we are actually on an agency page to prevent hijacking profile pages.
        console.warn("[AgencyContent] Script step active but no actor selected on agency page. Reverting to voice step.");
        updateStep('voice');
      }
    }
  }, [mappedActors, selectActor, updateStep, checkoutState.selectedActor, state.currentStep]);

  // ... rest of the file ...
  useEffect(() => {
    if (state.currentStep === 'script' && checkoutState.selectedActor) {
      const slug = checkoutState.selectedActor.slug || checkoutState.selectedActor.first_name?.toLowerCase();
      const journeyMap: Record<string, string> = {
        'telefonie': 'telefoon',
        'unpaid': 'video',
        'commercial': 'commercial'
      };
      const journey = journeyMap[checkoutState.usage] || 'video';
      
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const targetPath = `/${slug}/${journey}`;
      
      if (currentPath !== targetPath && !currentPath.includes('/checkout')) {
        //  CHRIS-PROTOCOL: Only replace if different to avoid redundant history entries
        if (typeof window !== 'undefined') window.history.replaceState(null, '', targetPath + window.location.search);
      }
    } else if (state.currentStep === 'voice' && (typeof window !== 'undefined' ? (!window.location.pathname.startsWith('/agency') && !MarketManager.isAgencyEntryPoint(window.location.pathname.split('/').filter(Boolean)[0])) : false)) {
      // Terug naar agency overzicht in de URL als we terug gaan naar casting
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      if (typeof window !== 'undefined' && !currentPath.startsWith('/agency') && !currentPath.startsWith('/voice/')) {
        window.history.replaceState(null, '', `/agency/${state.journey}` + window.location.search);
      }
    }
  }, [state.currentStep, checkoutState.selectedActor, checkoutState.usage, state.journey]);

  const handleActorSelect = (actor: any) => {
    playClick('success');
    selectActor(actor);
    
    //  CHRIS-PROTOCOL: Immediate step update for SPA responsiveness
    updateStep('script');
    
    //  BOB-METHODE: SPA-navigatie met URL-update
    // We gebruiken shallow: true (indien mogelijk) of we bouwen de URL handmatig 
    // om de snelheid van een SPA te behouden terwijl de URL wel verandert.
    const journeyMap: Record<string, string> = {
      'telefonie': 'telefoon',
      'unpaid': 'video',
      'commercial': 'commercial'
    };
    const journey = journeyMap[checkoutState.usage] || 'video';
    const slug = actor.slug || actor.first_name?.toLowerCase();
    
    // We navigeren naar de nieuwe URL, maar Next.js handelt dit af als een SPA transitie
    // CHRIS-PROTOCOL: Ensure we use the correct hierarchy /[slug]/[journey]
    router.push(`/${slug}/${journey}`, { scroll: false });
    
    // Scroll naar boven van de sectie voor de focus
    setTimeout(() => {
      const element = document.getElementById('master-control-anchor');
      if (element) {
        const yOffset = -20; 
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className={cn("max-w-[1440px] mx-auto px-0 transition-all duration-700", state.currentStep === 'checkout' ? "pt-24" : "pt-0")} id="master-control-anchor">
      {/* Filters persistent bovenaan */}
      {state.currentStep !== 'checkout' && (
        <div className="relative z-50 w-full px-4 md:px-6">
          <VoicesMasterControl 
            actors={mappedActors} 
            filters={filters} 
            languagesData={dynamicConfig?.languages}
            gendersData={dynamicConfig?.genders}
            journeysData={dynamicConfig?.journeys}
            mediaTypesData={dynamicConfig?.mediaTypes}
            countriesData={dynamicConfig?.countries}
          />
          <RecentlyPlayedBar />
        </div>
      )}
      
      <div className={cn("relative min-h-[600px] px-4 md:px-6 transition-all duration-500", state.currentStep === 'checkout' ? "mt-0" : "mt-12")}>
        <AnimatePresence mode="popLayout">
          {(!mounted || state.currentStep === 'voice') && (
            <motion.div
              key="voice-grid"
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)", transition: { duration: 0.3 } }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-stretch">
                  {[...Array(10)].map((_, i) => (
                    <div key={`skeleton-agency-${i}`} className="h-[350px] bg-va-off-white rounded-[20px] animate-pulse border border-black/[0.03]" />
                  ))}
                </div>
              }>
                <VoiceGrid 
                  actors={mounted ? filteredActors : mappedActors} 
                  onSelect={handleActorSelect}
                />
              </Suspense>
            </motion.div>
          )}

          {mounted && state.currentStep === 'script' && (
            <motion.div
              key="configurator"
              layout
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -20 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
                {/* Script & Prijs (9 kolommen breed) - EERST op mobiel */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="order-1 lg:order-2 lg:col-span-9 w-full"
                >
            <ConfiguratorPageClient 
              isEmbedded={true} 
              hideMediaSelector={true} 
              minimalMode={true} 
              hideCampaignCTA={true}
              hidePriceBlock={true}
            />
                </motion.div>

                {/* VoiceCard (3 kolommen breed) - LATER op mobiel, compact */}
                <div className="order-2 lg:order-1 lg:col-span-3 w-full">
                  {checkoutState.selectedActor && (
                    <motion.div
                      layoutId={`actor-${checkoutState.selectedActor?.id}`}
                      className="lg:sticky lg:top-10"
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        mass: 1
                      }}
                    >
                      <ConfigurableVoiceCard 
                        voice={checkoutState.selectedActor} 
                        onSelect={() => {}} 
                        hideButton
                        isCornered
                        compact={true} // Always compact in script step to save space
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {mounted && state.currentStep === 'checkout' && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="bg-white rounded-[40px] shadow-aura p-6 md:p-10 border border-black/[0.03]"
            >
              <div className="max-w-5xl mx-auto">
                <div className="mb-8 space-y-4">
                  <TextInstrument className="text-lg text-va-black/40 font-light">
                    <VoiceglotText translationKey="checkout.subtitle" defaultText="Vul je gegevens in om de bestelling af te ronden." />
                  </TextInstrument>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                  <div className="lg:col-span-7">
                    <CheckoutForm strokeWidth={1.5} />
                  </div>
                  <div className="lg:col-span-5 sticky top-10 space-y-6">
                    <PricingSummary strokeWidth={1.5} />
                    <QuoteDownloadButton />
                  </div>
                </div>
                
                {/* Terug knop voor checkout */}
                <div className="mt-12 pt-8 border-t border-black/[0.03] flex justify-center">
                  <button 
                    onClick={() => updateStep('script')}
                    className="text-[11px] font-bold tracking-widest text-va-black/20 hover:text-primary uppercase transition-colors flex items-center gap-2"
                  >
                    <div className="rotate-180">
                      <ChevronRight size={14} />
                    </div>
                    Terug naar script aanpassen
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Internal wrapper to override default VoiceCard behavior for Agency page
import { VoiceCard } from "@/components/ui/VoiceCard";
function ConfigurableVoiceCard({ voice, onSelect, hideButton, isCornered, compact }: { voice: any, onSelect: () => void, hideButton?: boolean, isCornered?: boolean, compact?: boolean }) {
  return (
    <VoiceCard 
      voice={voice} 
      onSelect={onSelect} 
      hideButton={hideButton}
      hidePrice={true} // CHRIS-PROTOCOL: Hide price in sidebar as it's redundant
      isCornered={isCornered}
      compact={compact}
    />
  );
}
