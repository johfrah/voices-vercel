"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { DollarSign } from 'lucide-react';
import React from 'react';
import { BentoCard } from '../BentoGrid';

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
      icon={<DollarSign className="w-5 h-5" />}
      className="col-span-2 bg-slate-900 text-white"
    >
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <div className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">
            <VoiceglotText translationKey="order.financial.revenue" defaultText="Omzet" />
          </div>
          <div className="text-2xl font-bold">€{total}</div>
        </div>
        <div>
          <div className="text-slate-400 text-[10px] font-bold tracking-widest uppercase text-red-400">
            <VoiceglotText translationKey="order.financial.cost" defaultText="Inkoop (COG)" />
          </div>
          <div className="text-2xl font-bold text-red-400">€{totalCost}</div>
        </div>
        <div className="p-3 bg-white/10 rounded-xl border border-white/10">
          <div className="text-slate-400 text-[10px] font-bold tracking-widest uppercase text-emerald-400">
            <VoiceglotText translationKey="order.financial.margin" defaultText="Marge" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">€{totalProfit}</div>
        </div>
      </div>
    </BentoCard>
  );
};
