"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { DollarSign } from 'lucide-react';
import React from 'react';
import { BentoCard } from '../BentoGrid';
import { 
  ContainerInstrument, 
  TextInstrument 
} from '@/components/ui/LayoutInstruments';

interface FinancialInstrumentProps {
  total: string | number;
  totalCost: string | number;
  totalProfit: string | number;
}

export const FinancialInstrument: React.FC<FinancialInstrumentProps> = ({ 
  total, 
  totalCost, 
  totalProfit 
}) => {
  return (
    <BentoCard 
      title={<VoiceglotText translationKey="order.financial.title" defaultText="Profit Engine" />}
      icon={<DollarSign className="w-5 h-5" strokeWidth={1.5} />}
      className="col-span-2 bg-va-black text-white"
    >
      <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <ContainerInstrument>
          <TextInstrument className="text-white/40 text-[15px] md:text-[15px] font-light tracking-widest ">
            <VoiceglotText  translationKey="order.financial.revenue" defaultText="Omzet" />
          </TextInstrument>
          <TextInstrument className="text-xl md:text-2xl font-light">€{total}</TextInstrument>
        </ContainerInstrument>
        <ContainerInstrument>
          <TextInstrument className="text-white/40 text-[15px] md:text-[15px] font-light tracking-widest ">
            <VoiceglotText  translationKey="order.financial.cost" defaultText="Inkoop (COG)" />
          </TextInstrument>
          <TextInstrument className="text-xl md:text-2xl font-light text-red-400">€{totalCost}</TextInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="p-3 md:p-4 bg-white/5 rounded-[10px] border border-white/10">
          <TextInstrument className="text-white/40 text-[15px] md:text-[15px] font-light tracking-widest ">
            <VoiceglotText  translationKey="order.financial.margin" defaultText="Marge" />
          </TextInstrument>
          <TextInstrument className="text-xl md:text-2xl font-light text-primary">€{totalProfit}</TextInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </BentoCard>
  );
};
