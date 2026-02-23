"use client";

import { useCheckout } from '@/contexts/CheckoutContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { useAuth } from '@/contexts/AuthContext';
import { CommercialMediaType, SlimmeKassa } from '@/lib/engines/pricing-engine';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { cn } from '@/lib/utils';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Globe, Megaphone, Mic2, Phone, Radio, Star, Tv, Type, User, Users, Video, Search as SearchIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { AgencyFilterSheet } from './AgencyFilterSheet';
import { ContainerInstrument, TextInstrument, FlagBE, FlagDE, FlagDK, FlagES, FlagFR, FlagIT, FlagNL, FlagPL, FlagPT, FlagUK, FlagUS } from './LayoutInstruments';
import { OrderStepsInstrument } from './OrderStepsInstrument';
import { VoiceglotImage } from './VoiceglotImage';
import { VoiceglotText } from './VoiceglotText';
import { VoicesDropdown } from './VoicesDropdown';
import { VoicesWordSlider } from './VoicesWordSlider';
import { ActorReorderModal } from './ActorReorderModal';


interface VoicesMasterControlProps {
  actors?: any[]; //  Added actors prop for real-time extra language mapping
  filters?: {
    languages: string[];
    genders: string[];
    styles: string[];
  };
  availableExtraLangs?: string[]; 
  minimalMode?: boolean; //  Added minimalMode for portfolio use
}

export const VoicesMasterControl: React.FC<VoicesMasterControlProps> = ({ 
  actors = [], 
  filters = { languages: [], genders: [], styles: [] }, 
  availableExtraLangs = [],
  minimalMode = false
}) => {
  const { playClick, playSwell } = useSonicDNA();
  const { t, language } = useTranslation();
  const { state, updateJourney, updateFilters, updateStep, resetFilters } = useMasterControl();
  const { state: checkoutState, updateUsage } = useCheckout();
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [reorderLanguage, setReorderLanguage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReorderClick = (language: string) => {
    setReorderLanguage(language);
    setIsReorderModalOpen(true);
    playClick('pro');
  };

  const handleJourneySwitch = (id: any) => {
    try {
      playSwell();
    } catch (e) {
      console.warn('SonicDNA playSwell failed:', e);
    }
    playClick('pro');
    
    //  CHRIS-PROTOCOL: Sync both contexts
    updateJourney(id);
    
    // Map journey to usage for CheckoutContext
    const usageMap: Record<string, string> = {
      'telephony': 'telefonie',
      'video': 'unpaid',
      'commercial': 'commercial'
    };
    if (usageMap[id]) updateUsage(usageMap[id] as any);
  };

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

  // Use state.journey or checkoutState.usage to determine active journey
  const activeJourneyId = useMemo(() => {
    if (state.journey) return state.journey;
    const revMap: Record<string, string> = {
      'telephony': 'telephony',
      'video': 'video',
      'commercial': 'commercial',
      'telefonie': 'telephony',
      'unpaid': 'video',
    };
    return revMap[checkoutState.usage] || 'video';
  }, [state.journey, checkoutState.usage]);

  const sortedLanguages = useMemo(() => {
    const host = typeof window !== 'undefined' ? window.location.host : (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || MarketManager.getMarketDomains()['BE'].replace('https://', ''));
    const market = MarketManager.getCurrentMarket(host);
    
    //  CHRIS-PROTOCOL: Map extra languages available for each primary language
    const getExtraLangsFor = (primary: string, primaryValue: any) => {
      const lowPrimary = String(primary || '').toLowerCase();
      const lowPrimaryValue = String(primaryValue || '').toLowerCase();
      
      //  CHRIS-PROTOCOL: Combinations don't have extra langs
      if (lowPrimaryValue.includes(',')) return [];

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
              a.extra_langs.split(',').forEach((l: string) => {
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
      const result = Array.from(extraLangsSet).sort();
      return result;
    };

    const languageConfig = [
      { label: MarketManager.getLanguageLabel('nl-be'), value: 'nl-be', icon: FlagBE, langCode: 'nl-be', popular: market.popular_languages.includes('nl-be') || market.popular_languages.includes('Vlaams') },
      { label: MarketManager.getLanguageLabel('nl-nl'), value: 'nl-nl', icon: FlagNL, langCode: 'nl-nl', popular: market.popular_languages.includes('nl-nl') || market.popular_languages.includes('Nederlands') },
      { label: MarketManager.getLanguageLabel('fr-be'), value: 'fr-be', icon: FlagBE, langCode: 'fr-be', popular: (market.popular_languages.includes('fr-be') || market.popular_languages.includes('Frans')) && market.market_code === 'BE' },
      { label: MarketManager.getLanguageLabel('fr-fr'), value: 'fr-fr', icon: FlagFR, langCode: 'fr-fr', popular: (market.popular_languages.includes('fr-fr') || market.popular_languages.includes('Frans')) && market.market_code !== 'BE' },
      { label: MarketManager.getLanguageLabel('en-gb'), value: 'en-gb', icon: FlagUK, langCode: 'en-gb', popular: market.popular_languages.includes('en-gb') || market.popular_languages.includes('Engels') },
      { label: MarketManager.getLanguageLabel('en-us'), value: 'en-us', icon: FlagUS, langCode: 'en-us', popular: false },
      { label: MarketManager.getLanguageLabel('de-de'), value: 'de-de', icon: FlagDE, langCode: 'de-de', popular: market.popular_languages.includes('de-de') || market.popular_languages.includes('Duits') },
      { label: MarketManager.getLanguageLabel('es-es'), value: 'es-es', icon: FlagES, langCode: 'es-es', popular: market.popular_languages.includes('es-es') || market.popular_languages.includes('Spaans') },
      { label: MarketManager.getLanguageLabel('it-it'), value: 'it-it', icon: FlagIT, langCode: 'it-it', popular: market.popular_languages.includes('it-it') || market.popular_languages.includes('Italiaans') },
      { label: MarketManager.getLanguageLabel('pl-pl'), value: 'pl-pl', icon: FlagPL, langCode: 'pl-pl', popular: market.popular_languages.includes('pl-pl') || market.popular_languages.includes('Pools') },
      { label: MarketManager.getLanguageLabel('da-dk'), value: 'da-dk', icon: FlagDK, langCode: 'da-dk', popular: market.popular_languages.includes('da-dk') || market.popular_languages.includes('Deens') },
      { label: MarketManager.getLanguageLabel('pt-pt'), value: 'pt-pt', icon: FlagPT, langCode: 'pt-pt', popular: market.popular_languages.includes('pt-pt') || market.popular_languages.includes('Portugees') },
      { label: MarketManager.getLanguageLabel('sv-se'), value: 'sv-se', icon: Globe, langCode: 'sv-se', popular: market.popular_languages.includes('sv-se') || market.popular_languages.includes('Zweeds') },
    ];

    const mappedConfig = languageConfig.map(lang => ({
      ...lang,
      availableExtraLangs: state.journey === 'telephony' ? getExtraLangsFor(lang.label, lang.value) : []
    }));

    const popularLangs = mappedConfig.filter(l => l.popular);
    const otherLangs = mappedConfig.filter(l => !l.popular);

    const sortFn = (a: any, b: any) => {
      //  CHRIS-PROTOCOL: Universal Market-specific priority sorting (Bob-methode)
      const primaryLangCode = MarketManager.getLanguageCode(market.primary_language);
      
      const getPriority = (code: string) => {
        if (code === primaryLangCode) return 1;
        
        const popularIndex = market.popular_languages.findIndex(l => MarketManager.getLanguageCode(l) === code);
        if (popularIndex !== -1) return 2 + popularIndex;
        
        if (code.startsWith('en')) return 50;
        
        return 100;
      };
      
      const scoreA = getPriority(a.langCode);
      const scoreB = getPriority(b.langCode);
      
      if (scoreA !== scoreB) return scoreA - scoreB;
      
      // Specifieke fix voor Frans (BE) vs Frans (FR) in de Belgische markt
      if (market.market_code === 'BE' && a.langCode.startsWith('fr') && b.langCode.startsWith('fr')) {
        if (a.icon === FlagBE) return -1;
        if (b.icon === FlagBE) return 1;
      }

      return a.label.localeCompare(b.label);
    };

    //  CHRIS-PROTOCOL: Add "Alle talen" option for admin reordering context
    const allOption = { label: t('filter.all_languages', 'Alle talen'), value: 'all', popular: true, icon: Globe };

    const result = [
      allOption,
      ...popularLangs.sort(sortFn),
      { label: t('filter.other_languages', 'OVERIGE TALEN'), value: '', isHeader: true },
      ...otherLangs.sort(sortFn)
    ];

    return result;
  }, [state.journey, actors, t]);

  return (
    <ContainerInstrument className={cn("w-full mx-auto space-y-8 px-0", !minimalMode && "max-w-[1440px]")}>
      {/*  THE MASTER CONTROL BOX - CHRIS-PROTOCOL: Always show journey selector in script phase as it influences input style */}
      <ContainerInstrument plain className={cn(
        "w-full bg-white border border-black/10 rounded-[40px] p-3 shadow-aura group/master transition-all duration-500",
        // CHRIS-PROTOCOL: Reduce bottom padding when no filters are visible (Telephony/Video in script phase)
        (state.currentStep !== 'voice' && state.journey !== 'commercial' || minimalMode) && "pb-3"
      )}>
        
        {/* 1. Journey Selector (Top Row) */}
        <ContainerInstrument plain className={cn(
          "flex items-center md:justify-center p-1.5 bg-va-off-white/50 rounded-[32px] overflow-x-auto no-scrollbar snap-x snap-mandatory",
          ((state.currentStep === 'voice' || state.journey === 'commercial') && !minimalMode) && "mb-3"
        )}>
          <div className="flex items-center gap-1.5 min-w-full md:min-w-0">
            {journeys.map((j) => {
              const isActive = activeJourneyId === j.id;
              const Icon = j.icon;

              // CHRIS-PROTOCOL: Check if selected actor supports this journey (especially for 'commercial')
              const isCommercialJourney = j.id === 'commercial';
              let isUnsupported = false;
              
              if (state.currentStep !== 'voice' && checkoutState.selectedActor && isCommercialJourney) {
                const commercialTypes: CommercialMediaType[] = ['online', 'radio_national', 'tv_national', 'podcast', 'radio_regional', 'radio_local', 'tv_regional', 'tv_local'];
                const hasAnyCommercialRate = commercialTypes.some(type => 
                  SlimmeKassa.getAvailabilityStatus(checkoutState.selectedActor, [type], state.filters.country || 'BE') === 'available'
                );
                isUnsupported = !hasAnyCommercialRate;
              }

              if (isUnsupported) return null;

              return (
                <button
                  key={j.id}
                  onClick={() => handleJourneySwitch(j.id)}
                  className={cn(
                    "flex-1 md:flex-none flex items-center justify-start gap-3 md:gap-4 px-4 md:px-6 py-3 rounded-[28px] transition-all duration-500 group/btn text-left snap-center min-w-[140px] md:min-w-0",
                    isActive 
                      ? "bg-va-black text-white shadow-xl scale-[1.02] z-10" 
                      : "text-va-black/40 hover:text-va-black hover:bg-white/50"
                  )}
                >
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} className={cn("transition-all duration-500 shrink-0 md:w-6 md:h-6", isActive && j.color)} />
          <div className="flex flex-col">
            <span className="text-[12px] md:text-[14px] font-bold tracking-widest leading-none mb-1 whitespace-nowrap">
              <VoiceglotText translationKey={j.key} defaultText={j.label} instrument="label" context={`Navigatie journey label: ${j.label}`} />
            </span>
            <span className={cn(
              "text-[9px] md:text-[10px] font-medium tracking-wider uppercase opacity-60 whitespace-nowrap",
              isActive ? "text-white/80" : "text-va-black/40 group-hover/btn:text-va-black/60"
            )}>
              <VoiceglotText translationKey={`${j.key}.sub`} defaultText={j.subLabel} instrument="label" context={`Navigatie journey sub-label: ${j.subLabel}`} />
            </span>
          </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-auto hidden md:block" />}
                </button>
              );
            })}
          </div>
        </ContainerInstrument>

        {/* 2. Primary Filter Pill (Airbnb Style) */}
        {!minimalMode && (
          <AnimatePresence>
            {((state.currentStep === 'voice' || state.journey === 'commercial') && !pathname.startsWith('/voice/')) && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 0 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-visible"
              >
                {/* MOBILE FILTER TRIGGER (Moby-methode) */}
                <div className="md:hidden p-1.5">
                  <button 
                    onClick={() => setIsSheetOpen(true)}
                    className="w-full h-16 bg-white rounded-full border border-black/10 shadow-sm flex items-center px-6 gap-4 active:scale-[0.98] transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <SearchIcon size={18} />
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-[13px] font-bold tracking-widest text-va-black uppercase">
                        <VoiceglotText translationKey="filter.mobile_trigger" defaultText="Filters & Zoeken" />
                      </span>
                      <span className="text-[11px] text-va-black/40 truncate w-full text-left">
                        {state.filters.language ? t(`common.language.${state.filters.language.toLowerCase()}`, state.filters.language) : t('filter.all_languages', 'Alle talen')} • {state.filters.gender ? t(`common.gender.${state.filters.gender.toLowerCase()}`, state.filters.gender) : t('gender.everyone', 'Iedereen')} • {state.journey === 'commercial' ? (state.filters.media?.length || 0) + ' ' + t('common.channels', 'kanalen') : (state.filters.words || 200) + ' ' + t('common.words', 'woorden')}
                      </span>
                    </div>
                  </button>
                </div>

                {/* DESKTOP FILTERS */}
                <ContainerInstrument plain className="hidden md:block p-1.5">
                  <div className="flex flex-col">
                    <ContainerInstrument plain className="flex items-center bg-white rounded-full shadow-md border border-black/10 divide-x divide-black/10 h-20">
                      
                    {/* Language Segment - CHRIS-PROTOCOL: Hide in script flow */}
                    {state.currentStep === 'voice' ? (
                      <div className="flex-1 h-full flex flex-col justify-center relative group/lang">
                        <VoicesDropdown 
                          searchable
                          rounding="left"
                          options={sortedLanguages}
                          value={state.filters.languageId || state.filters.language}
                          selectedExtraLangs={state.filters.languageIds?.map(String) || state.filters.languages || []}
                          onExtraLangToggle={(lang) => {
                            //  CHRIS-PROTOCOL: Handle both ID and Label toggling
                            const isId = !isNaN(Number(lang));
                            if (isId) {
                              const langId = Number(lang);
                              const currentIds = state.filters.languageIds || [state.filters.languageId].filter(Boolean) as number[];
                              if (currentIds.includes(langId)) {
                                updateFilters({ languageIds: currentIds.filter(id => id !== langId) });
                              } else {
                                updateFilters({ languageIds: [...currentIds, langId] });
                              }
                            } else {
                              // Resolve label to ID if possible
                              const langId = sortedLanguages.find(opt => typeof opt === 'object' && opt.label === lang)?.value;
                              if (typeof langId === 'number') {
                                const currentIds = state.filters.languageIds || [state.filters.languageId].filter(Boolean) as number[];
                                if (currentIds.includes(langId)) {
                                  updateFilters({ languageIds: currentIds.filter(id => id !== langId) });
                                } else {
                                  updateFilters({ languageIds: [...currentIds, langId] });
                                }
                                return;
                              }

                              const currentLangs = state.filters.languages || [state.filters.language?.toLowerCase() || ''];
                              const lowLang = lang.toLowerCase();
                              if (currentLangs.includes(lowLang)) {
                                updateFilters({ languages: currentLangs.filter(l => l !== lowLang) });
                              } else {
                                updateFilters({ languages: [...currentLangs, lowLang] });
                              }
                            }
                          }}
                          onChange={(val) => {
                            if (typeof val === 'number') {
                              // Hard ID selected (from other contexts if any)
                              updateFilters({ 
                                languageId: val,
                                languageIds: [val],
                                language: sortedLanguages.find(opt => typeof opt === 'object' && opt.value === val)?.label || undefined
                              });
                            } else if (val && val.includes(',')) {
                              // Combination selected (Legacy support)
                              const langs = val.split(',').map((l: string) => l.trim().toLowerCase());
                              updateFilters({ 
                                language: val,
                                languages: langs
                              });
                            } else {
                              // ISO Code or Label selected
                              const opt = sortedLanguages.find(opt => typeof opt === 'object' && opt.value === val);
                              if (opt && typeof opt.value === 'string' && opt.value.includes('-')) {
                                // Standard ISO Code selected
                                updateFilters({ 
                                  language: opt.langCode, // Store the code, not the translated label
                                  languages: [opt.langCode],
                                  languageId: undefined // Clear ID if switching to code-based
                                });
                              } else if (opt && typeof opt.value === 'number') {
                                updateFilters({ 
                                  languageId: opt.value,
                                  languageIds: [opt.value],
                                  language: opt.label
                                });
                              } else {
                                // Fallback for labels
                                updateFilters({ 
                                  language: val || undefined,
                                  languages: val ? [val.toLowerCase()] : undefined 
                                });
                              }
                            }
                          }}
                          placeholder={t('filter.all_languages', 'Alle talen')}
                          label={t('filter.which_language', 'Welke taal?')}
                          className="w-full h-full"
                          onOrderClick={handleReorderClick}
                        />
                      </div>
                    ) : null}

                      {/* Gender Segment - CHRIS-PROTOCOL: Hide in script flow */}
                      {state.currentStep === 'voice' ? (
                        <div className="flex-1 h-full flex flex-col justify-center relative group/gender">
                          <VoicesDropdown 
                            options={[
                              { label: t('gender.everyone', language === 'fr' ? 'Tout le monde' : language === 'en' ? 'Everyone' : 'Iedereen'), value: '', icon: Users },
                              { label: t('gender.male', language === 'fr' ? 'Masculin' : language === 'en' ? 'Male' : 'Mannelijk'), value: 'Mannelijk', icon: User },
                              { label: t('gender.female', language === 'fr' ? 'Féminin' : language === 'en' ? 'Female' : 'Vrouwelijk'), value: 'Vrouwelijk', icon: User },
                            ]}
                            value={state.filters.gender || ''}
                            onChange={(val) => updateFilters({ gender: val || undefined })}
                            placeholder={t('gender.everyone', language === 'fr' ? 'Tout le monde' : language === 'en' ? 'Everyone' : 'Iedereen')}
                            label={t('filter.who', language === 'fr' ? 'Qui?' : language === 'en' ? 'Who?' : 'Wie?')}
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
                          label={t('filter.quantity', 'Hoeveelheid?')}
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
                              { label: t('country.be', language === 'fr' ? 'Belgique' : language === 'en' ? 'Belgium' : 'België'), value: 'BE' },
                              { label: t('country.nl', language === 'fr' ? 'Pays-Bas' : language === 'en' ? 'Netherlands' : 'Nederland'), value: 'NL' },
                              { label: t('country.fr', language === 'fr' ? 'France' : language === 'en' ? 'France' : 'Frankrijk'), value: 'FR' },
                              { label: t('country.de', language === 'fr' ? 'Allemagne' : language === 'en' ? 'Germany' : 'Duitsland'), value: 'DE' },
                              { label: t('country.uk', language === 'fr' ? 'Royaume-Uni' : language === 'en' ? 'United Kingdom' : 'Verenigd Koninkrijk'), value: 'UK' },
                              { label: t('country.us', language === 'fr' ? 'États-Unis' : language === 'en' ? 'United States' : 'Verenigde Staten'), value: 'US' },
                              { label: t('country.es', language === 'fr' ? 'Espagne' : language === 'en' ? 'Spain' : 'Spanje'), value: 'ES' },
                              { label: t('country.pt', language === 'fr' ? 'Portugal' : language === 'en' ? 'Portugal' : 'Portugal'), value: 'PT' },
                              { label: t('country.it', language === 'fr' ? 'Italie' : language === 'en' ? 'Italy' : 'Italië'), value: 'IT' },
                            ]}
                            value={state.filters.countries || [state.filters.country || 'BE']}
                            onChange={(val) => {
                              const countries = Array.isArray(val) ? val : (val ? [val] : []);
                              updateFilters({ countries: countries as any });
                            }}
                            placeholder={t('filter.select_countries', language === 'fr' ? 'Choisir pays' : language === 'en' ? 'Select countries' : 'Kies land(en)')}
                            label={t('filter.broadcast_area', language === 'fr' ? 'Zone de diffusion?' : language === 'en' ? 'Broadcast area?' : 'Uitzendgebied?')}
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
                            { label: t('sort.popularity', language === 'fr' ? 'Popularité' : language === 'en' ? 'Popularity' : 'Populariteit'), value: 'popularity', icon: Star },
                            { label: t('sort.delivery', language === 'fr' ? 'Délai de livraison' : language === 'en' ? 'Delivery time' : 'Levertijd'), value: 'delivery', icon: Clock },
                            { label: t('sort.alphabetical_az', language === 'fr' ? 'Nom (A-Z)' : language === 'en' ? 'Name (A-Z)' : 'Naam (A-Z)'), value: 'alphabetical_az', icon: Type },
                            { label: t('sort.alphabetical_za', language === 'fr' ? 'Nom (Z-A)' : language === 'en' ? 'Name (Z-A)' : 'Naam (Z-A)'), value: 'alphabetical_za', icon: Type },
                          ]}
                          value={state.filters.sortBy || 'popularity'}
                          onChange={(val) => updateFilters({ sortBy: val as any })}
                          placeholder={t('sort.placeholder', language === 'fr' ? 'Trier par' : language === 'en' ? 'Sort by' : 'Sorteer op')}
                          label={t('filter.sort', language === 'fr' ? 'Trier?' : language === 'en' ? 'Sort?' : 'Sorteer?')}
                          className="flex-1 h-full"
                        />
                      )}
                    </ContainerInstrument>

                  </div>
                </ContainerInstrument>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </ContainerInstrument>

      {/* De Filter Sheet (Mobile & Advanced) */}
      {!minimalMode && (
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
      )}

      {/* Actor Reorder Modal (Admin Only) */}
      {isAdmin && (
        <ActorReorderModal 
          isOpen={isReorderModalOpen}
          onClose={() => setIsReorderModalOpen(false)}
          language={reorderLanguage}
          actors={actors}
          onSuccess={() => {
            // Force refresh of actors list
            window.location.reload();
          }}
        />
      )}

      {/* 3. Order Progress (Bottom Row - Subtle) */}
      {!minimalMode && (
        <ContainerInstrument plain className="pt-4 relative z-0 flex items-center justify-center">
          {!pathname.startsWith('/voice/') && (
            <OrderStepsInstrument currentStep={state.currentStep} className="!mb-0" />
          )}
          
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
      )}
    </ContainerInstrument>
  );
};

const Chip = ({ label, onRemove }: { label: string, onRemove: () => void }) => {
  const { t } = useTranslation();
  return (
    <ContainerInstrument className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-black/5 rounded-full text-[14px] font-light tracking-widest shadow-sm hover:border-primary/20 transition-colors group">
      <TextInstrument className="text-va-black/60 group-hover:text-va-black">
        {t(`language.${String(label || '').toLowerCase()}`, String(label || ''))}
      </TextInstrument>
      <button onClick={onRemove} aria-label={t('action.remove', 'Verwijder')} className="hover:text-primary transition-colors p-0.5">
        <VoiceglotImage src="/assets/common/branding/icons/BACK.svg" width={10} height={10} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} />
      </button>
    </ContainerInstrument>
  );
};
