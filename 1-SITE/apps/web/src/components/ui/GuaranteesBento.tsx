"use client";

import { Archive, DollarSign, Globe, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import { BentoCard, BentoGrid } from "./BentoGrid";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "./LayoutInstruments";
import { VoiceglotText } from "./VoiceglotText";

/**
 * GUARANTEES BENTO
 * Focus: Vertrouwen & Kwaliteit (Bob-methode)
 * Verpakt de content uit 'guarantees.md' in een high-end Bento Grid.
 */
export const GuaranteesBento = () => {
  return (
    <BentoGrid strokeWidth={1.5} className="mb-24 md:mb-32">
      {/* 🛡️ MAIN CARD: 100% Tevredenheid */}
      <BentoCard span="xl" className="h-auto md:h-[400px] flex flex-col justify-between group overflow-hidden relative p-8 md:p-12 bg-va-black text-white border-none shadow-aura">
        <ContainerInstrument className="absolute inset-0 z-0">
          <Image  
            src="/assets/service-photo.jpg" 
            alt="Service" 
            fill 
            className="object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-1000"
          />
        </ContainerInstrument>
        <ContainerInstrument plain className="relative z-10">
          <ContainerInstrument plain className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-[20px] md:rounded-[24px] flex items-center justify-center text-va-black mb-6 md:mb-8 shadow-lg shadow-primary/20">
            <ShieldCheck strokeWidth={1.5} size={24} md:size={32} fill="currentColor" />
          </ContainerInstrument>
          <HeadingInstrument level={3} className="text-3xl md:text-5xl font-light tracking-tighter mb-4 md:mb-6 leading-none text-primary"><VoiceglotText  translationKey="guarantees.satisfaction.title" defaultText="100% Tevredenheid" /><TextInstrument className="text-white/40 font-medium max-w-md text-base md:text-lg block mt-4"><VoiceglotText  
              translationKey="guarantees.satisfaction.description" 
              defaultText="Is de toon niet helemaal wat je zocht? Vraag met één klik een gratis retake aan. Let op: voor tekstwijzigingen achteraf rekenen we een klein supplement." 
            /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="absolute -bottom-40 -right-40 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-primary/5 rounded-full blur-[100px] md:blur-[120px]" />
      </BentoCard>

      {/* 🌍 Native Speakers */}
      <BentoCard span="sm" className="bg-white p-6 md:p-8 flex flex-col justify-between h-auto md:h-[280px] border border-black/5 shadow-sm">
        <ContainerInstrument plain>
          <Globe strokeWidth={1.5} className="text-primary mb-4" size={24} />
          <HeadingInstrument level={3} className="text-xl font-light tracking-tight mb-2 text-va-black"><VoiceglotText  translationKey="guarantees.native.title" defaultText="Native Speakers" /><TextInstrument className="text-va-black/40 text-[15px] md:text-[15px] font-medium leading-relaxed block mt-2"><VoiceglotText  translationKey="guarantees.native.description" defaultText="Al onze stemmen wonen en werken in hun eigen land voor de juiste culturele nuance." /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>
      </BentoCard>

      {/* ⚡ Snelheid */}
      <BentoCard span="sm" className="bg-va-dark-soft text-white p-6 md:p-8 flex flex-col justify-between h-auto md:h-[280px] border-none">
        <ContainerInstrument plain>
          <Zap strokeWidth={1.5} className="text-primary mb-4" size={24} fill="currentColor" />
          <HeadingInstrument level={3} className="text-xl font-light tracking-tight mb-2 text-primary"><VoiceglotText  translationKey="guarantees.speed.title" defaultText="Razendsnel" /><TextInstrument className="text-white/60 text-[15px] md:text-[15px] font-medium leading-relaxed block mt-2"><VoiceglotText  translationKey="guarantees.speed.description" defaultText="Vaak al binnen 24 uur geleverd. Jouw project wacht niet, wij ook niet." /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>
      </BentoCard>

      {/* 💰 Transparante Pricing */}
      <BentoCard span="sm" className="bg-white p-6 md:p-8 flex flex-col justify-between h-auto md:h-[280px] border border-black/5 shadow-sm">
        <ContainerInstrument plain>
          <DollarSign strokeWidth={1.5} className="text-primary mb-4" size={24} />
          <HeadingInstrument level={3} className="text-xl font-light tracking-tight mb-2 text-va-black"><VoiceglotText  translationKey="guarantees.pricing.title" defaultText="Eerlijke Prijs" /><TextInstrument className="text-va-black/40 text-[15px] md:text-[15px] font-medium leading-relaxed block mt-2"><VoiceglotText  translationKey="guarantees.pricing.description" defaultText="Geen verborgen kosten of abonnementen. Je betaalt alleen voor wat je nodig hebt." /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>
      </BentoCard>

      {/* 🗄️ Digitaal Archief */}
      <BentoCard span="sm" className="bg-va-off-white p-6 md:p-8 flex flex-col justify-between h-auto md:h-[280px] border border-black/5 shadow-sm">
        <ContainerInstrument plain>
          <Archive strokeWidth={1.5} className="text-va-black/20 mb-4" size={24} />
          <HeadingInstrument level={3} className="text-xl font-light tracking-tight mb-2 text-va-black"><VoiceglotText  translationKey="guarantees.archive.title" defaultText="Veilig Archief" /><TextInstrument className="text-va-black/40 text-[15px] md:text-[15px] font-medium leading-relaxed block mt-2"><VoiceglotText  translationKey="guarantees.archive.description" defaultText="Al je scripts en opnames veilig bewaard in je persoonlijke kluis. Altijd bereikbaar." /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>
      </BentoCard>
    </BentoGrid>
  );
};
