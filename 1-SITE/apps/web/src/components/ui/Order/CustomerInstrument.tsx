"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Users } from 'lucide-react';
import React from 'react';
import { BentoCard } from '../BentoGrid';

interface CustomerInstrumentProps {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  totalSpent: string | number;
}

export const CustomerInstrument: React.FC<CustomerInstrumentProps> = ({ 
  firstName, 
  lastName, 
  email, 
  company, 
  totalSpent 
}) => {
  return (
    <BentoCard 
      title={<VoiceglotText translationKey="order.customer.title" defaultText="Klant" />}
      icon={<Users className="w-5 h-5" />}
      className="col-span-2"
    >
      <div className="flex items-center gap-4 mt-4">
        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold">
          {firstName[0]}{lastName[0]}
        </div>
        <div>
          <div className="font-bold text-lg">{firstName} {lastName}</div>
          <div className="text-slate-500">{email}</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-slate-50 rounded-xl">
          <div className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">
            <VoiceglotText translationKey="order.customer.company" defaultText="Bedrijf" />
          </div>
          <div className="font-medium">{company || <VoiceglotText translationKey="common.private" defaultText="Privé" />}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
          <div className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">
            <VoiceglotText translationKey="order.customer.total_spent" defaultText="Total Spent" />
          </div>
          <div className="font-medium">€{totalSpent}</div>
        </div>
      </div>
    </BentoCard>
  );
};
