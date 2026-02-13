"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Users } from 'lucide-react';
import React from 'react';
import { BentoCard } from '../BentoGrid';
import { 
  ContainerInstrument, 
  TextInstrument 
} from '@/components/ui/LayoutInstruments';

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
      icon={<Users className="w-5 h-5" strokeWidth={1.5} />}
      className="col-span-2"
    >
      <ContainerInstrument className="flex items-center gap-4 mt-4">
        <ContainerInstrument className="w-12 h-12 rounded-full bg-va-off-white flex items-center justify-center text-xl font-light">
          <TextInstrument>{firstName[0]}{lastName[0]}</TextInstrument>
        </ContainerInstrument>
        <ContainerInstrument>
          <TextInstrument className="font-light text-lg">{firstName} {lastName}</TextInstrument>
          <TextInstrument className="text-va-black/40 font-light">{email}</TextInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
      <ContainerInstrument className="mt-4 grid grid-cols-2 gap-4 text-[15px]">
        <ContainerInstrument className="p-3 bg-va-off-white rounded-[20px]">
          <TextInstrument className="text-va-black/20 text-[15px] font-light tracking-widest ">
            <VoiceglotText  translationKey="order.customer.company" defaultText="Bedrijf" />
          </TextInstrument>
          <TextInstrument className="font-light">
            {company || <VoiceglotText  translationKey="common.private" defaultText="Privé" />}
          </TextInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="p-3 bg-va-off-white rounded-[20px]">
          <TextInstrument className="text-va-black/20 text-[15px] font-light tracking-widest ">
            <VoiceglotText  translationKey="order.customer.total_spent" defaultText="Total Spent" />
          </TextInstrument>
          <TextInstrument className="font-light">€{totalSpent}</TextInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    </BentoCard>
  );
};
