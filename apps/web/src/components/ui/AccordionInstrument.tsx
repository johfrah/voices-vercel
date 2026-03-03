"use client";

import React, { useEffect, useState } from 'react';
import { ContainerInstrument, HeadingInstrument, TextInstrument } from './LayoutInstruments';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSonicDNA } from '@/lib/engines/sonic-dna';

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
interface AccordionInstrumentProps {
  items?: AccordionItem[];
  category?: string;
  title?: string;
}

export const AccordionInstrument: React.FC<AccordionInstrumentProps> = ({ items, category, title }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [resolvedItems, setResolvedItems] = useState<AccordionItem[]>(Array.isArray(items) ? items : []);
  const { playClick } = useSonicDNA();

  useEffect(() => {
    if (Array.isArray(items) && items.length > 0) {
      setResolvedItems(items);
      return;
    }

    if (!category) {
      setResolvedItems([]);
      return;
    }

    let cancelled = false;
    const fetchByCategory = async () => {
      try {
        const res = await fetch(`/api/faq?journey=${encodeURIComponent(category)}&limit=8`);
        if (!res.ok) {
          if (!cancelled) setResolvedItems([]);
          return;
        }

        const data = await res.json();
        const mapped = Array.isArray(data)
          ? data
              .map((entry: any, index: number) => ({
                id: String(entry.id ?? `${category}-${index}`),
                title: entry.questionNl || entry.question_nl || entry.question || '',
                content: entry.answerNl || entry.answer_nl || entry.answer || ''
              }))
              .filter((entry: AccordionItem) => entry.title && entry.content)
          : [];

        if (!cancelled) setResolvedItems(mapped);
      } catch {
        if (!cancelled) setResolvedItems([]);
      }
    };

    fetchByCategory();
    return () => {
      cancelled = true;
    };
  }, [items, category]);

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
    playClick('soft');
  };

  if (!resolvedItems.length) {
    return (
      <ContainerInstrument className="w-full rounded-[20px] border border-black/5 bg-white/50 px-8 py-7">
        <HeadingInstrument level={3} className="text-[19px] font-light tracking-tight text-va-black mb-2">
          {title || 'Veelgestelde vragen'}
        </HeadingInstrument>
        <TextInstrument className="text-[15px] font-light text-va-black/50">
          Binnenkort voegen we hier extra antwoorden toe voor deze world.
        </TextInstrument>
      </ContainerInstrument>
    );
  }

  return (
    <ContainerInstrument className="w-full space-y-3">
      {resolvedItems.map((item) => (
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
