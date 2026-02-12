"use client";

import { cn } from '@/lib/utils';
import { Actor, Demo } from '@/types';
import React, { useState } from 'react';
import { BentoGrid } from './BentoGrid';
import { MediaMaster } from './MediaMaster';
import { VoiceCard } from './VoiceCard';

interface VoiceGridProps {
  actors: Actor[];
  featured?: boolean;
}

export const VoiceGrid: React.FC<VoiceGridProps> = ({ actors, featured = false }) => {
  const [activeDemo, setActiveDemo] = useState<Demo | null>(null);

  const handleSelect = (actor: Actor) => {
    // 🛡️ NAVIGATION MANDATE: Als we op de agency pagina zijn, navigeren we direct naar de individuele voice pagina.
    // Dit stelt de klant in staat om direct een script in te voeren voor die specifieke stem.
    if (typeof window !== 'undefined') {
      const targetSlug = actor.slug || actor.first_name?.toLowerCase() || actor.display_name?.toLowerCase()?.split(' ')[0] || 'unknown';
      window.location.href = `/artist/${targetSlug}`;
    }
  };

  return (
    <>
      <div className={cn(
        "w-full",
        featured && "md:block flex overflow-x-auto pb-12 -mx-6 px-6 snap-x snap-mandatory no-scrollbar"
      )}>
        <div className={cn(
          featured ? "flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 min-w-max md:min-w-full" : ""
        )}>
          {actors.map((actor) => (
            <div key={actor.id} className={cn(featured && "w-[85vw] md:w-auto snap-center")}>
              <VoiceCard 
                voice={actor} 
                onSelect={handleSelect}
              />
            </div>
          ))}
        </div>
      </div>

      {activeDemo && (
        <MediaMaster 
          demo={activeDemo} 
          onClose={() => setActiveDemo(null)} 
        />
      )}
    </>
  );
};
