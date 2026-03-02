"use client";

import React from 'react';
import { ButtonInstrument } from '@/components/ui/LayoutInstruments';
import { useSonicDNA } from '@/lib/engines/sonic-dna';

export const VoicyFaqButton = () => {
  const { playClick } = useSonicDNA();

  const handleClick = () => {
    playClick('soft');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('voicy:suggestion', { 
        detail: { 
          tab: 'chat',
          content: 'Ik heb een specifieke vraag over de workshops...' 
        } 
      }));
    }
  };

  return (
    <button 
      onClick={handleClick}
      className="va-btn-pro !bg-va-black !text-white !rounded-[10px] !px-10 py-4 text-[15px] tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg"
    >
      STEL ZE AAN VOICY
    </button>
  );
};
