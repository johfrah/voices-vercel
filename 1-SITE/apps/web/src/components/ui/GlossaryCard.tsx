"use client";

import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument,
  ButtonInstrument
} from './LayoutInstruments';
import { VoiceglotText } from './VoiceglotText';

interface GlossaryCardProps {
  term: string;
}

export const GlossaryCard: React.FC<GlossaryCardProps> = ({ term }) => {
  // Mock data for now, in a real app this would fetch from the glossary content
  const definitions: Record<string, { title: string, text: string, key: string }> = {
    'buy-out': {
      title: 'Wat is een Buy-out?',
      key: 'glossary.buy_out.title',
      text: 'Een buy-out is de vergoeding voor het gebruiksrecht van een stemopname voor een specifieke periode en medium (bijv. 1 jaar online of nationaal TV).'
    },
    'time-sync': {
      title: 'Wat is Time-sync?',
      key: 'glossary.time_sync.title',
      text: 'Bij time-sync spreekt de stemacteur de tekst exact in op de tijdscodes van je video, zodat beeld en geluid perfect synchroon lopen.'
    }
  };

  const def = definitions[term.toLowerCase()] || { title: term, text: 'Definitie volgt...', key: `glossary.${term.toLowerCase()}.title` };

  return (
    <ContainerInstrument className="bg-white rounded-3xl p-5 md:p-6 border border-black/5 shadow-sm my-4 md:my-6 flex items-start gap-3 md:gap-4 group hover:border-primary/20 transition-all">
      <ContainerInstrument className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-va-black/5 flex items-center justify-center text-va-black/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
        <BookOpen strokeWidth={1.5} size={16} />
      </ContainerInstrument>
      <ContainerInstrument>
        <HeadingInstrument level={4} className="text-[15px] md:text-[15px] font-light tracking-widest mb-1 ">
          <VoiceglotText translationKey={def.key} defaultText={def.title} />
        </HeadingInstrument>
        <TextInstrument className="text-[15px] md:text-[15px] text-va-black/60 leading-relaxed mb-3 font-light">
          <VoiceglotText translationKey={`${def.key}.desc`} defaultText={def.text} />
        </TextInstrument>
        <ButtonInstrument 
          as={Link}
          href={`/glossary/${term}`} 
          className="inline-flex items-center gap-1.5 text-[15px] md:text-[15px] font-black tracking-widest text-primary hover:gap-2 transition-all p-0 bg-transparent "
        >
          <VoiceglotText translationKey="glossary.read_more" defaultText="Lees meer in de kennisbank" /> <ArrowRight strokeWidth={1.5} size={10} />
        </ButtonInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
