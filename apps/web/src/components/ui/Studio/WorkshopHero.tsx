"use client";

import { VoiceglotText } from '@/components/ui/VoiceglotText';
import React from 'react';

interface WorkshopHeroProps {
  title: string;
  journey: string;
}

export const WorkshopHero: React.FC<WorkshopHeroProps                 & { workshopId?: number }> = ({ title, journey, workshopId }) => {
  return (
    <section className="mb-16">
      <div className="inline-block bg-black text-white text-[15px] font-black px-4 py-1.5 rounded-full mb-8 tracking-widest ">
        <VoiceglotText  translationKey={`journey.${journey}`} defaultText={journey} />  <VoiceglotText  translationKey={workshopId ? `workshop.${workshopId}.title` : 'common.workshop'} defaultText={title} noTranslate={true} />
      </div>
      <h1 className="text-[10vw] md:text-[7vw] font-light tracking-tighter leading-[0.85] mb-8 ">
        <VoiceglotText  translationKey={workshopId ? `workshop.${workshopId}.title` : 'common.workshop'} defaultText={title} noTranslate={true} />
      </h1>
    </section>
  );
};
