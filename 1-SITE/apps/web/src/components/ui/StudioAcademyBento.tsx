"use client";

import { Mic, BookOpen, Calendar, Star, PlayCircle, Users } from "lucide-react";
import Image from "next/image";
import React from 'react';
import { BentoCard, BentoGrid } from "./BentoGrid";
import { VoiceglotText } from "./VoiceglotText";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "./LayoutInstruments";

/**
 * STUDIO & ACADEMY BENTO
 * Focus: Vakmanschap & Groei (Mark's Content x Moby's UI)
 * Verpakt de content uit 'studio.md' en 'academy.md' in een high-impact Bento Grid.
 */
export const StudioAcademyBento = () => {
  return (
    <BentoGrid strokeWidth={1.5} className="mb-32">
      {/* 🎙️ MAIN CARD: Workshops */}
      <BentoCard span="xl" className="h-[450px] flex flex-col justify-between group overflow-hidden relative p-12 bg-va-black text-white border-none shadow-aura">
        <ContainerInstrument className="absolute inset-0 z-0">
          <Image  
            src="/assets/perfect-photo.jpg" 
            alt="Studio" 
            fill 
            className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-1000"
          / />
        </ContainerInstrument>
        <ContainerInstrument plain className="relative z-10">
          <ContainerInstrument plain className="w-16 h-16 bg-primary rounded-[24px] flex items-center justify-center text-va-black mb-8 shadow-lg shadow-primary/20">
            <Mic strokeWidth={1.5} size={32} fill="currentColor" / />
          </ContainerInstrument>
          <HeadingInstrument level={3} className="text-5xl font-black tracking-tighter mb-6 leading-none text-primary"><VoiceglotText strokeWidth={1.5} translationKey="studio.hero.title" defaultText="Master je Stem" / /><TextInstrument className="text-white/40 font-medium max-w-md text-lg"><VoiceglotText strokeWidth={1.5} 
              translationKey="studio.hero.description" 
              defaultText="Van basisuitspraak tot professionele voice-over technieken. Leer van de besten in onze maandelijkse workshops." 
            / /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </BentoCard>

      {/* 🎓 Academy Quick-Link */}
      <BentoCard span="sm" className="bg-white p-8 flex flex-col justify-between h-[280px] border border-black/5 shadow-sm">
        <ContainerInstrument plain>
          <BookOpen strokeWidth={1.5} className="text-primary mb-4" size={24} />
          <HeadingInstrument level={3} className="text-xl font-black tracking-tight mb-2 text-va-black"><VoiceglotText strokeWidth={1.5} translationKey="academy.title" defaultText="Voices Academy" / /><TextInstrument className="text-va-black/40 text-[15px] font-medium leading-relaxed"><VoiceglotText strokeWidth={1.5} translationKey="academy.description" defaultText="Online leertrajecten voor wie op eigen tempo wil groeien als stemacteur." / /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>
      </BentoCard>

      {/* 📅 Kalender */}
      <BentoCard span="sm" className="bg-va-dark-soft text-white p-8 flex flex-col justify-between h-[280px] border-none">
        <ContainerInstrument plain>
          <Calendar strokeWidth={1.5} className="text-primary mb-4" size={24} />
          <HeadingInstrument level={3} className="text-xl font-black tracking-tight mb-2 text-primary"><VoiceglotText strokeWidth={1.5} translationKey="studio.calendar.title" defaultText="Volgende Sessies" / /><TextInstrument className="text-white/60 text-[15px] font-medium leading-relaxed"><VoiceglotText strokeWidth={1.5} translationKey="studio.calendar.description" defaultText="Bekijk de data voor 'Perfect spreken' en 'Voice-overs voor beginners'." / /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>
      </BentoCard>

      {/* 🌟 De Coaches (Bernadette & Johfrah) */}
      <BentoCard span="md" className="bg-va-off-white p-8 flex flex-col justify-between h-[280px] border border-black/5 shadow-sm">
        <ContainerInstrument plain>
          <Users strokeWidth={1.5} className="text-va-black/20 mb-4" size={24} / />
          <HeadingInstrument level={3} className="text-xl font-black tracking-tight mb-2 text-va-black"><VoiceglotText strokeWidth={1.5} translationKey="studio.coaches.title" defaultText="Topcoaches" / /><TextInstrument className="text-va-black/40 text-[15px] font-medium leading-relaxed"><VoiceglotText strokeWidth={1.5} translationKey="studio.coaches.description" defaultText="Bernadette Timmermans (VRT) & Johfrah Lefebvre delen hun jarenlange ervaring." / /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>
      </BentoCard>

      {/* 🎬 Video Quiz */}
      <BentoCard span="sm" className="bg-primary text-va-black p-8 flex flex-col justify-between h-[280px] border-none">
        <ContainerInstrument plain>
          <PlayCircle strokeWidth={1.5} className="mb-4" size={24} fill="currentColor" / />
          <HeadingInstrument level={3} className="text-xl font-black tracking-tight mb-2"><VoiceglotText strokeWidth={1.5} translationKey="studio.quiz.title" defaultText="Welke Workshop?" / /><TextInstrument className="text-va-black/60 text-[15px] font-medium leading-relaxed"><VoiceglotText strokeWidth={1.5} translationKey="studio.quiz.description" defaultText="Doe de interactieve video-quiz en ontdek jouw ideale traject." / /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>
      </BentoCard>
    </BentoGrid>
  );
};
