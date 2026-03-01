"use client";

import React from 'react';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import { Phone, Video, Megaphone, Monitor, Radio, Globe, Mic2, Building2, BookOpen, Wind } from 'lucide-react';
import { VoiceglotText } from './VoiceglotText';
import { cn } from '@/lib/utils';

/**
 * JOURNEY SELECTOR INSTRUMENT
 * Focus: Direct Conversion & Live Pricing Context
 * Laat de gebruiker kiezen tussen Telefonie, Video of Advertentie.
 */
export function JourneySelector() {
  const { state, updateJourney } = useVoicesState();
  const { playClick } = useSonicDNA();

  const journeys = [
    { id: 'telephony', icon: Phone, label: 'Telefoon', key: 'journey.telephony' },
    { id: 'video', icon: Video, label: 'Voice-over', key: 'journey.video' },
    { id: 'commercial', icon: Megaphone, label: 'Commercial', key: 'journey.commercial' },
  ] as const;

  return (
    <div className="flex justify-center mb-12">
      <div className="bg-white/80 backdrop-blur-2xl border border-black/5 p-2 rounded-[32px] shadow-aura flex gap-2">
        {journeys.map((j) => {
          const isActive = state.current_journey === j.id;
          const Icon = j.icon;

          return (
            <button
              key={j.id}
              onClick={() => {
                playClick('pro');
                updateJourney(j.id);
              }}
              className={cn(
                "flex items-center gap-3 px-6 py-4 rounded-[24px] transition-all duration-500 group",
                isActive 
                  ? "bg-va-black text-white shadow-xl scale-105" 
                  : "hover:bg-va-off-white text-va-black/40 hover:text-va-black"
              )}
            >
              <Icon size={18} strokeWidth={1.5} className={cn("transition-transform duration-500", isActive && "scale-110")} />
              <span className="text-[15px] font-black tracking-widest">
                <VoiceglotText  translationKey={j.key} defaultText={j.label} />
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
