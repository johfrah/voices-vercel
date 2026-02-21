"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { Phone, Video, Megaphone, Search, ChevronDown, Filter, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ContainerInstrument, OptionInstrument, SelectInstrument, InputInstrument, ButtonInstrument, TextInstrument } from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';
import { VoiceglotImage } from './VoiceglotImage';
import { AgencyFilterSheet } from './AgencyFilterSheet';

interface SearchFilters {
  languages: string[];
  genders: string[];
  styles: string[];
  categories: string[];
}

interface FilterBarProps {
  filters: SearchFilters;
  params: Record<string, string>;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, params: combinedParams }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { state, updateJourney } = useVoicesState();
  const searchParams = useSearchParams();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const journeys = [
    { id: 'telephony', icon: Phone, label: 'Telefonie', key: 'journey.telephony' },
    { id: 'video', icon: Video, label: 'Video', key: 'journey.video' },
    { id: 'commercial', icon: Megaphone, label: 'Advertentie', key: 'journey.commercial' },
  ] as const;

  const updateQuery = (newParams: Record<string, string | undefined>) => {
    const paramsString = searchParams?.toString() || '';
    const nextParams = new URLSearchParams(paramsString);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) nextParams.set(key, value);
      else nextParams.delete(key);
    });
    router.push(`?${nextParams.toString()}`, { scroll: false });
  };

  //  MARKET-BASED LANGUAGE LOGIC
  const sortedLanguages = React.useMemo(() => {
    const market = combinedParams.market || 'BE';
    const primaryLang = market === 'BE' ? t('language.vlaams', 'Vlaams') : t('language.nederlands', 'Nederlands');
    const secondaryLang = market === 'BE' ? t('language.nederlands', 'Nederlands') : t('language.vlaams', 'Vlaams');
    
    const baseLangs = [...filters.languages];
    const filteredLangs = baseLangs.filter(l => l !== primaryLang && l !== secondaryLang);
    filteredLangs.sort((a, b) => a.localeCompare(b));
    
    const result = [];
    if (baseLangs.includes(primaryLang)) result.push(primaryLang);
    if (baseLangs.includes(secondaryLang)) result.push(secondaryLang);
    
    return [...result, ...filteredLangs];
  }, [filters.languages, combinedParams.market]);

  return (
    <ContainerInstrument className="w-full max-w-5xl mx-auto">
      <ContainerInstrument className="bg-white/80 backdrop-blur-2xl border border-black/5 rounded-[32px] p-2 shadow-aura flex flex-col gap-2">
        
        {/* Top Row: Journey Selector */}
        <ContainerInstrument plain className="flex items-center justify-center p-1 bg-va-off-white/50 rounded-[26px]">
          {journeys.map((j) => {
            const isActive = state.current_journey === j.id;
            const Icon = j.icon;

            return (
              <button
                key={j.id}
                onClick={() => updateJourney(j.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-[22px] transition-all duration-500",
                  isActive 
                    ? "bg-va-black text-white shadow-lg scale-[1.02]" 
                    : "text-va-black/40 hover:text-va-black hover:bg-white/50"
                )}
              >
                <Icon size={16} strokeWidth={1.5} />
                <span className="text-[13px] font-bold tracking-widest uppercase">
                  <VoiceglotText translationKey={j.key} defaultText={j.label} />
                </span>
              </button>
            );
          })}
        </ContainerInstrument>

        {/* Bottom Row: Search & Filters */}
        <ContainerInstrument plain className="flex flex-col md:flex-row items-center gap-2 p-1">
          {/* Search */}
          <ContainerInstrument plain className="flex-1 w-full relative group">
            <Search size={18} strokeWidth={1.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" />
            <InputInstrument 
              type="text" 
              placeholder={t('agency.filter.search_placeholder', 'Zoek op naam, stijl of kenmerk...')}
              className="w-full bg-white border-none rounded-[22px] py-4 pl-14 pr-6 text-[15px] font-light focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-va-black/20 shadow-sm"
              defaultValue={combinedParams.search}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateQuery({ search: (e.target as HTMLInputElement).value });
                }
              }}
            />
          </ContainerInstrument>

          {/* Language */}
          <ContainerInstrument plain className="w-full md:w-48 relative group/select">
            <ContainerInstrument className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <VoiceglotImage  
                src="/assets/common/branding/icons/INFO.svg" 
                alt="" 
                width={14} 
                height={14} 
                style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }}
              />
            </ContainerInstrument>
            <SelectInstrument 
              className="w-full bg-white border-none rounded-[22px] py-4 pl-12 pr-10 text-[14px] font-light tracking-widest focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer appearance-none shadow-sm"
              value={combinedParams.language || ''}
              onChange={(e) => { updateQuery({ language: e.target.value || undefined }); }}
            >
              <option value="">{t('agency.filter.all_languages', 'Talen')}</option>
              {sortedLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </SelectInstrument>
            <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover/select:opacity-100 transition-opacity" />
          </ContainerInstrument>

          {/* Gender */}
          <ContainerInstrument plain className="hidden md:block w-40 relative group/select">
            <ContainerInstrument className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <VoiceglotImage  
                src="/assets/common/branding/icons/INFO.svg" 
                alt="" 
                width={14} 
                height={14} 
                style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }}
              />
            </ContainerInstrument>
            <SelectInstrument 
              className="w-full bg-white border-none rounded-[22px] py-4 pl-12 pr-10 text-[14px] font-light tracking-widest focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer appearance-none shadow-sm"
              value={combinedParams.gender || ''}
              onChange={(e) => { updateQuery({ gender: e.target.value || undefined }); }}
            >
              <option value="">{t('agency.filter.gender', 'Geslacht')}</option>
              {filters.genders.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </SelectInstrument>
            <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover/select:opacity-100 transition-opacity" />
          </ContainerInstrument>

          {/* Advanced / Menu */}
          <ButtonInstrument 
            onClick={() => { setIsSheetOpen(true); }}
            className="w-14 h-14 rounded-[22px] bg-va-black text-white flex items-center justify-center hover:bg-primary transition-all duration-500 shadow-lg active:scale-95 shrink-0"
          >
            <Filter size={20} strokeWidth={1.5} />
          </ButtonInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      {/* Active Filters Chips */}
      {(combinedParams.search || combinedParams.gender || combinedParams.style || combinedParams.language) && (
        <ContainerInstrument className="flex flex-wrap gap-2 px-4 mt-4">
          {combinedParams.search && (
            <Chip label={`${t('common.search', 'Zoek')}: ${combinedParams.search}`} onRemove={() => { updateQuery({ search: undefined }); }} />
          )}
          {combinedParams.language && (
            <Chip label={`${t('common.language', 'Taal')}: ${combinedParams.language}`} onRemove={() => { updateQuery({ language: undefined }); }} />
          )}
          {combinedParams.gender && (
            <Chip label={`${t('common.gender', 'Geslacht')}: ${combinedParams.gender}`} onRemove={() => { updateQuery({ gender: undefined }); }} />
          )}
          {combinedParams.style && (
            <Chip label={`${t('common.style', 'Stijl')}: ${combinedParams.style}`} onRemove={() => { updateQuery({ style: undefined }); }} />
          )}
          <ButtonInstrument 
            onClick={() => { updateQuery({ search: undefined, gender: undefined, style: undefined, language: undefined }); }}
            className="text-[13px] font-bold tracking-widest text-va-black/40 hover:text-primary transition-colors ml-2 uppercase"
          >
            <VoiceglotText  translationKey="agency.filter.clear_all" defaultText="Wis alles" />
          </ButtonInstrument>
        </ContainerInstrument>
      )}

      {/* De Filter Sheet (Mobile & Advanced) */}
      <AgencyFilterSheet 
        filters={filters} 
        activeParams={combinedParams} 
        onUpdate={updateQuery}
        isOpen={isSheetOpen}
        onClose={() => { setIsSheetOpen(false); }}
      />
    </ContainerInstrument>
  );
};

const Chip = ({ label, onRemove }: { label: string, onRemove: () => void }) => {
  const { t } = useTranslation();
  return (
    <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-[20px] text-[15px] font-light tracking-widest shadow-sm">
      <TextInstrument>{label}</TextInstrument>
      <ButtonInstrument onClick={() => { onRemove(); }} className="hover:text-primary transition-colors">
        <Image  src="/assets/common/branding/icons/BACK.svg" width={12} height={12} alt={t('action.remove', "Remove")} style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} />
      </ButtonInstrument>
    </ContainerInstrument>
  );
};
