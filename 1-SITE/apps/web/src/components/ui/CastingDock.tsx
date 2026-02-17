"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  ContainerInstrument, 
  ButtonInstrument, 
  TextInstrument 
} from '@/components/ui/LayoutInstruments';
import { LucideX, LucideChevronRight, Mic2, Users } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { useSonicDNA } from '@/lib/sonic-dna';

/**
 * PREMIUM CASTING DOCK (GOD MODE 2026)
 * Focus: High-End Curation & Action
 * Volgens Chris-Protocol: 100ms feedback, Liquid DNA
 */
export const CastingDock = () => {
  const { state, toggleActorSelection } = useVoicesState();
  const { playClick } = useSonicDNA();
  const selectedActors = state.selected_actors;
  const isVisible = selectedActors.length > 0;

  const removeActor = (e: React.MouseEvent, actor: any) => {
    e.stopPropagation();
    playClick('soft');
    toggleActorSelection(actor);
  };

  const startCasting = () => {
    playClick('pro');
    window.location.href = '/casting/launchpad/';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[150] w-full max-w-xl px-6 pointer-events-none"
        >
          <ContainerInstrument 
            plain
            className="bg-va-black shadow-[0_32px_128px_rgba(0,0,0,0.8)] rounded-full p-2 border border-white/10 pointer-events-auto relative overflow-hidden flex items-center gap-4 backdrop-blur-2xl bg-va-black/90"
          >
            {/*  ACTOR AVATARS (Liquid Stack) */}
            <div className="flex items-center pl-2 shrink-0">
              <div className="flex -space-x-3">
                {selectedActors.slice(0, 5).map((actor, idx) => (
                  <motion.div 
                    key={actor.id}
                    layoutId={`avatar-${actor.id}`}
                    className="relative w-12 h-14 rounded-full overflow-hidden border-2 border-va-black bg-va-off-white shadow-xl group cursor-pointer"
                    onClick={(e) => removeActor(e, actor)}
                  >
                    {actor.photoUrl ? (
                      <Image src={actor.photoUrl} alt={actor.firstName} fill className="object-cover transition-transform group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-va-black font-bold text-sm">
                        {actor.firstName[0]}
                      </div>
                    )}
                    {/* Remove Overlay on Hover */}
                    <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <LucideX size={14} className="text-white" strokeWidth={3} />
                    </div>
                  </motion.div>
                ))}
                {selectedActors.length > 5 && (
                  <div className="relative w-12 h-12 rounded-full bg-va-off-white border-2 border-va-black flex items-center justify-center text-va-black font-bold text-xs shadow-xl z-10">
                    +{selectedActors.length - 5}
                  </div>
                )}
              </div>
            </div>

            {/*  SELECTION INFO */}
            <div className="flex-1 min-w-0 py-1">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-primary" />
                <TextInstrument className="text-white font-light text-[17px] tracking-tight truncate leading-tight block">
                  {selectedActors.length} {selectedActors.length === 1 ? 'stem' : 'stemmen'}
                </TextInstrument>
              </div>
              <TextInstrument className="text-white/40 text-[11px] font-bold tracking-[0.1em] uppercase truncate mt-0.5 ml-5">
                <VoiceglotText translationKey="auto.castingdock.jouw_selectie" defaultText="Jouw selectie" />
              </TextInstrument>
            </div>

            {/*  ACTION BUTTON */}
            <button 
              onClick={startCasting}
              className="bg-primary hover:bg-primary/90 text-white h-14 px-6 rounded-full flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl group/btn shrink-0"
            >
              <Mic2 size={20} strokeWidth={2} className="group-hover:animate-pulse" />
              <div className="flex flex-col items-start">
                <span className="text-[14px] font-bold tracking-widest uppercase leading-none">
                  <VoiceglotText translationKey="auto.castingdock.casting" defaultText="Casting" />
                </span>
                <span className="text-[10px] font-medium opacity-70 leading-none mt-1">
                  <VoiceglotText translationKey="auto.castingdock.proefopname" defaultText="Gratis proefopname" />
                </span>
              </div>
              <LucideChevronRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </ContainerInstrument>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
