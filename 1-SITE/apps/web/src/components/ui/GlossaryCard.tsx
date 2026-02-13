"use client";

import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface GlossaryCardProps {
  term: string;
}

export const GlossaryCard: React.FC<GlossaryCardProps> = ({ term }) => {
  // Mock data for now, in a real app this would fetch from the glossary content
  const definitions: Record<string, { title: string, text: string }> = {
    'buy-out': {
      title: 'Wat is een Buy-out?',
      text: 'Een buy-out is de vergoeding voor het gebruiksrecht van een stemopname voor een specifieke periode en medium (bijv. 1 jaar online of nationaal TV).'
    },
    'time-sync': {
      title: 'Wat is Time-sync?',
      text: 'Bij time-sync spreekt de stemacteur de tekst exact in op de tijdscodes van je video, zodat beeld en geluid perfect synchroon lopen.'
    }
  };

  const def = definitions[term.toLowerCase()] || { title: term, text: 'Definitie volgt...' };

  return (
    <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm my-6 flex items-start gap-4 group hover:border-primary/20 transition-all">
      <div className="w-10 h-10 rounded-full bg-va-black/5 flex items-center justify-center text-va-black/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
        <BookOpen strokeWidth={1.5} size={18} />
      </div>
      <div>
        <h4 className="text-[15px] font-light tracking-widest mb-1">{def.title}</h4>
        <p className="text-[15px] text-va-black/60 leading-relaxed mb-3">{def.text}</p>
        <Link  href={`/glossary/${term}`} className="inline-flex items-center gap-1.5 text-[15px] font-black tracking-widest text-primary hover:gap-2 transition-all">
          Lees meer in de kennisbank <ArrowRight strokeWidth={1.5} size={10} />
        </Link>
      </div>
    </div>
  );
};
