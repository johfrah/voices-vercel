"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  ContainerInstrument, 
  ButtonInstrument, 
  TextInstrument, 
  HeadingInstrument 
} from '@/components/ui/LayoutInstruments';
import { LucideX, LucideChevronRight } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoicesState } from '@/contexts/VoicesStateContext';
import { VoiceglotText } from '@/components/ui/VoiceglotText';

export const CastingDock = () => {
  const { state, toggleActorSelection } = useVoicesState();
  const selectedActors = state.selected_actors;
  const isVisible = selectedActors.length > 0;

  const removeActor = (id: number) => {
    const actor = selectedActors.find(a => a.id === id);
    if (actor) toggleActorSelection(actor);
  };

  const startCasting = () => {
    // Navigeer naar de geconsolideerde Casting Launchpad
    window.location.href = '/casting/launchpad/';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-2xl"
        >
          <ContainerInstrument className="bg-va-black text-white rounded-[25px] p-3 md:p-4 shadow-aura-lg flex items-center justify-between gap-3 border border-white/10 backdrop-blur-md bg-va-black/90">
            <ContainerInstrument className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-1">
              <ContainerInstrument className="flex -space-x-3 mr-1 shrink-0">
                {selectedActors.map((actor) => (
                  <ContainerInstrument 
                    key={actor.id}
                    className="relative group"
                  >
                    <ContainerInstrument className="relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-va-black bg-va-off-white overflow-hidden">
                      {actor.photoUrl ? (
                        <Image strokeWidth={1.5} src={actor.photoUrl} alt={actor.firstName} fill className="object-cover" / />
                      ) : (
                        <ContainerInstrument className="w-full h-full flex items-center justify-center text-va-black font-light text-[15px] md:text-base">
                          {actor.firstName[0]}
                        </ContainerInstrument>
                      )}
                    </ContainerInstrument>
                  </ContainerInstrument>
                ))}
              </ContainerInstrument>
              <ContainerInstrument className="flex flex-col min-w-0">
                <TextInstrument className="text-white font-light leading-none text-[15px] md:text-base truncate">
                  {selectedActors.length} {selectedActors.length === 1 ? 'stem' : 'stemmen'}
                </TextInstrument>
                <TextInstrument className="text-white/40 text-[15px] md:text-[15px] mt-1 truncate font-light"><VoiceglotText translationKey="auto.castingdock.klaar_voor_jouw_demo.c40c51" defaultText="Klaar voor jouw demo" /></TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>

            <ButtonInstrument 
              onClick={startCasting}
              className="bg-primary hover:bg-primary/90 text-white px-4 md:px-6 py-3 rounded-[18px] flex items-center gap-2 whitespace-nowrap shrink-0 h-12 md:h-auto"
            >
              <Image strokeWidth={1.5} 
                src="/assets/common/branding/icons/MIC.svg" 
                alt="Mic" 
                width={18} 
                height={18} 
                className="brightness-0 invert"
              / />
              <TextInstrument className="text-[15px] md:text-base font-light tracking-wider"><VoiceglotText translationKey="auto.castingdock.gratis_proefopname.5a39e6" defaultText="Gratis proefopname" /></TextInstrument>
              <LucideChevronRight strokeWidth={1.5} size={16} className="md:w-[18px] md:h-[18px]" />
            </ButtonInstrument>
          </ContainerInstrument>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
