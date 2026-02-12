"use client";

import { Actor, Demo } from '@/types';
import React, { useState } from 'react';
import { BentoGrid } from './BentoGrid';
import { MediaMaster } from './MediaMaster';
import { VoiceCard } from './VoiceCard';

interface VoiceGridProps {
  actors: Actor[];
}

export const VoiceGrid: React.FC<VoiceGridProps> = ({ actors }) => {
  const [activeDemo, setActiveDemo] = useState<Demo | null>(null);

  const handleSelect = (actor: Actor) => {
    // 🛡️ NAVIGATION MANDATE: Als we op de agency pagina zijn, navigeren we direct naar de individuele voice pagina.
    // Dit stelt de klant in staat om direct een script in te voeren voor die specifieke stem.
    if (typeof window !== 'undefined') {
      const targetSlug = actor.slug || actor.first_name?.toLowerCase() || actor.display_name?.toLowerCase()?.split(' ')[0] || 'unknown';
      window.location.href = `/voice/${targetSlug}`;
    }
  };

  return (
    <>
      <BentoGrid>
        {actors.map((actor) => (
          <VoiceCard 
            key={actor.id} 
            voice={actor} 
            onSelect={handleSelect}
          />
        ))}
      </BentoGrid>

      {activeDemo && (
        <MediaMaster 
          demo={activeDemo} 
          onClose={() => setActiveDemo(null)} 
        />
      )}
    </>
  );
};
