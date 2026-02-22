"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Globe, Users, Mic2, CheckCircle2, Search as SearchIcon, Type, Clock, Star, Video, Phone, Megaphone } from 'lucide-react';
import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { useTranslation } from '@/contexts/TranslationContext';
import { useMasterControl } from '@/contexts/VoicesMasterControlContext';
import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  SectionInstrument, 
  TextInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { VoicesWordSlider } from './VoicesWordSlider';

/**
 * NATIVE-READY AGENCY FILTER SHEET
 * Volgens Master Voices Protocol 2026
 */
export const AgencyFilterSheet: React.FC<{ 
  filters: { languages: string[], genders: string[], styles: string[] },
  activeParams: Record<string, string>,
  onUpdate: (params: Record<string, any>) => void,
  isOpen: boolean,
  onClose: () => void
}> = ({ filters, activeParams, onUpdate, isOpen, onClose }) => {
  const { t, language } = useTranslation();
  const { playClick } = useSonicDNA();
  const { state, updateFilters } = useMasterControl();

  const handleSelect = (key: string, value: any) => {
    playClick('soft');
    const current = activeParams[key];
    onUpdate({ [key]: current === value ? undefined : value });
  };

  //  MARKET-BASED LANGUAGE LOGIC
  const sortedLanguages = React.useMemo(() => {
    //  MARKET-AWARE FILTERING
    const host = typeof window !== 'undefined' ? window.location.host : 'voices.be';
    const market = MarketManager.getCurrentMarket(host);
    
    //  CHRIS-PROTOCOL: Toon ALTIJD alle talen die in de database zitten, 
    // maar gebruik de market-volgorde voor de top-selectie.
    const allAvailableLangs = [...filters.languages];
    const marketLangs = market.supported_languages;
    
    return allAvailableLangs.sort((a, b) => {
      // 1. Primary language ALTIJD op 1
      if (a === market.primary_language) return -1;
      if (b === market.primary_language) return 1;
      
      // 2. Check of ze in de market-lijst staan
      const indexA = marketLangs.indexOf(a);
      const indexB = marketLangs.indexOf(b);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // 3. De rest alfabetisch
      return a.localeCompare(b);
    });
  }, [filters.languages]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <ContainerInstrument
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { onClose(); }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />
          <ContainerInstrument
            as={motion.div}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 bg-va-off-white rounded-t-[40px] z-50 shadow-2xl border-t border-white/20 max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Handle */}
            <ContainerInstrument className="h-12 flex items-center justify-center flex-shrink-0">
              <ContainerInstrument className="w-12 h-1.5 bg-black/10 rounded-full" />
            </ContainerInstrument>

            {/* Content */}
            <ContainerInstrument className="flex-1 overflow-y-auto px-6 pb-32">
              <ContainerInstrument className="space-y-10">
                <ContainerInstrument as="header" className="flex justify-between items-end">
                  <ContainerInstrument>
                    <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter text-va-black Raleway"><VoiceglotText  translationKey="filter.title" defaultText="Filters" /></HeadingInstrument>
                    <TextInstrument className="text-[15px] font-light tracking-widest text-va-black/30"><VoiceglotText  translationKey="filter.subtitle" defaultText="Vind de perfecte stem" /></TextInstrument>
                  </ContainerInstrument>
                  <ButtonInstrument 
                    onClick={() => { onUpdate({ language: undefined, gender: undefined, style: undefined }); }}
                    className="text-[15px] font-light tracking-widest text-primary"
                  >
                    <VoiceglotText  translationKey="filter.clear_all" defaultText="Wis alles" />
                  </ButtonInstrument>
                </ContainerInstrument>

                {/* Journey Section (Mobile Only) */}
                <SectionInstrument className="space-y-4 md:hidden">
                  <ContainerInstrument className="flex items-center gap-2 text-va-black/40">
                    <Star strokeWidth={1.5} size={14} />
                    <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest Raleway">
                      <VoiceglotText translationKey="filter.journey" defaultText="Type Project" />
                    </HeadingInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'telephony', label: 'Telefonie', icon: Phone },
                      { id: 'video', label: 'Video', icon: Video },
                      { id: 'commercial', label: 'Advertentie', icon: Megaphone }
                    ].map((j) => (
                      <ButtonInstrument
                        key={j.id}
                        onClick={() => {
                          const usageMap: any = { telephony: 'telefonie', video: 'unpaid', commercial: 'commercial' };
                          onUpdate({ journey: j.id, usage: usageMap[j.id] });
                        }}
                        className={cn(
                          "w-full px-6 py-4 rounded-2xl flex items-center gap-4 transition-all border-2",
                          state.journey === j.id ? "bg-va-black text-white border-va-black shadow-lg" : "bg-white border-black/5 text-va-black/60"
                        )}
                      >
                        <j.icon size={18} strokeWidth={state.journey === j.id ? 2 : 1.5} />
                        <span className="text-[15px] font-bold tracking-widest">{j.label}</span>
                        {state.journey === j.id && <Check size={16} className="ml-auto text-primary" />}
                      </ButtonInstrument>
                    ))}
                  </ContainerInstrument>
                </SectionInstrument>

                {/* Language Section */}
                <SectionInstrument className="space-y-4">
                  <ContainerInstrument className="flex items-center gap-2 text-va-black/40">
                    <Globe strokeWidth={1.5} size={14} />
                    <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest Raleway">
                      <VoiceglotText translationKey="filter.language" defaultText="Taal" />
                    </HeadingInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {sortedLanguages.map(lang => (
                      <FilterChip strokeWidth={1.5} 
                        key={lang} 
                        label={t(`common.language.${lang.toLowerCase()}`, lang)} 
                        selected={activeParams.language === lang} 
                        onClick={() => { handleSelect('language', lang); }} 
                      />
                    ))}
                  </ContainerInstrument>
                </SectionInstrument>

                {/* Gender Section */}
                <SectionInstrument className="space-y-4">
                  <ContainerInstrument className="flex items-center gap-2 text-va-black/40">
                    <Users size={14} strokeWidth={1.5} />
                    <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest Raleway"><VoiceglotText  translationKey="auto.agencyfiltersheet.geslacht.aa3dc2" defaultText="Geslacht" /></HeadingInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="grid grid-cols-2 gap-3">
                    {['Mannelijk', 'Vrouwelijk'].map(gender => (
                      <FilterChip strokeWidth={1.5} 
                        key={gender} 
                        label={t(`common.gender.${gender.toLowerCase()}`, gender)} 
                        selected={activeParams.gender === gender} 
                        onClick={() => { handleSelect('gender', gender); }} 
                      />
                    ))}
                  </ContainerInstrument>
                </SectionInstrument>

                {/* Quantity Section (Mobile Only) */}
                {(state.journey === 'telephony' || state.journey === 'video') && (
                  <SectionInstrument className="space-y-4 md:hidden">
                    <ContainerInstrument className="flex items-center gap-2 text-va-black/40">
                      <Type strokeWidth={1.5} size={14} />
                      <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest Raleway">
                        <VoiceglotText translationKey="filter.quantity" defaultText="Hoeveelheid woorden" />
                      </HeadingInstrument>
                    </ContainerInstrument>
                    <ContainerInstrument className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                      <VoicesWordSlider 
                        inline
                        isTelephony={state.journey === 'telephony'}
                        isVideo={state.journey === 'video'}
                        value={state.filters.words || (state.journey === 'telephony' ? 25 : 200)}
                        onChange={(val) => onUpdate({ words: val })}
                        label=""
                      />
                    </ContainerInstrument>
                  </SectionInstrument>
                )}

                {/* Sorting Section (Mobile Only) */}
                <SectionInstrument className="space-y-4 md:hidden">
                  <ContainerInstrument className="flex items-center gap-2 text-va-black/40">
                    <Clock strokeWidth={1.5} size={14} />
                    <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest Raleway">
                      <VoiceglotText translationKey="filter.sort" defaultText="Sorteren op" />
                    </HeadingInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'popularity', label: 'Populariteit', icon: Star },
                      { id: 'delivery', label: 'Levertijd', icon: Clock },
                      { id: 'alphabetical_az', label: 'Naam (A-Z)', icon: Type }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => onUpdate({ sortBy: s.id })}
                        className={cn(
                          "w-full px-6 py-4 rounded-2xl flex items-center gap-4 transition-all",
                          state.filters.sortBy === s.id ? "bg-primary text-va-black font-bold" : "bg-white border border-black/5 text-va-black/60"
                        )}
                      >
                        <s.icon size={16} />
                        <span className="text-[14px] tracking-widest">{s.label}</span>
                        {state.filters.sortBy === s.id && <Check size={14} strokeWidth={3} className="ml-auto" />}
                      </button>
                    ))}
                  </ContainerInstrument>
                </SectionInstrument>

                {/* Style Section */}
                {filters.styles.length > 0 && (
                  <SectionInstrument className="space-y-4">
                    <ContainerInstrument className="flex items-center gap-2 text-va-black/40">
                      <Mic2 strokeWidth={1.5} size={14} />
                      <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest Raleway"><VoiceglotText  translationKey="filter.style" defaultText="Stijl" /></HeadingInstrument>
                    </ContainerInstrument>
                    <ContainerInstrument className="grid grid-cols-2 gap-3">
                      {filters.styles.map(style => (
                        <FilterChip strokeWidth={1.5} 
                          key={style} 
                          label={t(`common.style.${style.toLowerCase().replace(/\s+/g, '_')}`, style)} 
                          selected={activeParams.style?.toLowerCase() === style.toLowerCase()} 
                          onClick={() => { handleSelect('style', style); }} 
                        />
                      ))}
                    </ContainerInstrument>
                  </SectionInstrument>
                )}
              </ContainerInstrument>
            </ContainerInstrument>

            {/* Sticky Apply Button */}
            <ContainerInstrument className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-va-off-white via-va-off-white to-transparent">
              <ButtonInstrument 
                onClick={() => { onClose(); }}
                className="w-full py-6 bg-va-black text-white rounded-[24px] font-black tracking-widest text-[15px] shadow-aura active:scale-95 transition-all"
              >
                <VoiceglotText  translationKey="filter.show_results" defaultText="Toon Resultaten" />
              </ButtonInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </>
      )}
    </AnimatePresence>
  );
};

const FilterChip = ({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) => {
  const isAi = label.startsWith('ai:');
  const displayLabel = isAi ? label.replace('ai:', '') : label;

  return (
    <ButtonInstrument
      onClick={() => { onClick(); }}
      className={cn(
        "px-6 py-4 rounded-2xl text-[15px] font-light tracking-widest border-2 transition-all flex items-center justify-between group",
        selected 
          ? "bg-primary border-primary text-va-black shadow-lg" 
          : "bg-white border-black/5 text-va-black/40 hover:border-black/10"
      )}
    >
      <ContainerInstrument className="flex items-center gap-2 truncate mr-2">
        <TextInstrument as="span" className="truncate font-light">{displayLabel}</TextInstrument>
        {isAi && (
          <TextInstrument as="span" className="text-[15px] bg-va-black/5 text-va-black/30 px-1.5 py-0.5 rounded-md font-light group-hover:bg-primary/20 group-hover:text-primary transition-colors">
            AI
          </TextInstrument>
        )}
      </ContainerInstrument>
      {selected && <Check strokeWidth={1.5} size={14} className="shrink-0" />}
    </ButtonInstrument>
  );
};
