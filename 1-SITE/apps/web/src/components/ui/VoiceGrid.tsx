"use client";

import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { cn } from '@/lib/utils';
import { Actor } from '@/types';
import React from 'react';
import { VoiceCard } from './VoiceCard';

interface VoiceGridProps {
  actors: Actor[];
  featured?: boolean;
  onSelect?: (actor: Actor) => void;
}

export const VoiceGrid: React.FC<VoiceGridProps> = ({ actors, featured = false, onSelect }) => {
  const { playDemo } = useGlobalAudio();
  
  console.log(` VoiceGrid: rendering ${actors?.length || 0} actors`, { featured, actors: actors?.map(a => a.display_name) });

  const handleSelect = (actor: Actor) => {
    console.log(`[VoiceGrid] handleSelect for: ${actor.display_name}`, { hasOnSelect: !!onSelect });
    
    // CHRIS-PROTOCOL: In SPA mode, we NEVER navigate.
    if (onSelect) {
      onSelect(actor);
      return;
    }
    
    //  NAVIGATION MANDATE: Fallback for non-SPA contexts
    if (typeof window !== 'undefined') {
      const targetSlug = actor.slug || actor.first_name?.toLowerCase() || actor.display_name?.toLowerCase()?.split(' ')[0] || 'unknown';
      window.location.href = `/voice/${targetSlug}`;
    }
  };

  return (
    <>
      <div className={cn(
        "w-full",
        featured && "md:block flex overflow-x-auto pb-12 -mx-6 px-6 snap-x snap-mandatory no-scrollbar"
      )}>
        <div className={cn(
          featured ? "flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 min-w-max md:min-w-full" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        )}>
          {actors.map((actor) => (
            <div key={actor.id} className={cn(featured && "w-[85vw] md:w-auto snap-center")}>
              <VoiceCard 
                voice={actor} 
                onSelect={onSelect ? () => handleSelect(actor) : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
