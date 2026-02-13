"use client";

import Image from 'next/image';
import React, { useState } from 'react';
import { SearchFilters } from '@/types';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { AgencyFilterSheet } from './AgencyFilterSheet';
import { 
  ButtonInstrument, 
  ContainerInstrument, 
  InputInstrument, 
  OptionInstrument, 
  SelectInstrument, 
  TextInstrument 
} from './LayoutInstruments';
import { VoiceglotImage } from './VoiceglotImage';
import { VoiceglotText } from './VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';
import { Search, ChevronDown, X } from 'lucide-react';

interface FilterBarProps {
  filters: SearchFilters;
  params: Record<string, string>;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, params: combinedParams }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const updateQuery = (newParams: Record<string, string | undefined>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) nextParams.set(key, value);
      else nextParams.delete(key);
    });
    router.push(`?${nextParams.toString()}`, { scroll: false });
  };

  // 🌍 MARKET-BASED LANGUAGE LOGIC
  const sortedLanguages = React.useMemo(() => {
    const market = combinedParams.market || 'BE';
    const primaryLang = market === 'BE' ? 'Vlaams' : 'Nederlands';
    const secondaryLang = market === 'BE' ? 'Nederlands' : 'Vlaams';
    
    const baseLangs = [...filters.languages];
    const filteredLangs = baseLangs.filter(l => l !== primaryLang && l !== secondaryLang);
    filteredLangs.sort((a, b) => a.localeCompare(b));
    
    const result = [];
    if (baseLangs.includes(primaryLang)) result.push(primaryLang);
    if (baseLangs.includes(secondaryLang)) result.push(secondaryLang);
    
    return [...result, ...filteredLangs];
  }, [filters.languages, combinedParams.market]);

  return (
    <ContainerInstrument className="space-y-6">
      <ContainerInstrument className="bg-white/80 backdrop-blur-2xl border border-black/5 rounded-[20px] p-4 md:p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] flex flex-col lg:flex-row items-center gap-4 group/search">
        <ContainerInstrument className="flex-1 w-full relative group">
          <ContainerInstrument className="absolute left-6 top-1/2 -translate-y-1/2">
            <VoiceglotImage  
              src="/assets/common/branding/icons/SEARCH.svg" 
              alt="Search" 
              width={20} 
              height={20} 
              className="opacity-20 group-focus-within:opacity-100 transition-opacity"
              style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
            />
          </ContainerInstrument>
          <InputInstrument 
            type="text" 
            placeholder={t('agency.filter.search_placeholder', 'Zoek op naam, stijl of kenmerk...')}
            className="w-full bg-va-off-white border-none rounded-[10px] py-5 pl-16 pr-6 text-[15px] font-light focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-va-black/20"
            defaultValue={combinedParams.search}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateQuery({ search: (e.target as HTMLInputElement).value });
              }
            }}
          />
        </ContainerInstrument>
        
        <ContainerInstrument className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <ContainerInstrument className="flex-1 lg:w-56 relative group/select">
            <SelectInstrument 
              className="w-full bg-va-off-white border-none rounded-[10px] py-5 px-8 text-[15px] font-light tracking-widest focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
              value={combinedParams.language || ''}
              onChange={(e) => { updateQuery({ language: e.target.value || undefined }); }}
            >
              <OptionInstrument value=""><VoiceglotText  translationKey="agency.filter.all_languages" defaultText="Alle talen" /></OptionInstrument>
              {sortedLanguages.map(lang => (
                <OptionInstrument key={lang} value={lang}>{lang}</OptionInstrument>
              ))}
            </SelectInstrument>
            <ContainerInstrument className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover/select:opacity-100 transition-opacity">
              <VoiceglotImage  
                src="/assets/common/branding/icons/DOWN.svg" 
                alt="Select" 
                width={14} 
                height={14} 
                style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
              />
            </ContainerInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="hidden md:block lg:w-44 relative group/select">
            <SelectInstrument 
              className="w-full bg-va-off-white border-none rounded-[10px] py-5 px-8 text-[15px] font-light tracking-widest focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
              value={combinedParams.gender || ''}
              onChange={(e) => { updateQuery({ gender: e.target.value || undefined }); }}
            >
              <OptionInstrument value=""><VoiceglotText  translationKey="agency.filter.gender" defaultText="Geslacht" /></OptionInstrument>
              {filters.genders.map(g => (
                <OptionInstrument key={g} value={g}>{g}</OptionInstrument>
              ))}
            </SelectInstrument>
            <ContainerInstrument className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover/select:opacity-100 transition-opacity">
              <VoiceglotImage  
                src="/assets/common/branding/icons/DOWN.svg" 
                alt="Select" 
                width={14} 
                height={14} 
                style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }}
              />
            </ContainerInstrument>
          </ContainerInstrument>

          <ButtonInstrument 
            onClick={() => { setIsSheetOpen(true); }}
            className="w-16 h-16 rounded-[10px] bg-va-black text-white flex items-center justify-center hover:bg-primary transition-all duration-500 shadow-lg active:scale-95"
          >
            <VoiceglotImage  src="/assets/common/branding/icons/MENU.svg" width={20} height={20} alt="Filter" className="brightness-0 invert" />
          </ButtonInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      {/* Active Filters Chips */}
      {(combinedParams.search || combinedParams.gender || combinedParams.style || combinedParams.language) && (
        <ContainerInstrument className="flex flex-wrap gap-2 px-4">
          {combinedParams.search && (
            <Chip strokeWidth={1.5} label={`${t('common.search', 'Zoek')}: ${combinedParams.search}`} onRemove={() => { updateQuery({ search: undefined }); }} />
          )}
          {combinedParams.language && (
            <Chip strokeWidth={1.5} label={`${t('common.language', 'Taal')}: ${combinedParams.language}`} onRemove={() => { updateQuery({ language: undefined }); }} />
          )}
          {combinedParams.gender && (
            <Chip strokeWidth={1.5} label={`${t('common.gender', 'Geslacht')}: ${combinedParams.gender}`} onRemove={() => { updateQuery({ gender: undefined }); }} />
          )}
          {combinedParams.style && (
            <Chip strokeWidth={1.5} label={`${t('common.style', 'Stijl')}: ${combinedParams.style}`} onRemove={() => { updateQuery({ style: undefined }); }} />
          )}
          <ButtonInstrument 
            onClick={() => { updateQuery({ search: undefined, gender: undefined, style: undefined, language: undefined }); }}
            className="text-[15px] font-light tracking-widest text-va-black/40 hover:text-primary transition-colors ml-2"
          >
            <VoiceglotText  translationKey="agency.filter.clear_all" defaultText="Wis alles" />
          </ButtonInstrument>
        </ContainerInstrument>
      )}

      {/* De Filter Sheet (Mobile & Advanced) */}
      <AgencyFilterSheet strokeWidth={1.5} 
        filters={filters} 
        activeParams={combinedParams} 
        onUpdate={updateQuery}
        isOpen={isSheetOpen}
        onClose={() => { setIsSheetOpen(false); }}
      />
    </ContainerInstrument>
  );
};

const Chip = ({ label, onRemove }: { label: string, onRemove: () => void }) => (
  <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-[20px] text-[15px] font-light tracking-widest shadow-sm">
    <TextInstrument>{label}</TextInstrument>
    <ButtonInstrument onClick={() => { onRemove(); }} className="hover:text-primary transition-colors">
      <Image  src="/assets/common/branding/icons/BACK.svg" width={12} height={12} alt="Remove" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)', opacity: 0.4 }} />
    </ButtonInstrument>
  </ContainerInstrument>
);
