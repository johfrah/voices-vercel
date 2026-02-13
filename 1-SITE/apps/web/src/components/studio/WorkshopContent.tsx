"use client";

import React, { useState } from 'react';
import Image from "next/image";
import { Play, ArrowRight } from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/ui/BentoGrid";
import { ContainerInstrument, ButtonInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { BookingFunnel } from "@/components/studio/BookingFunnel";
import { WorkshopProgram } from "@/components/ui/Studio/WorkshopProgram";

interface WorkshopContentProps {
  workshop: any;
}

export const WorkshopContent: React.FC<WorkshopContentProps> = ({ workshop }) => {
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  
  // Haal het programma op van de geselecteerde editie, of fallback naar het workshop-brede programma
  const currentEdition = workshop.dates?.[selectedDateIndex];
  const currentProgram = currentEdition?.program || workshop.dagindeling;

  return (
    <BentoGrid columns={3} className="mb-20">
      {/* VIDEO BENTO */}
      <BentoCard span="lg" className="relative group aspect-video md:aspect-auto bg-black overflow-hidden">
        {workshop.aftermovie_url ? (
          <ContainerInstrument className="absolute inset-0 flex items-center justify-center">
            <ContainerInstrument className="text-white/20 font-black tracking-tighter text-4xl group-hover:scale-110 transition-transform duration-700">
              <VoiceglotText translationKey="workshop.aftermovie.label" defaultText="Aftermovie" />
            </ContainerInstrument>
            <ButtonInstrument className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-all duration-500">
              <ContainerInstrument className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                <Play className="text-white fill-white ml-2" size={32} />
              </ContainerInstrument>
            </ButtonInstrument>
          </ContainerInstrument>
        ) : (
          <Image 
            src={workshop.image || "/assets/studio/placeholder.jpg"} 
            alt={workshop.title}
            fill
            className="object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
          />
        )}
        <ContainerInstrument className="absolute bottom-8 left-8 right-8">
          <TextInstrument className="text-white/60 text-sm font-medium max-w-md leading-relaxed">
            {workshop.aftermovie_description || (
              <VoiceglotText 
                translationKey="workshop.aftermovie.default_desc" 
                defaultText="Bekijk de impact van deze workshop en ontdek wat je kunt verwachten van een dag vol creatie." 
              />
            )}
          </TextInstrument>
        </ContainerInstrument>
      </BentoCard>

      {/* STICKY DECISION BOX */}
      <BentoCard span="sm" className="bg-white shadow-aura p-10 flex flex-col justify-between border border-black/5 sticky top-24 h-fit">
        <BookingFunnel 
          workshopId={workshop.id}
          title={workshop.title}
          priceExclVat={workshop.price}
          dates={workshop.dates || []}
          onDateSelect={setSelectedDateIndex}
          selectedDateIndex={selectedDateIndex}
        />
      </BentoCard>

      {/* DYNAMISCH PROGRAMMA - Verandert mee met de geselecteerde editie */}
      <WorkshopProgram dagindeling={currentProgram} image={workshop.image} />

      {/* INSTRUCTEUR BENTO */}
      <BentoCard span="sm" className="bg-va-black text-white p-10 flex flex-col justify-between">
        <ContainerInstrument>
          <ContainerInstrument className="text-[15px] font-black tracking-widest text-white/30 mb-8">
            <VoiceglotText translationKey="workshop.instructor.label" defaultText="Jouw Workshopgever" />
          </ContainerInstrument>
          <ContainerInstrument className="relative w-32 h-32 rounded-3xl overflow-hidden mb-6 border-2 border-white/10">
            <Image 
              src={workshop.voice_header || "/assets/common/founder/johfrah-avatar-be.png"} 
              alt={workshop.instructeur || "Workshopgever"}
              fill
              className="object-cover"
            />
          </ContainerInstrument>
          <HeadingInstrument level={4} className="text-2xl font-black tracking-tight mb-4">
            <VoiceglotText translationKey={`workshop.${workshop.id}.instructor_name`} defaultText={workshop.instructeur || "Johfrah"} />
          </HeadingInstrument>
          <TextInstrument className="text-white/40 text-[15px] font-medium leading-relaxed line-clamp-4">
            {workshop.about_me || (
              <VoiceglotText 
                translationKey="workshop.instructor.default_about" 
                defaultText="Met meer dan 20 jaar ervaring in de stemmenwereld deelt onze expert alle geheimen van het vak." 
              />
            )}
          </TextInstrument>
        </ContainerInstrument>
        <ButtonInstrument className="text-[15px] font-black tracking-widest text-primary flex items-center gap-2 hover:gap-3 transition-all mt-8">
          <VoiceglotText translationKey="workshop.instructor.action" defaultText="MEER OVER DE WORKSHOPGEVER" /> <ArrowRight size={14} />
        </ButtonInstrument>
      </BentoCard>
    </BentoGrid>
  );
};
