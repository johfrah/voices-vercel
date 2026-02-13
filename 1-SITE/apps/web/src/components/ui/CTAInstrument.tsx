"use client";

import Link from "next/link";
import React from 'react';
import { BentoCard } from "./BentoGrid";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "./LayoutInstruments";
import { VoiceglotText } from "./VoiceglotText";

/**
 * CTA INSTRUMENT
 */
export const CTAInstrument: React.FC = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Action",
    "name": "Vind jouw stem",
    "description": "Start een casting en vind de perfecte stem voor jouw project.",
    "_llm_context": {
      "intent": "conversion_cta",
      "persona": "Musical Confidant",
      "capabilities": ["start_casting", "contact_support"],
      "lexicon": {
        "cta": "Oproep",
        "action": "Actie",
        "conversion": "Resultaat"
      }
    }
  };

  return (
    <BentoCard span="full" className="bg-va-black text-white p-20 text-center relative overflow-hidden group mb-20 hmagic">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContainerInstrument className="relative z-10 space-y-8">
        <HeadingInstrument level={2} className="text-6xl md:text-8xl font-light tracking-tighter leading-none"><VoiceglotText translationKey="home.cta.title_part1" defaultText="Jouw verhaal verdient " /><br /><TextInstrument as="span" className="text-white font-light italic"><VoiceglotText translationKey="home.cta.title_highlight" defaultText="de beste" /></TextInstrument><VoiceglotText translationKey="home.cta.title_part2" defaultText=" stem." /></HeadingInstrument>
        <TextInstrument className="text-xl text-white/40 max-w-2xl mx-auto font-medium"><VoiceglotText translationKey="home.cta.subtitle" defaultText="Sluit je aan bij honderden bedrijven die hun merk versterken met Voices.be." /></TextInstrument>
        <ContainerInstrument className="flex justify-center gap-6 pt-4">
          <Link href="/agency" className="va-btn-pro !px-12 !py-6 text-lg !bg-primary"><VoiceglotText translationKey="home.cta.primary" defaultText="Vind jouw stem" /></Link>
          <Link href="/contact" className="px-12 py-6 rounded-va-lg font-medium tracking-widest text-[15px] border-2 border-white/10 hover:border-primary transition-all bg-white/5 backdrop-blur-sm"><VoiceglotText translationKey="home.cta.secondary" defaultText="Neem contact op" /></Link>
        </ContainerInstrument>
      </ContainerInstrument>
      <ContainerInstrument className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <ContainerInstrument className="absolute -top-40 -left-40 w-96 h-96 bg-primary rounded-full blur-[120px] animate-pulse" />
        <ContainerInstrument className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary rounded-full blur-[120px] animate-pulse delay-1000" />
      </ContainerInstrument>
    </BentoCard>
  );
};
