"use client";

import { cn } from '@/lib/utils';
import { Actor, Demo } from '@/types';
import React, { useState } from 'react';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { VoiceCard } from './VoiceCard';
import { ContainerInstrument } from './LayoutInstruments';

interface VoiceGridProps {
  actors: Actor[];
  featured?: boolean;
}

export const VoiceGrid: React.FC<VoiceGridProps> = ({ actors, featured = false }) => {
  const { playDemo } = useGlobalAudio();

  const handleSelect = (actor: Actor) => {
    // 🛡️ NAVIGATION MANDATE: Als we op de agency pagina zijn, navigeren we direct naar de individuele voice pagina.
    // Dit stelt de klant in staat om direct een script in te voeren voor die specifieke stem.
    if (typeof window !== 'undefined') {
      const targetSlug = actor.slug || actor.first_name?.toLowerCase() || actor.display_name?.toLowerCase()?.split(' ')[0] || 'unknown';
      window.location.href = `/artist/${targetSlug}`;
    }
  };

  return (
    <ContainerInstrument className={cn(
      "w-full",
      featured && "md:block flex overflow-x-auto pb-8 md:pb-12 -mx-4 md:-mx-6 px-4 md:px-6 snap-x snap-mandatory no-scrollbar"
    )}>
      <ContainerInstrument className={cn(
        featured ? "flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 min-w-max md:min-w-full" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      )}>
        {actors.map((actor) => (
          <ContainerInstrument key={actor.id} className={cn(featured && "w-[80vw] md:w-auto snap-center")}>
            <VoiceCard 
              voice={actor} 
              onSelect={() => {
                // We gebruiken de eerste demo van de actor als default voor de grid
                if (actor.demos && actor.demos.length > 0) {
                  playDemo(actor.demos[0]);
                } else {
                  handleSelect(actor);
                }
              }}
            />
          </ContainerInstrument>
        ))}
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
