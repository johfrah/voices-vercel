"use client";

import React from 'react';
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "./LayoutInstruments";
import { VoiceglotText } from "./VoiceglotText";

/**
 * HOW IT WORKS INSTRUMENT
 */
export const HowItWorksInstrument: React.FC<{ steps: any[] }> = ({ steps }) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Hoe werkt Voices?",
    "description": "In 4 eenvoudige stappen naar de perfecte stemopname.",
    "step": steps.map((step, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": typeof step.title === 'string' ? step.title : "Stap " + (i + 1),
      "itemListElement": [{
        "@type": "HowToDirection",
        "text": typeof step.description === 'string' ? step.description : ""
      }]
    })),
    "_llm_context": {
      "intent": "understand_process",
      "persona": "Practical Mentor",
      "capabilities": ["explain_workflow", "guide_user"],
      "lexicon": {
        "step": "Stap",
        "workflow": "Proces",
        "briefing": "Briefing"
      }
    }
  };

  return (
    <ContainerInstrument id="how-it-works" className="mb-32 scroll-mt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContainerInstrument className="mb-16 space-y-4">
        <HeadingInstrument level={2} className="text-5xl font-light tracking-tighter"><VoiceglotText strokeWidth={1.5} translationKey="home.steps.title_part1" defaultText="In 4 stappen naar de " / /><TextInstrument as="span" className="hmagic-text font-light italic"><VoiceglotText strokeWidth={1.5} translationKey="home.steps.title_highlight" defaultText="beste" / /></TextInstrument><VoiceglotText strokeWidth={1.5} translationKey="home.steps.title_part2" defaultText=" opname" / /></HeadingInstrument>
        <TextInstrument className="text-xl text-black/40 font-medium leading-relaxed max-w-2xl"><VoiceglotText strokeWidth={1.5} translationKey="home.steps.subtitle" defaultText="Eenvoudig, duidelijk en professioneel." / /></TextInstrument>
      </ContainerInstrument>

      <ContainerInstrument className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step: any, i: number) => (
          <ContainerInstrument key={i} className="space-y-6 group">
            <ContainerInstrument className="w-16 h-16 rounded-[24px] bg-va-off-white flex items-center justify-center text-2xl font-light text-va-black/20 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
              {i + 1}
            </ContainerInstrument>
            <ContainerInstrument>
              <HeadingInstrument level={4} className="text-xl font-medium tracking-tight mb-2"><VoiceglotText strokeWidth={1.5} translationKey={`home.steps.step${i+1}.title`} defaultText={step.title} / /><TextInstrument className="text-[15px] text-va-black/50 font-medium leading-relaxed"><VoiceglotText strokeWidth={1.5} translationKey={`home.steps.step${i+1}.description`} defaultText={step.description} / /></TextInstrument></HeadingInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        ))}
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
