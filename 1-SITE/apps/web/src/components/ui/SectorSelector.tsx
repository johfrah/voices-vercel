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
import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from './LayoutInstruments';

const SECTORS = [
  { id: 'gezondheidszorg', label: 'Gezondheidszorg', icon: Stethoscope, key: 'sector.healthcare' },
  { id: 'bouw', label: 'Bouw & Vastgoed', icon: HardHat, key: 'sector.construction' },
  { id: 'it', label: 'IT & Software', icon: Laptop, key: 'sector.it' },
  { id: 'zakelijk', label: 'Zakelijke Dienstverlening', icon: Briefcase, key: 'sector.business' },
  { id: 'horeca', label: 'Horeca', icon: Utensils, key: 'sector.hospitality' },
  { id: 'retail', label: 'Retail & E-commerce', icon: ShoppingCart, key: 'sector.retail' },
  { id: 'automotive', label: 'Automotive', icon: Car, key: 'sector.automotive' },
  { id: 'juridisch', label: 'Juridische Diensten', icon: Scale, key: 'sector.legal' },
];

export const SectorSelector: React.FC = () => {
  const { state, updateSector } = useVoicesState();
  const { playClick } = useSonicDNA();

  const handleSectorClick = (sectorId: string) => {
    playClick('light');
    updateSector(state.current_sector === sectorId ? null : sectorId);
  };

  return (
    <ContainerInstrument className="space-y-4 md:space-y-6">
      <ContainerInstrument className="flex items-center justify-between px-4">
        <HeadingInstrument level={4} className="text-[15px] md:text-[15px] font-light tracking-[0.2em] text-va-black/30 Raleway">
          <VoiceglotText  translationKey="auto.sectorselector.personaliseer_voor_u.6fc989" defaultText="Personaliseer voor uw sector" />
        </HeadingInstrument>
        {state.current_sector && (
          <ButtonInstrument 
            onClick={() => updateSector(null)}
            className="text-[15px] md:text-[15px] font-black tracking-widest text-primary hover:opacity-70 transition-opacity p-0 bg-transparent"
          >
            <VoiceglotText  translationKey="auto.sectorselector.wis_filter____.76f73a" defaultText="Wis filter" />
          </ButtonInstrument>
        )}
      </ContainerInstrument>
      
      <ContainerInstrument className="flex gap-2 md:gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 md:-mx-6 px-4 md:px-6">
        {SECTORS.map((sector) => {
          const Icon = sector.icon;
          const isActive = state.current_sector === sector.id;
          
          return (
            <ButtonInstrument
              key={sector.id}
              onClick={() => handleSectorClick(sector.id)}
              className={`
                flex flex-col items-center gap-3 md:gap-4 p-4 md:p-6 rounded-[32px] min-w-[120px] md:min-w-[140px] transition-all duration-500
                ${isActive 
                  ? 'bg-va-black text-white shadow-xl scale-105' 
                  : 'bg-white border border-black/5 hover:border-primary/20 hover:bg-primary/5 text-va-black/60 shadow-sm'
                }
              `}
            >
              <ContainerInstrument className={`
                w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-colors
                ${isActive ? 'bg-primary text-white' : 'bg-va-off-white text-va-black/40'}
              `}>
                <Icon strokeWidth={1.5} size={24} />
              </ContainerInstrument>
              <TextInstrument className="text-[15px] md:text-[15px] font-black tracking-widest text-center leading-tight">
                <VoiceglotText translationKey={sector.key} defaultText={sector.label} />
              </TextInstrument>
            </ButtonInstrument>
          );
        })}
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
