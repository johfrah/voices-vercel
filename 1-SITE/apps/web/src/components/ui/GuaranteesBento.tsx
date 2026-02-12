"use client";

import { CheckCircle2, ShieldCheck, Zap, Globe, DollarSign, Archive } from "lucide-react";
import React from 'react';
import { BentoCard, BentoGrid } from "./BentoGrid";
import { VoiceglotText } from "./VoiceglotText";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "./LayoutInstruments";

/**
 * GUARANTEES BENTO
 * Focus: Vertrouwen & Kwaliteit (Bob-methode)
 * Verpakt de content uit 'guarantees.md' in een high-end Bento Grid.
 */
export const GuaranteesBento = () => {
  return (
    <BentoGrid className="mb-32">
      {/* 🛡️ MAIN CARD: 100% Tevredenheid */}
      <BentoCard span="xl" className="h-[400px] flex flex-col justify-between group overflow-hidden relative p-12 bg-va-black text-white border-none shadow-aura">
        <ContainerInstrument className="relative z-10">
          <ContainerInstrument className="w-16 h-16 bg-primary rounded-[24px] flex items-center justify-center text-va-black mb-8 shadow-lg shadow-primary/20">
            <ShieldCheck size={32} fill="currentColor" />
          </ContainerInstrument>
          <HeadingInstrument level={3} className="text-5xl font-black uppercase tracking-tighter mb-6 leading-none text-primary">
            <VoiceglotText translationKey="guarantees.satisfaction.title" defaultText="100% Tevredenheid" />
          </HeadingInstrument>
          <TextInstrument className="text-white/40 font-medium max-w-md text-lg">
            <VoiceglotText 
              translationKey="guarantees.satisfaction.description" 
              defaultText="Is de toon niet helemaal wat je zocht? Vraag met één klik een gratis retake aan. Wij gaan door tot het perfect klinkt." 
            />
          </TextInstrument>
        </ContainerInstrument>
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </BentoCard>

      {/* 🌍 Native Speakers */}
      <BentoCard span="sm" className="bg-white p-8 flex flex-col justify-between h-[280px] border border-black/5 shadow-sm">
        <ContainerInstrument>
          <Globe className="text-primary mb-4" size={24} />
          <HeadingInstrument level={3} className="text-xl font-black uppercase tracking-tight mb-2 text-va-black">
            <VoiceglotText translationKey="guarantees.native.title" defaultText="Native Speakers" />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 text-xs font-medium leading-relaxed">
            <VoiceglotText translationKey="guarantees.native.description" defaultText="Al onze stemmen wonen en werken in hun eigen land voor de juiste culturele nuance." />
          </TextInstrument>
        </ContainerInstrument>
      </BentoCard>

      {/* ⚡ Snelheid */}
      <BentoCard span="sm" className="bg-va-dark-soft text-white p-8 flex flex-col justify-between h-[280px] border-none">
        <ContainerInstrument>
          <Zap className="text-primary mb-4" size={24} fill="currentColor" />
          <HeadingInstrument level={3} className="text-xl font-black uppercase tracking-tight mb-2 text-primary">
            <VoiceglotText translationKey="guarantees.speed.title" defaultText="Razendsnel" />
          </HeadingInstrument>
          <TextInstrument className="text-white/60 text-xs font-medium leading-relaxed">
            <VoiceglotText translationKey="guarantees.speed.description" defaultText="Vaak al binnen 24 uur geleverd. Jouw project wacht niet, wij ook niet." />
          </TextInstrument>
        </ContainerInstrument>
      </BentoCard>

      {/* 💰 Transparante Pricing */}
      <BentoCard span="sm" className="bg-white p-8 flex flex-col justify-between h-[280px] border border-black/5 shadow-sm">
        <ContainerInstrument>
          <DollarSign className="text-primary mb-4" size={24} />
          <HeadingInstrument level={3} className="text-xl font-black uppercase tracking-tight mb-2 text-va-black">
            <VoiceglotText translationKey="guarantees.pricing.title" defaultText="Eerlijke Prijs" />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 text-xs font-medium leading-relaxed">
            <VoiceglotText translationKey="guarantees.pricing.description" defaultText="Geen verborgen kosten of abonnementen. Je betaalt alleen voor wat je nodig hebt." />
          </TextInstrument>
        </ContainerInstrument>
      </BentoCard>

      {/* 🗄️ Digitaal Archief */}
      <BentoCard span="sm" className="bg-va-off-white p-8 flex flex-col justify-between h-[280px] border border-black/5 shadow-sm">
        <ContainerInstrument>
          <Archive className="text-va-black/20 mb-4" size={24} />
          <HeadingInstrument level={3} className="text-xl font-black uppercase tracking-tight mb-2 text-va-black">
            <VoiceglotText translationKey="guarantees.archive.title" defaultText="Veilig Archief" />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 text-xs font-medium leading-relaxed">
            <VoiceglotText translationKey="guarantees.archive.description" defaultText="Al je scripts en opnames veilig bewaard in je persoonlijke kluis. Altijd bereikbaar." />
          </TextInstrument>
        </ContainerInstrument>
      </BentoCard>
    </BentoGrid>
  );
};
