"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { 
  ContainerInstrument, 
  TextInstrument,
  HeadingInstrument,
  SectionInstrument
} from '@/components/ui/LayoutInstruments';
import { Loader2, ChevronRight } from 'lucide-react';
import React from 'react';

interface WorkshopHeroProps {
  title: string;
  journey: string;
}

export const WorkshopHero: React.FC<WorkshopHeroProps   & { workshopId?: number }> = ({ title, journey, workshopId }) => {
  return (
    <SectionInstrument className="mb-12 md:mb-16">
      <ContainerInstrument className="inline-block bg-black text-white text-[15px] md:text-[15px] font-black px-3 md:px-4 py-1 md:py-1.5 rounded-full mb-6 md:mb-8 tracking-widest ">
        <VoiceglotText  translationKey={`journey.${journey}`} defaultText={journey} /> • <VoiceglotText  translationKey={workshopId ? `workshop.${workshopId}.title` : 'common.workshop'} defaultText={title} noTranslate={true} />
      </ContainerInstrument>
      <HeadingInstrument level={1} className="text-[12vw] md:text-[7vw] font-light tracking-tighter leading-[0.85] mb-6 md:mb-8 ">
        <VoiceglotText  translationKey={workshopId ? `workshop.${workshopId}.title` : 'common.workshop'} defaultText={title} noTranslate={true} />
      </HeadingInstrument>
    </SectionInstrument>
  );
};
