"use client";

import { BookingFunnel } from "@/components/studio/BookingFunnel";
import { BentoCard } from "@/components/ui/BentoGrid";
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, SectionInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { WorkshopProgram } from "@/components/ui/Studio/WorkshopProgram";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { cleanText } from "@/lib/utils/utils";
import { Play } from "lucide-react";
import Image from "next/image";
import React, { useState } from 'react';

interface WorkshopContentProps {
  workshop: any;
  isLoading?: boolean;
}

export const WorkshopContent: React.FC<WorkshopContentProps> = ({ workshop, isLoading = false }) => {
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  
  // Haal het programma op van de geselecteerde editie, of fallback naar het workshop-brede programma
  const currentEdition = workshop.dates?.[selectedDateIndex];
  const currentProgram = currentEdition?.program || workshop.dagindeling;

  return (
    <ContainerInstrument plain className="space-y-32">
      {/*  SECTION 2: BOOKING TOOL (Centraal) */}
      <ContainerInstrument className="max-w-[1140px] mx-auto">
        <ContainerInstrument className="max-w-3xl mx-auto">
          <HeadingInstrument level={2} className="text-4xl md:text-5xl font-light tracking-tighter text-va-black text-center mb-12">
            {workshop.dates && workshop.dates.length > 0 ? (
              <>
                <VoiceglotText translationKey="workshop.booking.title.available_prefix" defaultText="Doe je mee met de workshop" />
                <span className="text-primary"> &apos;{workshop.title}&apos;</span>?
              </>
            ) : (
              <>
                <VoiceglotText translationKey="workshop.booking.title.empty_prefix" defaultText="Blijf op de hoogte van" />
                <span className="text-primary"> &apos;{workshop.title}&apos;</span>
              </>
            )}
          </HeadingInstrument>
          
          <BentoCard span="full" className="bg-white shadow-aura-lg p-12 rounded-[32px] border border-black/5">
            <BookingFunnel 
              isLoading={isLoading}
              strokeWidth={1.5} 
              workshopId={workshop.id}
              title={workshop.title}
              priceExclVat={workshop.price}
              dates={workshop.dates || []}
              onDateSelect={setSelectedDateIndex}
              selectedDateIndex={selectedDateIndex} 
            />
          </BentoCard>
        </ContainerInstrument>
      </ContainerInstrument>

      {/*  SECTION 3: INHOUD, PROGRAMMA & AFTERMOVIE */}
      <SectionInstrument className="py-32 bg-va-off-white/50 border-y border-black/[0.03]">
        <ContainerInstrument className="max-w-[1140px] mx-auto space-y-32">
          
          {/* WORKSHOP INFO & INSTRUCTOR */}
          <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <ContainerInstrument className="lg:col-span-7 space-y-12">
              <ContainerInstrument plain>
                <HeadingInstrument level={2} className="text-4xl md:text-5xl font-light tracking-tighter mb-8 text-va-black">
                  <VoiceglotText translationKey={`workshop.${workshop.id}.title`} defaultText={workshop.title} />
                </HeadingInstrument>
                
                <ContainerInstrument className="prose prose-lg prose-black max-w-none text-black/60 font-light leading-relaxed whitespace-pre-line">
                  <VoiceglotText translationKey={`workshop.${workshop.id}.description`} defaultText={cleanText(workshop.description)} />
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="lg:col-span-5">
              {/*  WORKSHOPGEVER BENTO */}
              <BentoCard span="full" className="bg-va-black text-white p-10 rounded-[32px] shadow-aura-lg">
                <ContainerInstrument className="flex flex-col gap-8">
                  <ContainerInstrument className="flex items-center gap-6">
                    <ContainerInstrument className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20">
                      <Image 
                        src={workshop.voice_header || "/assets/common/founder/johfrah-avatar-be.png"} 
                        alt={workshop.instructeur || "Workshopgever"}
                        fill
                        className="object-cover"
                      />
                    </ContainerInstrument>
                    <ContainerInstrument plain>
                    <TextInstrument className="text-[15px] font-light tracking-[0.2em] text-white/30 mb-1">
                      <VoiceglotText translationKey="workshop.instructor.label" defaultText="Jouw Workshopgever" />
                    </TextInstrument>
                    <TextInstrument className="text-2xl font-light text-white">
                      <VoiceglotText translationKey={`instructor.${workshop.instructor_id || 'default'}.name`} defaultText={workshop.instructeur || "Johfrah Lefebvre"} />
                    </TextInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
                
                <TextInstrument className="text-[15px] font-light leading-relaxed text-white/60 italic">
                  <VoiceglotText translationKey={`instructor.${workshop.instructor_id || 'default'}.about`} defaultText={cleanText(workshop.about_me) || "Meester in stem en spreken, met meer dan 20 jaar ervaring in de studio."} />
                </TextInstrument>
                </ContainerInstrument>
              </BentoCard>
            </ContainerInstrument>
          </ContainerInstrument>

          {/* DYNAMISCH PROGRAMMA */}
          <ContainerInstrument className="w-full">
            <WorkshopProgram strokeWidth={1.5} dagindeling={currentProgram} image={workshop.image} />
          </ContainerInstrument>

          {/* AFTERMOVIE */}
          {workshop.aftermovie_url && (
            <ContainerInstrument className="space-y-12">
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter text-va-black text-center">
                <VoiceglotText translationKey="workshop.aftermovie.title" defaultText="Bekijk de sfeer" />
              </HeadingInstrument>
              <BentoCard span="full" className="relative group aspect-video bg-black overflow-hidden rounded-[40px] shadow-aura-lg">
                <ContainerInstrument plain className="absolute inset-0 flex items-center justify-center">
                  <ContainerInstrument plain className="text-white/20 font-light tracking-tighter text-4xl group-hover:scale-110 transition-transform duration-700"><VoiceglotText  translationKey="workshop.aftermovie.label" defaultText="Aftermovie" /></ContainerInstrument>
                  <ButtonInstrument className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-all duration-500">
                    <ContainerInstrument plain className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                      <Play strokeWidth={1.5} className="text-white fill-white ml-2" size={32} />
                    </ContainerInstrument>
                  </ButtonInstrument>
                </ContainerInstrument>
              </BentoCard>
            </ContainerInstrument>
          )}
        </ContainerInstrument>
      </SectionInstrument>
    </ContainerInstrument>
  );
};
