"use client";

import React from 'react';
import { AgencyCalculator as PricingCalculator } from "./AgencyCalculator";
import { VoiceglotText } from "./VoiceglotText";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "./LayoutInstruments";

/**
 * PRICING INSTRUMENT
 */
export const PricingInstrument: React.FC = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PriceSpecification",
    "name": "Voice-over Tarieven",
    "description": "Bereken direct de kosten voor jouw voice-over project.",
    "_llm_context": {
      "intent": "calculate_price",
      "persona": "Gids",
      "capabilities": ["calculate_quote", "view_rates"],
      "lexicon": {
        "price": "Investering",
        "calculator": "Rekenhulp",
        "quote": "Voorstel"
      }
    }
  };

  return (
    <ContainerInstrument className="mb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContainerInstrument className="mb-16 space-y-4">
        <HeadingInstrument level={2} className="text-5xl font-light tracking-tighter"><VoiceglotText  translationKey="home.pricing.title_part1" defaultText="Bereken jouw " /><TextInstrument as="span" className="text-primary font-light italic"><VoiceglotText  translationKey="home.pricing.title_highlight" defaultText="tarief" /></TextInstrument></HeadingInstrument>
        <TextInstrument className="text-xl text-black/40 font-medium leading-relaxed max-w-2xl"><VoiceglotText  translationKey="home.pricing.subtitle" defaultText="Geen verrassingen achteraf. Direct inzicht in de kosten." /></TextInstrument>
      </ContainerInstrument>
      <PricingCalculator   />
    </ContainerInstrument>
  );
};
