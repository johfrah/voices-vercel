"use client";

import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { cn } from '@/lib/utils';
import { Actor } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
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
        <motion.div 
          layout
          className={cn(
            featured ? "flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 min-w-max md:min-w-full items-stretch" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch"
          )}
        >
          <AnimatePresence mode="popLayout">
            {actors.filter(Boolean).map((actor) => (
              <motion.div 
                key={actor.id}
                layoutId={`actor-${actor.id}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  mass: 1,
                  opacity: { duration: 0.2 }
                }}
                className={cn("flex", featured && "w-[85vw] md:w-auto snap-center")}
              >
                <VoiceCard 
                  voice={actor} 
                  onSelect={onSelect ? () => handleSelect(actor) : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};
