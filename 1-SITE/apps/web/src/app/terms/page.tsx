"use client";

import React from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { VoiceglotHtml } from '@/components/ui/VoiceglotHtml';
import { Scale } from 'lucide-react';

/**
 * 📜 TERMS & CONDITIONS PAGE (NUCLEAR 2026)
 */
export default function TermsPage() {
  return (
    <PageWrapperInstrument className="pt-32 pb-40 px-6 md:px-12 bg-va-off-white min-h-screen">
      <ContainerInstrument className="max-w-4xl mx-auto">
        
        {/* Header */}
        <SectionInstrument className="mb-16">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-black tracking-widest border border-primary/10 mb-8">
            <Scale strokeWidth={1.5} size={12} fill="currentColor" /> 
            <VoiceglotText  translationKey="terms.badge" defaultText="Juridisch" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none mb-6"><VoiceglotText  translationKey="terms.title" defaultText="Algemene Voorwaarden." /><TextInstrument className="text-va-black/40 font-medium text-xl"><VoiceglotText  
              translationKey="terms.subtitle" 
              defaultText="De kleine lettertjes, maar dan in een duidelijk jasje. Hier lees je de afspraken die we met elkaar maken." 
            /></TextInstrument></HeadingInstrument>
        </SectionInstrument>

        <ContainerInstrument className="bg-white shadow-aura rounded-[40px] p-12 space-y-12">
          {/* ⚖️ LEX: DYNAMIC LEGAL CONTENT */}
          <VoiceglotHtml 
            translationKey="page.terms.content" 
            defaultHtml="Laden van de officiële voorwaarden..." 
            className="prose prose-va max-w-none font-light text-va-black/60"
          />

          <ContainerInstrument className="pt-12 border-t border-va-off-white">
            <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/20"><VoiceglotText  translationKey="auto.page.laatst_bijgewerkt__1.e82338" defaultText="Laatst bijgewerkt: 13 februari 2026" /></TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* 🕸️ SUZY: LEGAL SCHEMA MARKUP */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LegalService",
              "name": "Voices.be Algemene Voorwaarden",
              "description": "De officiële algemene voorwaarden van Voices.be, opgesteld door een jurist.",
              "url": "https://www.voices.be/terms",
              "provider": {
                "@type": "Organization",
                "name": "Voices.be",
                "url": "https://www.voices.be"
              },
              "termsOfService": "https://www.voices.be/terms",
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "https://www.voices.be/terms"
              }
            })
          }}
        />
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}
