"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { cn } from '@/lib/utils';
import React from 'react';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from '@/components/ui/LayoutInstruments';

interface OrderHeaderProps {
  id: string;
  date: string;
  journey: string;
  status: string;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({ id, date, journey, status }) => {
  const isStudio = journey === 'studio';

  return (
    <ContainerInstrument className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
      <ContainerInstrument>
        <HeadingInstrument level={1} className="text-3xl md:text-4xl font-light tracking-tight text-va-black">
          <VoiceglotText  translationKey="order.header.title" defaultText="Order #" />{id}
        </HeadingInstrument>
        <TextInstrument className="text-va-black/40 mt-1 font-light text-[15px]">
          {date}
        </TextInstrument>
      </ContainerInstrument>
      <ContainerInstrument className="flex gap-2 md:gap-3">
        <ContainerInstrument className={cn(
          "px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[15px] md:text-[15px] font-light uppercase tracking-widest",
          isStudio ? "bg-primary/10 text-primary" : "bg-va-black/5 text-va-black/60"
        )}>
          <VoiceglotText  translationKey={`journey.${journey}`} defaultText={journey} />
        </ContainerInstrument>
        <ContainerInstrument className="px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-va-black text-white text-[15px] md:text-[15px] font-light tracking-widest">
          <VoiceglotText  translationKey={`order.status.${status}`} defaultText={status} />
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
