"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { CommercialMediaType, PricingEngine } from '@/lib/pricing-engine';
import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';
import { MarketManager } from '@config/market-manager';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Globe, Megaphone, Mic2, Phone, Radio, Star, Tv, Type, User, Users, Video } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { AgencyFilterSheet } from './AgencyFilterSheet';
import { ContainerInstrument, TextInstrument } from './LayoutInstruments';
import { OrderStepsInstrument } from './OrderStepsInstrument';
import { VoiceglotImage } from './VoiceglotImage';
import { VoiceglotText } from './VoiceglotText';
import { VoicesDropdown } from './VoicesDropdown';
import { VoicesWordSlider } from './VoicesWordSlider';


//  CHRIS-PROTOCOL: Circular Flag Components
const FlagBE = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex h-full w-full">
      <div className="w-1/3 h-full bg-black" />
      <div className="w-1/3 h-full bg-[#FAE042]" />
      <div className="w-1/3 h-full bg-[#ED2939]" />
    </div>
  </div>
);

const FlagNL = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex flex-col h-full w-full">
      <div className="h-1/3 w-full bg-[#AE1C28]" />
      <div className="h-1/3 w-full bg-white" />
      <div className="h-1/3 w-full bg-[#21468B]" />
    </div>
  </div>
);

const FlagFR = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex h-full w-full">
      <div className="w-1/3 h-full bg-[#002395]" />
      <div className="w-1/3 h-full bg-white" />
      <div className="w-1/3 h-full bg-[#ED2939]" />
    </div>
  </div>
);

const FlagUK = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0 bg-[#00247D] relative">
    {/* St Andrew's Cross (White Diagonal) */}
    <div className="absolute inset-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[3px] bg-white rotate-45" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[3px] bg-white -rotate-45" />
    </div>
    {/* St Patrick's Cross (Red Diagonal) */}
    <div className="absolute inset-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[1.5px] bg-[#CF142B] rotate-45" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[1.5px] bg-[#CF142B] -rotate-45" />
    </div>
    {/* St George's Cross (White background for red cross) */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-[5px] bg-white" />
      <div className="h-full w-[5px] bg-white" />
    </div>
    {/* St George's Cross (Red) */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-[3px] bg-[#CF142B]" />
      <div className="h-full w-[3px] bg-[#CF142B]" />
    </div>
  </div>
);

const FlagUS = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0 bg-white relative flex flex-col">
    {/* Stripes */}
    {[...Array(7)].map((_, i) => (
      <div key={i} className={cn("h-[3px] w-full", i % 2 === 0 ? "bg-[#B22234]" : "bg-white")} />
    ))}
    {/* Canton (Blue field) */}
    <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-[#3C3B6E] flex flex-wrap p-0.5 gap-0.5 items-start content-start">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="w-0.5 h-0.5 bg-white rounded-full shrink-0" />
      ))}
    </div>
  </div>
);

const FlagDE = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex flex-col h-full w-full">
      <div className="h-1/3 w-full bg-black" />
      <div className="h-1/3 w-full bg-[#FF0000]" />
      <div className="h-1/3 w-full bg-[#FFCC00]" />
    </div>
  </div>
);

const FlagES = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex flex-col h-full w-full">
      <div className="h-1/4 w-full bg-[#AA151B]" />
      <div className="h-2/4 w-full bg-[#F1BF00]" />
      <div className="h-1/4 w-full bg-[#AA151B]" />
    </div>
  </div>
);

const FlagIT = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex h-full w-full">
      <div className="w-1/3 h-full bg-[#009246]" />
      <div className="w-1/3 h-full bg-white" />
      <div className="w-1/3 h-full bg-[#CE2B37]" />
    </div>
  </div>
);

const FlagPL = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0">
    <div className="flex flex-col h-full w-full">
      <div className="h-1/2 w-full bg-white" />
      <div className="h-1/2 w-full bg-[#DC143C]" />
    </div>
  </div>
);

const FlagDK = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0 bg-[#C60C30] relative">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-[2px] bg-white" />
      <div className="h-full w-[2px] bg-white" style={{ marginLeft: '-20%' }} />
    </div>
  </div>
);

const FlagPT = () => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 shrink-0 relative flex">
    <div className="w-[40%] h-full bg-[#006600]" />
    <div className="w-[60%] h-full bg-[#FF0000]" />
  </div>
);

interface VoicesMasterControlProps {
  actors: any[]; //  Added actors prop for real-time polyglot mapping
  filters: {
    languages: string[];
    genders: string[];
    styles: string[];
  };
  availableExtraLangs?: string[]; 
}

export const VoicesMasterControl: React.FC<VoicesMasterControlProps> = ({ actors, filters, availableExtraLangs = [] }) => {
  const { playClick, playSwell } = useSonicDNA();
  const { t } = useTranslation();
  const { state, updateJourney, updateFilters, updateStep, resetFilters } = useMasterControl();
  const { state: checkoutState } = useCheckout();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const journeys = [
    { 
      id: 'telephony', 
      icon: Phone, 
      label: 'Telefonie', 
      subLabel: 'Voicemail & IVR',
      key: 'journey.telephony', 
      color: 'text-primary' 
    },
    { 
      id: 'video', 
      icon: Video, 
      label: 'Video', 
      subLabel: 'Corporate & Website',
      key: 'journey.video', 
      color: 'text-primary' 
    },
    { 
      id: 'commercial', 
      icon: Megaphone, 
      label: 'Advertentie', 
      subLabel: 'Radio, TV & Online Ads',
      key: 'journey.commercial', 
      color: 'text-primary' 
    },
  ] as const;

  
  
  //  COMPREHENSIVE LANGUAGE CONFIG (With Nested Polyglot Data)
  const sortedLanguages = useMemo(() => {
    const host = typeof window !== 'undefined' ? window.location.host : 'voices.be';
    const market = MarketManager.getCurrentMarket(host);
    
    //  CHRIS-PROTOCOL: Map extra languages available for each primary language
    const getExtraLangsFor = (primary: string, primaryValue: string) => {
      const lowPrimary = primary.toLowerCase();
      const lowPrimaryValue = primaryValue.toLowerCase();
      const primaryCode = MarketManager.getLanguageCode(lowPrimaryValue);
      const extraLangsSet = new Set<string>();
      
      if (actors && Array.isArray(actors)) {
        actors.forEach(a => {
          const actorNative = a.native_lang?.toLowerCase();
          
          //  CHRIS-PROTOCOL: Match native language by code or label
          const isMatch = actorNative === primaryCode || 
                         actorNative === lowPrimaryValue ||
                         (primaryCode === 'nl-be' && (actorNative === 'vlaams' || actorNative === 'nl-be')) ||
                         (primaryCode === 'nl-nl' && (actorNative === 'nederlands' || actorNative === 'nl-nl'));

          if (isMatch) {
            if (a.extra_langs) {
              a.extra_langs.split(',').forEach(l => {
                const trimmed = l.trim();
                const lowTrimmed = trimmed.toLowerCase();
                
                //  CHRIS-PROTOCOL: Exclude native language and its variations from extra languages
                const isPrimary = lowTrimmed === lowPrimary || lowTrimmed === lowPrimaryValue || 
                                 lowTrimmed === primaryCode ||
                                 lowPrimary.includes(lowTrimmed) || lowTrimmed.includes(lowPrimary);
                
                //  CHRIS-PROTOCOL: Vlaams is a unique native type (nl-BE). 
                // Non-natives (like FR or NL-NL) can offer "Nederlands" as extra, but NEVER "Vlaams".
                const isVlaamsExtra = lowTrimmed === 'vlaams' || lowTrimmed === 'nl-be';
                
                if (trimmed && !isPrimary && !isVlaamsExtra) {
                  // Map to standard labels using centralized MarketManager
                  extraLangsSet.add(MarketManager.getLanguageLabel(lowTrimmed));
                }
              });
            }
          }
        });
      }
      return Array.from(extraLangsSet).sort();
    };

    const languageConfig = [
      { label: t('language.vlaams', 'Vlaams'), value: 'Vlaams', icon: FlagBE, subLabel: t('country.be.sub', 'België'), popular: market.market_code === 'BE' || market.market_code === 'NLNL' },
      { label: t('language.nederlands', 'Nederlands'), value: 'Nederlands', icon: FlagNL, subLabel: t('country.nl.sub', 'Nederland'), popular: market.market_code === 'BE' || market.market_code === 'NLNL' },
      { label: t('language.frans', 'Frans'), value: 'Frans (BE)', icon: FlagBE, subLabel: t('country.be.sub', 'België'), popular: market.market_code === 'BE' },
      { label: t('language.frans', 'Frans'), value: 'Frans (FR)', icon: FlagFR, subLabel: t('country.fr.sub', 'Frankrijk'), popular: market.market_code === 'FR' || market.market_code === 'BE' },
      { label: t('language.engels', 'Engels'), value: 'Engels (UK)', icon: FlagUK, subLabel: t('country.uk.sub', 'United Kingdom'), popular: true },
      { label: t('language.engels', 'Engels'), value: 'Engels (US)', icon: FlagUS, subLabel: t('country.us.sub', 'United States'), popular: true },
      { label: t('language.duits', 'Duits'), value: 'Duits', icon: FlagDE, subLabel: t('country.de.sub', 'Duitsland'), popular: market.market_code === 'DE' || market.market_code === 'BE' || market.market_code === 'NLNL' },
      { label: t('language.spaans', 'Spaans'), value: 'Spaans', icon: FlagES, subLabel: t('country.es.sub', 'Spanje'), popular: market.market_code === 'ES' },
      { label: t('language.italiaans', 'Italiaans'), value: 'Italiaans', icon: FlagIT, subLabel: t('country.it.sub', 'Italië'), popular: market.market_code === 'IT' },
      { label: t('language.pools', 'Pools'), value: 'Pools', icon: FlagPL, subLabel: t('country.pl.sub', 'Polen') },
      { label: t('language.deens', 'Deens'), value: 'Deens', icon: FlagDK, subLabel: t('country.dk.sub', 'Denemarken') },
      { label: t('language.portugees', 'Portugees'), value: 'Portugees', icon: FlagPT, subLabel: t('country.pt.sub', 'Portugal'), popular: market.market_code === 'PT' },
      { label: t('language.zweeds', 'Zweeds'), value: 'Zweeds', icon: Globe, subLabel: t('country.se.sub', 'Zweden') },
    ].map(lang => ({
      ...lang,
      availableExtraLangs: state.journey === 'telephony' ? getExtraLangsFor(lang.label, lang.value) : []
    }));

    const popularLangs = languageConfig.filter(l => l.popular);
    const otherLangs = languageConfig.filter(l => !l.popular);

    const sortFn = (a: any, b: any) => {
      const getBaseLang = (label: string) => label.split(' ')[0];
      const baseA = getBaseLang(a.label);
      const baseB = getBaseLang(b.label); // Fixed double split typo

      if (market.market_code === 'BE') {
        if (a.value === 'Vlaams') return -1;
        if (b.value === 'Vlaams') return 1;
        if (a.value === 'Nederlands') return -1;
        if (b.value === 'Nederlands') return 1;
      }

      if (market.market_code === 'NLNL') {
        if (a.value === 'Nederlands') return -1;
        if (b.value === 'Nederlands') return 1;
        if (a.value === 'Vlaams') return -1;
        if (b.value === 'Vlaams') return 1;
      }

      if (baseA !== baseB) return baseA.localeCompare(baseB);
      return a.label.localeCompare(b.label);
    };

    const result = [
      ...popularLangs.sort(sortFn),
      { label: t('filter.other_languages', 'OVERIGE TALEN'), value: '', isHeader: true },
      ...otherLangs.sort(sortFn)
    ];

    return result;
  }, [state.journey, actors, t]);



  const handleJourneySwitch = (id: any) => {
    try {
      playSwell();
    } catch (e) {
      console.warn('SonicDNA playSwell failed:', e);
    }
    playClick('pro');
    updateJourney(id);
  };

  return (
    <ContainerInstrument className="w-full max-w-[1440px] mx-auto space-y-8 px-0">
      {/*  THE MASTER CONTROL BOX - CHRIS-PROTOCOL: Always show journey selector in script phase as it influences input style */}
      <ContainerInstrument plain className={cn(
        "w-full bg-white border border-black/10 rounded-[40px] p-3 shadow-aura group/master transition-all duration-500",
        // CHRIS-PROTOCOL: Reduce bottom padding when no filters are visible (Telephony/Video in script phase)
        state.currentStep !== 'voice' && state.journey !== 'commercial' && "pb-3"
      )}>
        
        {/* 1. Journey Selector (Top Row) */}
        <ContainerInstrument plain className={cn(
          "flex items-center justify-center p-1.5 bg-va-off-white/50 rounded-[32px]",
          (state.currentStep === 'voice' || state.journey === 'commercial') && "mb-3"
        )}>
          {journeys.map((j) => {
            const isActive = state.journey === j.id;
            const Icon = j.icon;

            // CHRIS-PROTOCOL: Check if selected actor supports this journey (especially for 'commercial')
            // We use the PricingEngine to determine if the actor has ANY available commercial rates.
            const isCommercialJourney = j.id === 'commercial';
            let isUnsupported = false;
            
            if (state.currentStep !== 'voice' && checkoutState.selectedActor && isCommercialJourney) {
              const commercialTypes: CommercialMediaType[] = ['online', 'radio_national', 'tv_national', 'podcast', 'radio_regional', 'radio_local', 'tv_regional', 'tv_local'];
              // If the actor has NO rates for ANY of these, they don't do commercial
              const hasAnyCommercialRate = commercialTypes.some(type => 
                PricingEngine.getAvailabilityStatus(checkoutState.selectedActor, [type], state.filters.country || 'BE') === 'available'
              );
              isUnsupported = !hasAnyCommercialRate;
            }

            // CHRIS-PROTOCOL: If unsupported, we hide the button entirely to avoid confusion
            if (isUnsupported) return null;

            return (
              <button
                key={j.id}
                onClick={() => handleJourneySwitch(j.id)}
                className={cn(
                  "flex-1 flex items-center justify-start gap-4 px-6 py-3 rounded-[28px] transition-all duration-500 group/btn text-left",
                  isActive 
                    ? "bg-va-black text-white shadow-xl scale-[1.02] z-10" 
                    : "text-va-black/40 hover:text-va-black hover:bg-white/50"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2 : 1.5} className={cn("transition-all duration-500 shrink-0", isActive && j.color)} />
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold tracking-widest leading-none mb-1">
                    <VoiceglotText translationKey={j.key} defaultText={j.label} />
                  </span>
                  <span className={cn(
                    "text-[10px] font-medium tracking-wider uppercase opacity-60",
                    isActive ? "text-white/80" : "text-va-black/40 group-hover/btn:text-va-black/60"
                  )}>
                    <VoiceglotText translationKey={`${j.key}.sub`} defaultText={j.subLabel} />
                  </span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-auto" />}
              </button>
            );
          })}
        </ContainerInstrument>

        {/* 2. Primary Filter Pill (Airbnb Style) */}
        <AnimatePresence>
          {(state.currentStep === 'voice' || state.journey === 'commercial') && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 0 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-visible"
            >
              <ContainerInstrument plain className="p-1.5">
                <div className="flex flex-col">
                  <ContainerInstrument plain className="flex items-center bg-white rounded-full shadow-md border border-black/10 divide-x divide-black/10 h-20">
                    
                  {/* Language Segment - CHRIS-PROTOCOL: Hide in script flow */}
                  {state.currentStep === 'voice' ? (
                    <div className="flex-1 h-full flex flex-col justify-center relative group/lang">
                      <VoicesDropdown 
                        searchable
                        rounding="left"
                        options={sortedLanguages}
                        value={state.filters.language}
                        selectedExtraLangs={state.filters.languages || []}
                        onExtraLangToggle={(lang) => {
                          const currentLangs = state.filters.languages || [state.filters.language?.toLowerCase() || ''];
                          const lowLang = lang.toLowerCase();
                          if (currentLangs.includes(lowLang)) {
                            updateFilters({ languages: currentLangs.filter(l => l !== lowLang) });
                          } else {
                            updateFilters({ languages: [...currentLangs, lowLang] });
                          }
                        }}
                        onChange={(val) => {
                          updateFilters({ 
                            language: val || undefined,
                            languages: val ? [val.toLowerCase()] : undefined 
                          });
                        }}
                        placeholder="Alle talen"
                        label="Welke taal?"
                        className="w-full h-full"
                      />
                    </div>
                  ) : null}

                    {/* Gender Segment - CHRIS-PROTOCOL: Hide in script flow */}
                    {state.currentStep === 'voice' ? (
                      <div className="flex-1 h-full flex flex-col justify-center relative group/gender">
                        <VoicesDropdown 
                          options={[
                            { label: t('gender.everyone', 'Iedereen'), value: '', icon: Users },
                            { label: t('gender.male', 'Mannelijk'), value: 'Mannelijk', icon: User },
                            { label: t('gender.female', 'Vrouwelijk'), value: 'Vrouwelijk', icon: User },
                          ]}
                          value={state.filters.gender || ''}
                          onChange={(val) => updateFilters({ gender: val || undefined })}
                          placeholder={t('gender.everyone', 'Iedereen')}
                          label={t('filter.who', 'Wie?')}
                          className="w-full h-full"
                        />
                      </div>
                    ) : null}

                    {/* Words Segment (Telephony & Video) - CHRIS-PROTOCOL: Hide in script flow */}
                    {state.currentStep === 'voice' && (state.journey === 'telephony' || state.journey === 'video') ? (
                      <VoicesWordSlider 
                        rounding="right"
                        isTelephony={state.journey === 'telephony'}
                        isVideo={state.journey === 'video'}
                        value={state.filters.words && state.filters.words >= 5 ? state.filters.words : (state.journey === 'telephony' ? 25 : 200)}
                        onChange={(val) => updateFilters({ words: val })}
                        disabled={state.currentStep === 'script'}
                        label="Hoeveelheid?"
                        className="flex-1 h-full animate-in fade-in slide-in-from-left-4 duration-500"
                      />
                    ) : null}

                    {/* Media Segment (Commercial only) -  AIRBNB STEPPER MODE */}
                    {state.journey === 'commercial' && (
                      <div className="flex-1 h-full flex flex-col justify-center relative group/media">
                        <VoicesDropdown 
                          stepperMode
                          rounding={state.currentStep !== 'voice' ? 'left' : 'none'}
                          options={[
                            { id: 'online', label: t('media.online_socials', 'Online & Socials'), value: 'online', icon: Globe, subLabel: t('media.online_socials.sub', 'YouTube, Meta, LinkedIn') },
                            { id: 'podcast', label: t('media.podcast', 'Podcast'), value: 'podcast', icon: Mic2, subLabel: t('media.podcast.sub', 'Pre-roll, Mid-roll') },
                            { id: 'radio', label: t('media.radio', 'Radio'), value: 'radio', icon: Radio, subLabel: t('media.radio.sub', 'Landelijke of regionale zenders'), hasRegions: true },
                            { id: 'tv', label: t('media.television', 'TV'), value: 'tv', icon: Tv, subLabel: t('media.television.sub', 'Landelijke of regionale zenders'), hasRegions: true }
                          ] as any}
                          value={(() => {
                            const val = state.filters.spotsDetail || {};
                            const mappedVal: Record<string, number> = {};
                            Object.keys(val).forEach(k => {
                              if (k.startsWith('radio_')) mappedVal['radio'] = val[k];
                              else if (k.startsWith('tv_')) mappedVal['tv'] = val[k];
                              else mappedVal[k] = val[k];
                            });
                            return mappedVal;
                          })()}
                          onChange={(val) => {
                            const mediaKeys = Object.keys(val);
                            
                            //  KELLY-MANDATE: Always require at least one media type for commercial journey
                            if (mediaKeys.length === 0) {
                              console.warn("[MasterControl] Attempted to clear all media types. Reverting to 'online'.");
                              updateFilters({ 
                                spotsDetail: { online: 1 },
                                media: ['online']
                              });
                              return;
                            }

                            const mappedMedia = mediaKeys.map(k => {
                              if (k === 'radio' || k === 'tv') {
                                const region = state.filters.mediaRegion?.[k] || 'national';
                                return `${k}_${region}`;
                              }
                              return k;
                            });

                            console.log("[MasterControl] Mapped Media:", mappedMedia);

                            // Map the spots detail to the new keys
                            const newSpotsDetail: Record<string, number> = {};
                            mediaKeys.forEach(k => {
                              if (k === 'radio' || k === 'tv') {
                                const region = state.filters.mediaRegion?.[k] || 'national';
                                newSpotsDetail[`${k}_${region}`] = val[k];
                              } else {
                                newSpotsDetail[k] = val[k];
                              }
                            });

                            updateFilters({ 
                              spotsDetail: newSpotsDetail,
                              media: mappedMedia as string[]
                            });
                          }}
                          yearsValue={state.filters.yearsDetail || {}}
                          onYearsChange={(val) => {
                            const newYearsDetail: Record<string, number> = {};
                            Object.keys(val).forEach(k => {
                              if (k === 'radio' || k === 'tv') {
                                const region = state.filters.mediaRegion?.[k] || 'national';
                                newYearsDetail[`${k}_${region}`] = val[k];
                              } else {
                                newYearsDetail[k] = val[k];
                              }
                            });
                            updateFilters({ yearsDetail: newYearsDetail });
                          }}
                          mediaRegion={state.filters.mediaRegion || {}}
                          onMediaRegionChange={(mediaId, region) => {
                            const newMediaRegion = { ...state.filters.mediaRegion, [mediaId]: region };
                            
                            // Update media array and details with the new region
                            const currentMedia = state.filters.media || [];
                            const newMedia = currentMedia.map(m => {
                              if (m.startsWith(mediaId + '_')) return `${mediaId}_${region}`;
                              return m;
                            });

                            const newSpotsDetail = { ...state.filters.spotsDetail };
                            const newYearsDetail = { ...state.filters.yearsDetail };

                            // Move values to new keys
                            Object.keys(newSpotsDetail).forEach(k => {
                              if (k.startsWith(mediaId + '_')) {
                                const val = newSpotsDetail[k];
                                delete newSpotsDetail[k];
                                newSpotsDetail[`${mediaId}_${region}`] = val;
                              }
                            });
                            Object.keys(newYearsDetail).forEach(k => {
                              if (k.startsWith(mediaId + '_')) {
                                const val = newYearsDetail[k];
                                delete newYearsDetail[k];
                                newYearsDetail[`${mediaId}_${region}`] = val;
                              }
                            });

                            updateFilters({ 
                              mediaRegion: newMediaRegion,
                              media: newMedia as any,
                              spotsDetail: newSpotsDetail,
                              yearsDetail: newYearsDetail
                            });
                          }}
                          placeholder={t('filter.select_types', 'Kies type(s)')}
                          label={t('filter.media_type', 'Mediatype?')}
                          className="h-full animate-in fade-in slide-in-from-left-4 duration-500"
                        />
                      </div>
                    )}

                    {/* Country Segment (Commercial only) */}
                    {state.journey === 'commercial' && (
                      <div className="flex-1 h-full flex flex-col justify-center relative group/country">
                        <VoicesDropdown 
                          searchable
                          rounding="right"
                          options={[
                            { label: t('country.be', 'België'), value: 'BE' },
                            { label: t('country.nl', 'Nederland'), value: 'NL' },
                            { label: t('country.fr', 'Frankrijk'), value: 'FR' },
                            { label: t('country.de', 'Duitsland'), value: 'DE' },
                            { label: t('country.uk', 'United Kingdom'), value: 'UK' },
                            { label: t('country.us', 'United States'), value: 'US' },
                            { label: t('country.es', 'Spanje'), value: 'ES' },
                            { label: t('country.pt', 'Portugal'), value: 'PT' },
                            { label: t('country.it', 'Italië'), value: 'IT' },
                          ]}
                          value={state.filters.countries || [state.filters.country || 'BE']}
                          onChange={(val) => {
                            const countries = Array.isArray(val) ? val : (val ? [val] : []);
                            updateFilters({ countries: countries as any });
                          }}
                          placeholder={t('filter.select_countries', 'Kies land(en)')}
                          label={t('filter.broadcast_area', 'Uitzendgebied?')}
                          className="h-full animate-in fade-in slide-in-from-left-4 duration-500"
                          multiSelect={true}
                        />
                      </div>
                    )}

                    {/* Sorting Segment (Airbnb Style) */}
                    {state.currentStep === 'voice' && (
                      <VoicesDropdown 
                        rounding="right"
                        options={[
                          { label: t('sort.popularity', 'Populariteit'), value: 'popularity', icon: Star },
                          { label: t('sort.delivery', 'Levertijd'), value: 'delivery', icon: Clock },
                          { label: t('sort.alphabetical', 'Alfabetisch'), value: 'alphabetical', icon: Type },
                        ]}
                        value={state.filters.sortBy || 'popularity'}
                        onChange={(val) => updateFilters({ sortBy: val as any })}
                        placeholder={t('sort.placeholder', 'Sorteer op')}
                        label={t('filter.sort', 'Sorteren?')}
                        className="flex-1 h-full"
                      />
                    )}
                  </ContainerInstrument>

                </div>
              </ContainerInstrument>
            </motion.div>
          )}
        </AnimatePresence>
      </ContainerInstrument>

      {/* De Filter Sheet (Mobile & Advanced) */}
      <AgencyFilterSheet 
        filters={filters} 
        activeParams={{
          language: state.filters.language || '',
          gender: state.filters.gender || '',
          style: state.filters.style || ''
        }} 
        onUpdate={(params) => updateFilters(params)}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />

      {/* 3. Order Progress (Bottom Row - Subtle) */}
      <ContainerInstrument plain className="pt-4 relative z-0 flex items-center justify-center">
        <OrderStepsInstrument currentStep={state.currentStep} className="!mb-0" />
        
        {mounted && state.currentStep !== 'voice' && (
          <button 
            onClick={() => {
              updateStep('voice');
              // Scroll to top of anchor
              const element = document.getElementById('master-control-anchor');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="absolute right-0 text-[11px] font-bold tracking-widest text-primary uppercase hover:opacity-70 transition-opacity flex items-center gap-2"
          >
            <VoiceglotImage src="/assets/common/branding/icons/BACK.svg" width={10} height={10} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} />
            <VoiceglotText translationKey="action.back_to_casting" defaultText="Terug naar Casting" />
          </button>
        )}
      </ContainerInstrument>
    </ContainerInstrument>
  );
};

const Chip = ({ label, onRemove }: { label: string, onRemove: () => void }) => {
  const { t } = useTranslation();
  return (
    <ContainerInstrument className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-black/5 rounded-full text-[14px] font-light tracking-widest shadow-sm hover:border-primary/20 transition-colors group">
      <TextInstrument className="text-va-black/60 group-hover:text-va-black">
        {t(`language.${label.toLowerCase()}`, label)}
      </TextInstrument>
      <button onClick={onRemove} aria-label={t('action.remove', 'Verwijder')} className="hover:text-primary transition-colors p-0.5">
        <VoiceglotImage src="/assets/common/branding/icons/BACK.svg" width={10} height={10} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} />
      </button>
    </ContainerInstrument>
  );
};
