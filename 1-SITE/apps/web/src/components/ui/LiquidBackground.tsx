"use client";

import React from 'react';

import { ContainerInstrument } from './LayoutInstruments';

/**
 * LIQUID BACKGROUND INSTRUMENT
 * 
 * Beheert de visuele 'Tone of Voice' achtergrond.
 */
export const LiquidBackground: React.FC = () => {
  return (
    <ContainerInstrument className="fixed inset-0 z-0 pointer-events-none opacity-40">
      <ContainerInstrument className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full hred blur-[80px] md:blur-[120px]" />
      <ContainerInstrument className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full hblue blur-[80px] md:blur-[120px]" />
    </ContainerInstrument>
  );
};
