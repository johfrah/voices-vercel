"use client";

import { BookingFunnel } from "@/components/studio/BookingFunnel";
import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { WorkshopProgram } from "@/components/ui/Studio/WorkshopProgram";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Play } from "lucide-react";
import Image from "next/image";
import React, { useState } from 'react';

interface WorkshopContentProps {
  workshop: any;
}

export const WorkshopContent: React.FC<WorkshopContentProps> = ({ workshop }) => {
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  
  // Haal het programma op van de geselecteerde editie, of fallback naar het workshop-brede programma
  const currentEdition = workshop.dates?.[selectedDateIndex];
  const currentProgram = currentEdition?.program || workshop.dagindeling;

  return (
    <BentoGrid strokeWidth={1.5} columns={3} className="mb-20">
      {/* VIDEO BENTO */}
      <BentoCard span="lg" className="relative group aspect-video md:aspect-auto bg-black overflow-hidden">
        {workshop.aftermovie_url ? (
          <ContainerInstrument className="absolute inset-0 flex items-center justify-center">
            <ContainerInstrument className="text-white/20 font-light tracking-tighter text-4xl group-hover:scale-110 transition-transform duration-700"><VoiceglotText  translationKey="workshop.aftermovie.label" defaultText="Aftermovie" /></ContainerInstrument>
            <ButtonInstrument className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-all duration-500">
              <ContainerInstrument className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                <Play strokeWidth={1.5} className="text-white fill-white ml-2" size={32} />
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
          <TextInstrument className="text-white/60 text-[15px] font-light max-w-md leading-relaxed">
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
        <BookingFunnel strokeWidth={1.5} 
          workshopId={workshop.id}
          title={workshop.title}
          priceExclVat={workshop.price}
          dates={workshop.dates || []}
          onDateSelect={setSelectedDateIndex}
          selectedDateIndex={selectedDateIndex}
        />
      </BentoCard>

      {/* DYNAMISCH PROGRAMMA - Verandert mee met de geselecteerde editie */}
      <WorkshopProgram strokeWidth={1.5} dagindeling={currentProgram} image={workshop.image} />

      {/* INSTRUCTEUR BENTO */}
      <BentoCard span="sm" className="bg-va-black text-white p-10 flex flex-col justify-between rounded-[20px]">
        <ContainerInstrument>
          <ContainerInstrument className="text-[15px] font-light tracking-widest text-white/30 mb-8"><VoiceglotText  translationKey="workshop.instructor.label" defaultText="Jouw workshopgever" /></ContainerInstrument>
          <ContainerInstrument className="relative w-32 h-32 rounded-[10px] overflow-hidden mb-6 border-2 border-white/10">
            <Image  
              src={workshop.voice_header || "/assets/common/founder/johfrah-avatar-be.png"} 
              alt={workshop.instructeur || "Workshopgever"}
              fill
              className="object-cover"
            />
          </ContainerInstrument>
          <HeadingInstrument level={4} className="text-2xl font-light tracking-tight mb-4 text-white"><VoiceglotText  translationKey={`workshop.${workshop.id}.instructor_name`} defaultText={workshop.instructeur || "Johfrah"} /></HeadingInstrument>
          <TextInstrument className="text-white/40 text-[15px] font-light leading-relaxed line-clamp-4">
            {workshop.about_me || (
              <VoiceglotText  
                translationKey="workshop.instructor.default_about" 
                defaultText="Met meer dan 20 jaar ervaring in de stemmenwereld deelt onze expert alle geheimen van het vak." 
              />
            )}
          </TextInstrument>
        </ContainerInstrument>
        <ButtonInstrument className="text-[15px] font-light tracking-widest text-primary flex items-center gap-2 hover:gap-3 transition-all mt-8"><VoiceglotText  translationKey="workshop.instructor.action" defaultText="Meer over de workshopgever" /><Image  src="/assets/common/branding/icons/FORWARD.svg" width={14} height={14} alt="" style={{ filter: 'invert(18%) sepia(91%) saturate(6145%) hue-rotate(332deg) brightness(95%) contrast(105%)' }} /></ButtonInstrument>
      </BentoCard>
    </BentoGrid>
  );
};
