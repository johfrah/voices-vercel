"use client";

import React, { useState } from 'react';
import { ContainerInstrument, HeadingInstrument } from './LayoutInstruments';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSonicDNA } from '@/lib/sonic-dna';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

/**
 *  ACCORDION INSTRUMENT (VOICES 2026)
 * 
 * Volgt de Ademing-feel:
 * - Minimale padding voor een strakke look.
 * - Subtiele Chevron in plaats van zware knoppen.
 * - Zijdezachte animaties via va-bezier.
 */
export const AccordionInstrument: React.FC<{ items: AccordionItem[] }> = ({ items }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const { playClick } = useSonicDNA();

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
    playClick('soft');
  };

  return (
    <ContainerInstrument className="w-full space-y-3">
      {items.map((item) => (
        <ContainerInstrument 
          key={item.id} 
          className={cn(
            "rounded-[20px] border transition-all duration-500",
            openId === item.id 
              ? "bg-white border-primary/20 shadow-aura" 
              : "bg-white/50 border-black/5 hover:border-black/10"
          )}
        >
          <button
            onClick={() => handleToggle(item.id)}
            className="w-full px-8 py-6 flex items-center justify-between text-left group outline-none"
          >
            <HeadingInstrument level={4} className="text-[17px] font-light tracking-tight text-va-black group-hover:text-primary transition-colors pr-8">
              {item.title}
            </HeadingInstrument>
            <ChevronDown 
              strokeWidth={1.5} 
              size={20} 
              className={cn(
                "text-va-black/20 transition-transform duration-500 ease-va-bezier shrink-0",
                openId === item.id && "rotate-180 text-primary"
              )} 
            />
          </button>
          
          <ContainerInstrument 
            className={cn(
              "transition-all duration-500 ease-va-bezier overflow-hidden",
              openId === item.id ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <ContainerInstrument className="px-8 pb-8 text-va-black/60 font-light leading-relaxed text-[15px]">
              <div dangerouslySetInnerHTML={{ __html: item.content }} />
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      ))}
    </ContainerInstrument>
  );
};
