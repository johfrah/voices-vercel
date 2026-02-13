"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { FileCheck } from 'lucide-react';
import React from 'react';
import { BentoCard } from '../BentoGrid';
import { 
  ContainerInstrument, 
  TextInstrument,
  ButtonInstrument
} from '@/components/ui/LayoutInstruments';

interface BriefingInstrumentProps {
  script: string;
}

export const BriefingInstrument: React.FC<BriefingInstrumentProps> = ({ script }) => {
  return (
    <BentoCard 
      title={<VoiceglotText translationKey="order.briefing.title" defaultText="Briefing" />}
      icon={<FileCheck className="w-5 h-5" strokeWidth={1.5} />}
      className="col-span-1"
    >
      <ContainerInstrument className="mt-4 p-4 md:p-6 bg-va-off-white rounded-[20px] text-[15px] italic text-va-black/60 border border-dashed border-va-black/10">
        <TextInstrument>
          &quot;{script || <VoiceglotText  translationKey="order.briefing.empty" defaultText="Geen script gevonden..." />}&quot;
        </TextInstrument>
      </ContainerInstrument>
      <ButtonInstrument className="w-full mt-4 py-3 md:py-4 bg-va-black text-white rounded-[10px] font-medium text-[15px] hover:bg-va-black/90 transition-colors">
        <VoiceglotText  translationKey="order.briefing.action" defaultText="Open Full Script" />
      </ButtonInstrument>
    </BentoCard>
  );
};
