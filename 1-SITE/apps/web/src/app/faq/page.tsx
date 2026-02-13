"use client";

import React, { useState } from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ChevronDown, ChevronUp, Search, Sparkles } from 'lucide-react';
import { useSonicDNA } from '@/lib/sonic-dna';

/**
 * ❓ FAQ PAGE (NUCLEAR 2026)
 * 
 * Een high-end FAQ ervaring met progressieve onthulling en Voicy fallback.
 */
export default function FAQPage() {
  const { playClick } = useSonicDNA();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      key: 'faq.delivery',
      q: 'Hoe snel wordt mijn voice-over geleverd?',
      a: 'De meeste projecten worden binnen 24 tot 48 uur geleverd. Heb je meer haast? Veel van onze stemmen bieden een spoedlevering aan binnen 4 uur.'
    },
    {
      key: 'faq.retakes',
      q: 'Zijn aanpassingen (retakes) inbegrepen?',
      a: 'Ja, kleine aanpassingen in toon of tempo zijn altijd inbegrepen. Wijzigingen in de tekst na opname vallen onder een nieuwe boeking, maar vaak tegen een gereduceerd tarief.'
    },
    {
      key: 'faq.usage',
      q: 'Hoe zit het met de gebruiksrechten (buy-outs)?',
      a: 'Onze tarieven zijn transparant. Voor web-gebruik en interne presentaties zijn de rechten vaak onbeperkt inbegrepen. Voor radio, TV en social advertising hanteren we standaard buy-out termijnen van 1 jaar.'
    },
    {
      key: 'faq.quality',
      q: 'In welk bestandsformaat ontvang ik de opname?',
      a: 'Standaard leveren we hoogwaardige 48kHz / 24-bit WAV bestanden. Op verzoek kunnen we ook MP3 of andere formaten aanleveren, volledig nabewerkt en direct klaar voor gebruik.'
    }
  ];

  const openVoicy = () => {
    playClick('deep');
    window.dispatchEvent(new CustomEvent('voicy:suggestion', {
      detail: {
        title: 'FAQ Assistent',
        content: 'Ik kan je helpen met specifieke vragen over tarieven, techniek of stemkeuze.',
        tab: 'chat'
      }
    }));
  };

  return (
    <PageWrapperInstrument className="pt-32 pb-40 bg-va-off-white min-h-screen">
      <SectionInstrument className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <ContainerInstrument className="text-center mb-20 space-y-6">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full text-[15px] font-black tracking-widest shadow-sm border border-black/5">
            <Search strokeWidth={1.5} size={12} className="text-primary" /> 
            <VoiceglotText translationKey="faq.badge" defaultText="Kennisbank" />
          </ContainerInstrument>
          
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            <VoiceglotText translationKey="faq.title_part1" defaultText="Veelgestelde " />
            <TextInstrument as="span" className="text-primary font-light">
              <VoiceglotText translationKey="faq.title_part2" defaultText="Vragen" />
            </TextInstrument>
          </HeadingInstrument>
          
          <ContainerInstrument className="max-w-2xl mx-auto">
            <TextInstrument className="text-va-black/40 font-medium text-lg leading-relaxed"><VoiceglotText 
                translationKey="faq.subtitle" 
                defaultText="Alles wat je moet weten over het boeken van een stem, de levering en de rechten. Helder en transparant." 
              /></TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* FAQ List */}
        <ContainerInstrument className="max-w-4xl mx-auto space-y-6">
          {faqs.map((faq, i) => (
            <ContainerInstrument key={i} className="bg-white rounded-[32px] shadow-aura border border-black/[0.03] overflow-hidden group">
              <ButtonInstrument 
                onClick={() => {
                  setOpenIndex(openIndex === i ? null : i);
                  playClick('soft');
                }}
                className="w-full px-10 py-8 flex items-center justify-between text-left hover:bg-va-off-white transition-colors"
              >
                <HeadingInstrument level={3} className="text-xl font-black tracking-tight"><VoiceglotText translationKey={`${faq.key}.q`} defaultText={faq.q} /></HeadingInstrument>
                {openIndex === i ? <ChevronUp className="text-primary" /> : <ChevronDown strokeWidth={1.5} className="text-va-black/20" />}
              </ButtonInstrument>
              {openIndex === i && (
                <ContainerInstrument className="px-10 pb-10 animate-in slide-in-from-top-4 duration-300">
                  <TextInstrument className="text-va-black/60 text-lg leading-relaxed font-medium"><VoiceglotText translationKey={`${faq.key}.a`} defaultText={faq.a} /></TextInstrument>
                </ContainerInstrument>
              )}
            </ContainerInstrument>
          ))}
        </ContainerInstrument>

        {/* Voicy CTA */}
        <ContainerInstrument className="mt-20 bg-va-black text-white rounded-[40px] p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 group">
          <ContainerInstrument className="relative z-10 space-y-4 max-w-xl">
            <HeadingInstrument level={2} className="text-4xl font-black tracking-tighter leading-tight">
              <VoiceglotText translationKey="faq.voicy.title" defaultText="Niet gevonden wat je zocht?" />
              <TextInstrument className="text-white/40 text-lg font-medium">
                <VoiceglotText 
                  translationKey="faq.voicy.text" 
                  defaultText="Voicy, onze AI-assistent, kent alle details van ons platform en kan je direct antwoord geven." 
                />
              </TextInstrument>
            </HeadingInstrument>
          </ContainerInstrument>
          <ButtonInstrument 
            onClick={openVoicy}
            className="relative z-10 va-btn-pro !bg-primary !text-va-black !px-12 !py-6 !text-lg flex items-center gap-2"
          >
            <VoiceglotText translationKey="faq.voicy.cta" defaultText="Vraag het aan Voicy" />
            <Sparkles strokeWidth={1.5} size={20} />
          </ButtonInstrument>
          <ContainerInstrument className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        </ContainerInstrument>

        {/* 🧠 LLM CONTEXT (Compliance) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map(f => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": f.a
                }
              })),
              "_llm_context": {
                "persona": "Gids",
                "journey": "common",
                "intent": "find_information",
                "capabilities": ["search_faq", "start_chat"],
                "lexicon": ["Vraag", "Antwoord", "Kennisbank"],
                "visual_dna": ["Accordion", "Bento Grid", "Liquid DNA"]
              }
            })
          }}
        />
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
