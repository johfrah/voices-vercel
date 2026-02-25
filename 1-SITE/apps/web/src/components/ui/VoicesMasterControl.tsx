"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { CommercialMediaType, SlimmeKassa } from '@/lib/engines/pricing-engine';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Globe, Megaphone, Mic2, Phone, Radio, Search as SearchIcon, Star, Tv, Type, User, Users, Video } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { ActorReorderModal } from './ActorReorderModal';
import { AgencyFilterSheet } from './AgencyFilterSheet';
import { ContainerInstrument, FlagBE, FlagDE, FlagDK, FlagES, FlagFR, FlagIT, FlagNL, FlagPL, FlagPT, FlagUK, FlagUS, TextInstrument } from './LayoutInstruments';
import { OrderStepsInstrument } from './OrderStepsInstrument';
import { VoiceglotImage } from './VoiceglotImage';
import { VoiceglotText } from './VoiceglotText';
import { VoicesDropdown } from './VoicesDropdown';
import { VoicesWordSlider } from './VoicesWordSlider';

// 🛡️ CHRIS-PROTOCOL: Icon Registry for Handshake Truth
const ICON_MAP: Record<string, any> = {
  phone: Phone,
  video: Video,
  megaphone: Megaphone,
  'mic-2': Mic2,
  globe: Globe,
  radio: Radio,
  tv: Tv,
  users: Users,
  user: User,
  star: Star,
  clock: Clock,
  type: Type,
  search: SearchIcon,
  FlagBE, FlagNL, FlagFR, FlagUK, FlagUS, FlagDE, FlagES, FlagIT, FlagPL, FlagDK, FlagPT
};

interface VoicesMasterControlProps {
  actors?: any[];
  filters?: {
    languages: string[];
    genders: string[];
    styles: string[];
  };
  availableExtraLangs?: string[]; 
  minimalMode?: boolean;
  languagesData?: any[];
  gendersData?: any[];
  journeysData?: any[];
  mediaTypesData?: any[];
}

export const VoicesMasterControl: React.FC<VoicesMasterControlProps> = ({ 
  actors = [], 
  filters = { languages: [], genders: [], styles: [] }, 
  availableExtraLangs = [],
  minimalMode = false,
  languagesData = [],
  gendersData = [],
  journeysData = [],
  mediaTypesData = []
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
    updateJourney(id);
    const usageMap: Record<string, string> = {
      'telephony': 'telefonie',
      'video': 'unpaid',
      'commercial': 'commercial'
    };
    if (usageMap[id]) updateUsage(usageMap[id] as any);
  };

  const journeys = useMemo(() => {
    const baseJourneys = [
      { id: 'telephony', icon: Phone, label: 'Telefonie', subLabel: 'Voicemail & IVR', key: 'journey.telephony', color: 'text-primary' },
      { id: 'video', icon: Video, label: 'Video', subLabel: 'Corporate & Website', key: 'journey.video', color: 'text-primary' },
      { id: 'commercial', icon: Megaphone, label: 'Advertentie', subLabel: 'Radio, TV & Online Ads', key: 'journey.commercial', color: 'text-primary' },
    ];
    if (journeysData.length === 0) return baseJourneys;
    const allowedCodes = ['telephony', 'video', 'commercial'];
    return journeysData
      .filter(fj => allowedCodes.includes(fj.code))
      .map(fj => {
        const base = baseJourneys.find(bj => bj.id === fj.code);
        return {
          id: fj.code,
          icon: base?.icon || Globe,
          label: fj.label,
          subLabel: fj.description || base?.subLabel || '',
          key: base?.key || `journey.${fj.code}`,
          color: base?.color || 'text-primary'
        };
      });
  }, [journeysData]);

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

  const mappedLanguages = useMemo(() => {
    const getExtraLangsFor = (primary: string, primaryValue: any) => {
      const lowPrimaryValue = String(primaryValue || '').toLowerCase();
      if (lowPrimaryValue.includes(',')) return [];
      const primaryCode = MarketManager.getLanguageCode(lowPrimaryValue);
      const extraLangsSet = new Set<string>();
      if (actors && Array.isArray(actors)) {
        actors.forEach(a => {
          const actorNative = a.native_lang?.toLowerCase();
          const actorNativeId = a.native_lang_id || a.native_language_id;
          const isMatch = (typeof primaryValue === 'number' && actorNativeId === primaryValue) ||
                         actorNative === primaryCode || 
                         actorNative === lowPrimaryValue;
          if (isMatch && a.extra_langs) {
            a.extra_langs.split(',').forEach((l: string) => {
              const trimmed = l.trim();
              if (trimmed && trimmed !== 'null') {
                extraLangsSet.add(MarketManager.getLanguageLabel(trimmed));
              }
            });
          }
        });
      }
      return Array.from(extraLangsSet).sort();
    };

    const host = typeof window !== 'undefined' ? window.location.host : '';
    const market = MarketManager.getCurrentMarket(host);

    return languagesData.map(l => ({
      label: l.label,
      value: l.id,
      langCode: l.code,
      icon: ICON_MAP[l.icon] || Globe,
      popular: market.popular_languages.some(pl => pl.toLowerCase() === l.code.toLowerCase() || pl.toLowerCase() === l.label.toLowerCase()),
      availableExtraLangs: activeJourneyId === 'telephony' ? getExtraLangsFor(l.label, l.id) : []
    }));
  }, [languagesData, activeJourneyId, actors]);

  const sortedLanguages = useMemo(() => {
    const popularLangs = mappedLanguages.filter(l => l.popular);
    const otherLangs = mappedLanguages.filter(l => !l.popular);
    return [
      { label: t('filter.popular_languages', 'POPULAIRE TALEN'), value: '', isHeader: true, popular: true },
      ...popularLangs,
      { label: t('filter.other_languages', 'OVERIGE TALEN'), value: '', isHeader: true },
      ...otherLangs
    ];
  }, [mappedLanguages, t]);

  return (
    <ContainerInstrument className={cn("w-full mx-auto space-y-8 px-0", !minimalMode && "max-w-[1440px]")}>
      <ContainerInstrument plain className={cn(
        "w-full bg-white border border-black/10 rounded-[40px] p-3 shadow-aura group/master transition-all duration-500",
        (state.currentStep !== 'voice' && state.journey !== 'commercial' || minimalMode) && "pb-3"
      )}>
        <ContainerInstrument plain className={cn(
          "flex items-center md:justify-center p-1.5 bg-va-off-white/50 rounded-[32px] overflow-x-auto no-scrollbar snap-x snap-mandatory",
          ((state.currentStep === 'voice' || state.journey === 'commercial') && !minimalMode) && "mb-3"
        )}>
          <div className="flex items-center gap-1.5 min-w-full md:min-w-0">
            {journeys.map((j) => {
              const isActive = activeJourneyId === j.id;
              const Icon = j.icon;
              return (
                <button
                  key={j.id}
                  onClick={() => handleJourneySwitch(j.id)}
                  className={cn(
                    "flex-1 md:flex-none flex items-center justify-start gap-3 md:gap-4 px-4 md:px-6 py-3 rounded-[28px] transition-all duration-500 group/btn text-left snap-center min-w-[140px] md:min-w-0",
                    isActive ? "bg-va-black text-white shadow-xl scale-[1.02] z-10" : "text-va-black/40 hover:text-va-black hover:bg-white/50"
                  )}
                >
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} className={cn("transition-all duration-500 shrink-0 md:w-6 md:h-6", isActive && j.color)} />
                  <div className="flex flex-col">
                    <span className="text-[12px] md:text-[14px] font-bold tracking-widest leading-none mb-1 whitespace-nowrap">
                      <VoiceglotText translationKey={j.key} defaultText={j.label} />
                    </span>
                    <span className={cn("text-[9px] md:text-[10px] font-medium tracking-wider uppercase opacity-60 whitespace-nowrap", isActive ? "text-white/80" : "text-va-black/40 group-hover/btn:text-va-black/60")}>
                      <VoiceglotText translationKey={`${j.key}.sub`} defaultText={j.subLabel} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </ContainerInstrument>

        {!minimalMode && (
          <AnimatePresence>
            {((state.currentStep === 'voice' || state.journey === 'commercial') && !pathname.startsWith('/voice/')) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-visible"
              >
                <div className="md:hidden p-1.5">
                  <button onClick={() => setIsSheetOpen(true)} className="w-full h-16 bg-white rounded-full border border-black/10 shadow-sm flex items-center px-6 gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><SearchIcon size={18} /></div>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-[13px] font-bold tracking-widest text-va-black uppercase"><VoiceglotText translationKey="filter.mobile_trigger" defaultText="Filters & Zoeken" /></span>
                    </div>
                  </button>
                </div>

                <ContainerInstrument plain className="hidden md:block p-1.5">
                  <ContainerInstrument plain className="flex items-center bg-white rounded-full shadow-md border border-black/10 divide-x divide-black/10 h-20">
                    {state.currentStep === 'voice' && (
                      <div className="flex-1 h-full flex flex-col justify-center relative group/lang">
                        <VoicesDropdown
                          searchable
                          rounding="left"
                          options={sortedLanguages}
                          value={state.filters.languageId || state.filters.language}
                          onChange={(val) => {
                            if (typeof val === 'number') {
                              const optMatch = mappedLanguages.find(l => l.value === val);
                              updateFilters({ languageId: val, language: optMatch?.langCode || optMatch?.label });
                            } else {
                              updateFilters({ language: val || undefined });
                            }
                          }}
                          placeholder={t('filter.all_languages', 'Alle talen')}
                          label={t('filter.which_language', 'Welke taal?')}
                          className="w-full h-full"
                        />
                      </div>
                    )}
                  </ContainerInstrument>
                </ContainerInstrument>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </ContainerInstrument>

      {!minimalMode && (
        <ContainerInstrument plain className="pt-4 relative z-0 flex items-center justify-center">
          {!pathname.startsWith('/voice/') && <OrderStepsInstrument currentStep={state.currentStep} className="!mb-0" />}
          {mounted && state.currentStep !== 'voice' && (
            <button onClick={() => updateStep('voice')} className="absolute right-0 text-[11px] font-bold tracking-widest text-primary uppercase flex items-center gap-2">
              <VoiceglotText translationKey="action.back_to_casting" defaultText="Terug naar Casting" />
            </button>
          )}
        </ContainerInstrument>
      )}
    </ContainerInstrument>
  );
};
