"use client";

import React from 'react';
import { 
  ContainerInstrument, 
  TextInstrument 
} from './LayoutInstruments';
import { cn } from '@/lib/utils';

interface GlossaryTooltipProps {
  term: string;
  definition: string;
  children: React.ReactNode;
}

/**
 *  GLOSSARY TOOLTIP
 * 
 * Wrapt een begrip in de tekst en toont de definitie bij hover.
 */
export const GlossaryTooltip: React.FC<GlossaryTooltipProps> = ({ 
  term, 
  definition, 
  children 
}) => {
  return (
    <TextInstrument className="group relative inline-block border-b border-dotted border-primary/40 cursor-help transition-colors hover:border-primary font-light">
      {children}
      
      <ContainerInstrument className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-5 bg-va-black text-white rounded-[20px] shadow-aura opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-[100] scale-95 group-hover:scale-100">
        <TextInstrument className="text-[15px] font-black tracking-widest text-primary mb-2 block">
          Begrip: {term}
        </TextInstrument>
        <TextInstrument className="text-[15px] font-medium leading-relaxed text-white/90">
          {definition}
        </TextInstrument>
        {/* Arrow */}
        <ContainerInstrument className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-va-black" />
      </ContainerInstrument>
    </TextInstrument>
  );
};
