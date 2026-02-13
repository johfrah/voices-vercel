"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Globe, Users, Mic2 } from 'lucide-react';
import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';

/**
 * NATIVE-READY AGENCY FILTER SHEET
 * Volgens Master Voices Protocol 2026
 */
export const AgencyFilterSheet: React.FC<{ 
  filters: { languages: string[], genders: string[], styles: string[] },
  activeParams: Record<string, string>,
  onUpdate: (params: Record<string, string | undefined>) => void,
  isOpen: boolean,
  onClose: () => void
}> = ({ filters, activeParams, onUpdate, isOpen, onClose }) => {
  const { playClick } = useSonicDNA();

  const handleSelect = (key: string, value: string) => {
    playClick('light');
    const isSelected = activeParams[key] === value;
    onUpdate({ [key]: isSelected ? undefined : value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 bg-va-off-white rounded-t-[40px] z-50 shadow-2xl border-t border-white/20 max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Handle */}
            <div className="h-12 flex items-center justify-center flex-shrink-0">
              <div className="w-12 h-1.5 bg-black/10 rounded-full" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-32">
              <div className="space-y-10">
                <header className="flex justify-between items-end">
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter text-va-black">Filters</h2>
                    <p className="text-[15px] font-black tracking-widest text-va-black/30">Vind de perfecte stem</p>
                  </div>
                  <button 
                    onClick={() => onUpdate({ language: undefined, gender: undefined, style: undefined, search: undefined })}
                    className="text-[15px] font-black tracking-widest text-primary"
                  >
                    Wis alles
                  </button>
                </header>

                {/* Language Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-va-black/40">
                    <Globe strokeWidth={1.5} size={14} />
                    <h3 className="text-[15px] font-black tracking-widest">Taal</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filters.languages.map(lang => (
                      <FilterChip 
                        key={lang} 
                        label={lang} 
                        selected={activeParams.language === lang} 
                        onClick={() => handleSelect('language', lang)} 
                      />
                    ))}
                  </div>
                </section>

                {/* Gender Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-va-black/40">
                    <User strokeWidth={1.5}s size={14} />
                    <h3 className="text-[15px] font-black tracking-widest">Geslacht</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {filters.genders.map(gender => (
                      <FilterChip 
                        key={gender} 
                        label={gender} 
                        selected={activeParams.gender === gender} 
                        onClick={() => handleSelect('gender', gender)} 
                      />
                    ))}
                  </div>
                </section>

                {/* Style Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-va-black/40">
                    <Mic2 strokeWidth={1.5} size={14} />
                    <h3 className="text-[15px] font-black tracking-widest">Stijl</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {filters.styles.map(style => (
                      <FilterChip 
                        key={style} 
                        label={style} 
                        selected={activeParams.style?.toLowerCase() === style.toLowerCase()} 
                        onClick={() => handleSelect('style', style)} 
                      />
                    ))}
                  </div>
                </section>
              </div>
            </div>

            {/* Sticky Apply Button */}
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-va-off-white via-va-off-white to-transparent">
              <button 
                onClick={onClose}
                className="w-full py-6 bg-va-black text-white rounded-[24px] font-black tracking-widest text-[15px] shadow-aura active:scale-95 transition-all"
              >
                Toon Resultaten
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const FilterChip = ({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) => {
  const isAi = label.startsWith('ai:');
  const displayLabel = isAi ? label.replace('ai:', '') : label;

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-4 rounded-2xl text-[15px] font-black uppercase tracking-widest border-2 transition-all flex items-center justify-between group",
        selected 
          ? "bg-primary border-primary text-va-black shadow-lg" 
          : "bg-white border-black/5 text-va-black/40 hover:border-black/10"
      )}
    >
      <div className="flex items-center gap-2 truncate mr-2">
        <span className="truncate">{displayLabel}</span>
        {isAi && (
          <span className="text-[15px] bg-va-black/5 text-va-black/30 px-1.5 py-0.5 rounded-md font-bold group-hover:bg-primary/20 group-hover:text-primary transition-colors">
            AI
          </span>
        )}
      </div>
      {selected && <Check strokeWidth={1.5} size={14} className="shrink-0" />}
    </button>
  );
};
