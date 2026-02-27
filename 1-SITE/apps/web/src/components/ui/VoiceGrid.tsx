"use client";

import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { cn } from '@/lib/utils';
import { Actor } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { VoiceCard } from "./VoiceCard";
import { NuclearErrorBoundary } from "./NuclearErrorBoundary";

interface VoiceGridProps {
  actors: Actor[];
  featured?: boolean;
  onSelect?: (actor: Actor) => void;
}

export const VoiceGrid: React.FC<VoiceGridProps> = ({ actors, featured = false, onSelect }) => {
  const { playDemo } = useGlobalAudio();
  
  // 🛡️ CHRIS-PROTOCOL: Grid-Gap Mandate (v2.14.109)
  // We gebruiken een vaste grid-structuur die ALTIJD van links naar rechts vult.
  // De 'flex' op de motion.div zorgde voor gaten bij filter-wissels.
  
  console.log(`[VoiceGrid] Rendering ${actors?.length || 0} actors.`);
  
  return (
    <>
      <div className={cn(
        "w-full",
        featured && "md:block flex overflow-x-auto pb-12 -mx-6 px-6 snap-x snap-mandatory no-scrollbar"
      )}>
        <div 
          className={cn(
            featured 
              ? "flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 min-w-max md:min-w-full items-stretch" 
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5 items-stretch auto-rows-fr"
          )}
        >
          <AnimatePresence initial={false}>
            {(actors || []).filter(Boolean).map((actor) => (
              <motion.div 
                key={actor?.id || Math.random()}
                layout="position"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  mass: 1
                }}
                className={cn("w-full h-full", featured && "w-[85vw] md:w-auto snap-center")}
              >
                <NuclearErrorBoundary 
                  name={`VoiceCard:${actor?.id}`}
                  fallback={<div className="w-full h-[400px] bg-va-black/5 rounded-[20px] animate-pulse" />}
                >
                  <VoiceCard 
                    voice={actor} 
                    onSelect={onSelect ? () => onSelect(actor) : undefined}
                  />
                </NuclearErrorBoundary>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};
