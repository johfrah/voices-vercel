"use client";

import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { SearchFilters } from '@/types';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { AgencyFilterSheet } from './AgencyFilterSheet';
import { VoiceglotText } from './VoiceglotText';
import { useTranslation } from '@/contexts/TranslationContext';

interface FilterBarProps {
  filters: SearchFilters;
  params: Record<string, string>;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, params: combinedParams }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Helper to generate clean URL
  const generateCleanUrl = (newParams: Record<string, string | undefined>) => {
    // Start with current params but allow overrides
    const finalParams = { ...combinedParams, ...newParams };
    
    const segments: string[] = ['agency', 'voice-overs'];
    
    // Add language if present
    if (finalParams.language) {
      segments.push(finalParams.language.toLowerCase());
    }
    
    // Add gender if present
    if (finalParams.gender) {
      const genderSlug = finalParams.gender.toLowerCase().includes('man') ? 'man' : 'vrouw';
      segments.push(genderSlug);
    }
    
    // Add style if present
    if (finalParams.style) {
      segments.push(finalParams.style.toLowerCase());
    }

    // Handle search as query param
    const query = new URLSearchParams();
    if (finalParams.search) {
      query.set('search', finalParams.search);
    }

    const queryString = query.toString();
    return `/${segments.join('/')}${queryString ? `?${queryString}` : ''}`;
  };

  const updateQuery = (newParams: Record<string, string | undefined>) => {
    const targetUrl = generateCleanUrl(newParams);
    router.push(targetUrl);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-2xl border border-black/5 rounded-[40px] p-4 md:p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] flex flex-col lg:flex-row items-center gap-4 group/search">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-va-black/20 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={t('agency.filter.search_placeholder', 'Zoek op naam, stijl of kenmerk...')}
            className="w-full bg-va-off-white border-none rounded-[24px] py-5 pl-16 pr-6 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-va-black/20"
            defaultValue={combinedParams.search}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateQuery({ search: (e.target as HTMLInputElement).value });
              }
            }}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select 
            className="flex-1 lg:w-40 bg-va-off-white border-none rounded-[24px] py-5 px-6 text-[15px] font-black tracking-widest focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            value={combinedParams.language || ''}
            onChange={(e) => updateQuery({ language: e.target.value || undefined })}
          >
            <option value=""><VoiceglotText translationKey="agency.filter.all_languages" defaultText="Alle Talen" /></option>
            {filters.languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          <select 
            className="hidden md:block lg:w-40 bg-va-off-white border-none rounded-[24px] py-5 px-6 text-[15px] font-black tracking-widest focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            value={combinedParams.gender || ''}
            onChange={(e) => updateQuery({ gender: e.target.value || undefined })}
          >
            <option value=""><VoiceglotText translationKey="agency.filter.gender" defaultText="Geslacht" /></option>
            {filters.genders.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <button 
            onClick={() => setIsSheetOpen(true)}
            className="w-16 h-16 rounded-[24px] bg-va-black text-white flex items-center justify-center hover:bg-primary transition-all duration-500 shadow-lg active:scale-95"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Active Filters Chips */}
      {(combinedParams.search || combinedParams.gender || combinedParams.style || combinedParams.language) && (
        <div className="flex flex-wrap gap-2 px-4">
          {combinedParams.search && (
            <Chip label={`${t('common.search', 'Zoek')}: ${combinedParams.search}`} onRemove={() => updateQuery({ search: undefined })} />
          )}
          {combinedParams.language && (
            <Chip label={`${t('common.language', 'Taal')}: ${combinedParams.language}`} onRemove={() => updateQuery({ language: undefined })} />
          )}
          {combinedParams.gender && (
            <Chip label={`${t('common.gender', 'Geslacht')}: ${combinedParams.gender}`} onRemove={() => updateQuery({ gender: undefined })} />
          )}
          {combinedParams.style && (
            <Chip label={`${t('common.style', 'Stijl')}: ${combinedParams.style}`} onRemove={() => updateQuery({ style: undefined })} />
          )}
          <button 
            onClick={() => updateQuery({ search: undefined, gender: undefined, style: undefined, language: undefined })}
            className="text-[15px] font-black tracking-widest text-va-black/40 hover:text-primary transition-colors ml-2"
          >
            <VoiceglotText translationKey="agency.filter.clear_all" defaultText="Wis alles" />
          </button>
        </div>
      )}

      {/* De Filter Sheet (Mobile & Advanced) */}
      <AgencyFilterSheet 
        filters={filters} 
        activeParams={combinedParams} 
        onUpdate={updateQuery}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
};

const Chip = ({ label, onRemove }: { label: string, onRemove: () => void }) => (
  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-full text-[15px] font-black tracking-widest shadow-sm">
    {label}
    <button onClick={onRemove} className="hover:text-primary transition-colors">
      <X size={12} />
    </button>
  </div>
);
