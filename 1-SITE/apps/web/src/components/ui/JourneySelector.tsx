"use client";

import React from 'react';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { useSonicDNA } from '@/lib/sonic-dna';
import { Phone, Video, Megaphone, Monitor, Radio, Globe, Mic2, Building2, BookOpen, Wind } from 'lucide-react';
import { VoiceglotText } from './VoiceglotText';
import { cn } from '@/lib/utils';

import { 
  ButtonInstrument, 
  ContainerInstrument, 
  TextInstrument 
} from './LayoutInstruments';

/**
 * JOURNEY SELECTOR INSTRUMENT
 * Focus: Direct Conversion & Live Pricing Context
 * Laat de gebruiker kiezen tussen Telefonie, Video of Advertentie.
 */
export function JourneySelector() {
  const { state, updateJourney } = useVoicesState();
  const { playClick } = useSonicDNA();

  const journeys = [
    { id: 'telephony', icon: Phone, label: 'Telefonie', key: 'journey.telephony' },
    { id: 'video', icon: Video, label: 'Video', key: 'journey.video' },
    { id: 'commercial', icon: Megaphone, label: 'Advertentie', key: 'journey.commercial' },
  ] as const;

  return (
    <ContainerInstrument className="flex justify-center mb-8 md:mb-12">
      <ContainerInstrument className="bg-white/80 backdrop-blur-2xl border border-black/5 p-1.5 md:p-2 rounded-[24px] md:rounded-[32px] shadow-aura flex gap-1.5 md:gap-2">
        {journeys.map((j) => {
          const isActive = state.current_journey === j.id;
          const Icon = j.icon;

          return (
            <ButtonInstrument
              key={j.id}
              onClick={() => {
                playClick('pro');
                updateJourney(j.id);
              }}
              className={cn(
                "flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-[18px] md:rounded-[24px] transition-all duration-500 group",
                isActive 
                  ? "bg-va-black text-white shadow-xl scale-105" 
                  : "hover:bg-va-off-white text-va-black/40 hover:text-va-black bg-transparent"
              )}
            >
              <Icon size={16} strokeWidth={1.5} className={cn("transition-transform duration-500", isActive && "scale-110")} />
              <TextInstrument as="span" className="text-[15px] md:text-[15px] font-black tracking-widest ">
                <VoiceglotText  translationKey={j.key} defaultText={j.label} />
              </TextInstrument>
              {isActive && (
                <ContainerInstrument className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-primary animate-pulse ml-0.5 md:ml-1" />
              )}
            </ButtonInstrument>
          );
        })}
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
