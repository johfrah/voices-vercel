"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import {
    Briefcase,
    Car,
    HardHat,
    Laptop,
    Scale,
    ShoppingCart,
    Stethoscope,
    Utensils
} from 'lucide-react';
import React from 'react';

const SECTORS = [
  { id: 'gezondheidszorg', label: 'Gezondheidszorg', icon: Stethoscope },
  { id: 'bouw', label: 'Bouw & Vastgoed', icon: HardHat },
  { id: 'it', label: 'IT & Software', icon: Laptop },
  { id: 'zakelijk', label: 'Zakelijke Dienstverlening', icon: Briefcase },
  { id: 'horeca', label: 'Horeca', icon: Utensils },
  { id: 'retail', label: 'Retail & E-commerce', icon: ShoppingCart },
  { id: 'automotive', label: 'Automotive', icon: Car },
  { id: 'juridisch', label: 'Juridische Diensten', icon: Scale },
];

export const SectorSelector: React.FC = () => {
  const { state, updateSector } = useVoicesState();
  const { playClick } = useSonicDNA();

  const handleSectorClick = (sectorId: string) => {
    playClick('light');
    updateSector(state.current_sector === sectorId ? null : sectorId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <h4 className="text-[15px] font-black tracking-[0.2em] text-va-black/30 Raleway">
          <VoiceglotText translationKey="auto.sectorselector.personaliseer_voor_u.6fc989" defaultText="Personaliseer voor uw sector" />
        </h4>
        {state.current_sector && (
          <button 
            onClick={() => updateSector(null)}
            className="text-[15px] font-black tracking-widest text-primary hover:opacity-70 transition-opacity"
          >
            <VoiceglotText translationKey="auto.sectorselector.wis_filter____.76f73a" defaultText="Wis filter" />
          </button>
        )}
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
        {SECTORS.map((sector) => {
          const Icon = sector.icon;
          const isActive = state.current_sector === sector.id;
          
          return (
            <button
              key={sector.id}
              onClick={() => handleSectorClick(sector.id)}
              className={`
                flex flex-col items-center gap-4 p-6 rounded-[32px] min-w-[140px] transition-all duration-500
                ${isActive 
                  ? 'bg-va-black text-white shadow-xl scale-105' 
                  : 'bg-white border border-black/5 hover:border-primary/20 hover:bg-primary/5 text-va-black/60 shadow-sm'
                }
              `}
            >
              <div className={`
                w-12 h-12 rounded-2xl flex items-center justify-center transition-colors
                ${isActive ? 'bg-primary text-white' : 'bg-va-off-white text-va-black/40'}
              `}>
                <Icon size={24} />
              </div>
              <span className="text-[15px] font-black tracking-widest text-center leading-tight">
                {sector.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
