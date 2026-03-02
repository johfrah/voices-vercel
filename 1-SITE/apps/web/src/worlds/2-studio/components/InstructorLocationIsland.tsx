"use client";

import { ContainerInstrument, HeadingInstrument, SectionInstrument, TextInstrument, ButtonInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { MapPin, Info, ExternalLink } from "lucide-react";

interface InstructorLocationIslandProps {
  workshop: any;
}

/**
 * INSTRUCTOR & LOCATION ISLAND (2026)
 *
 * Combines:
 * 1. Instructor Profile (Photo, Bio, Personal Briefing).
 * 2. Location Details (Address, Map URL, Access Instructions).
 * 
 * LAYA: Elegant cards, Raleway font, aura shadows.
 */
export const InstructorLocationIsland: React.FC<InstructorLocationIslandProps> = ({ workshop }) => {
  const nextEdition = workshop.upcoming_editions?.[0];
  const instructor = nextEdition?.instructor || null;
  const location = nextEdition?.location || null;

  if (!instructor && !location) return null;

  return (
    <SectionInstrument className="relative">
      <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Instructor Card */}
        {instructor && (
          <ContainerInstrument className="flex flex-col bg-white rounded-[30px] overflow-hidden shadow-aura border border-black/[0.01] group hover:shadow-aura-lg transition-all duration-700">
            <ContainerInstrument className="relative aspect-[16/9] overflow-hidden">
              {instructor.photo_url ? (
                <Image 
                  src={instructor.photo_url} 
                  alt={instructor.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <ContainerInstrument className="w-full h-full bg-va-off-white flex items-center justify-center text-va-black/10">
                  <VoiceglotText translationKey="common.no_photo" defaultText="Geen foto" />
                </ContainerInstrument>
              )}
              <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-va-black/60 to-transparent" />
              <ContainerInstrument className="absolute bottom-8 left-8">
                <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-2">
                  <VoiceglotText translationKey="studio.instructor.label" defaultText="Jouw Coach" />
                </TextInstrument>
                <HeadingInstrument level={3} className="text-3xl font-light tracking-tighter text-white">
                  {instructor.name}
                </HeadingInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="p-10 space-y-6">
              <TextInstrument className="text-[13px] font-medium tracking-widest uppercase text-primary">
                {instructor.tagline}
              </TextInstrument>
              <TextInstrument className="text-[15px] text-va-black/50 font-light leading-relaxed">
                {instructor.bio}
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        )}

        {/* Location Card */}
        {location && (
          <ContainerInstrument className="flex flex-col bg-va-black text-white rounded-[30px] p-10 shadow-aura-lg relative overflow-hidden group">
            <ContainerInstrument plain className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            
            <ContainerInstrument className="relative z-10 space-y-10">
              <ContainerInstrument>
                <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
                  <VoiceglotText translationKey="studio.location.label" defaultText="De Studio" />
                </TextInstrument>
                <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter text-white mb-2">
                  {location.name}
                </HeadingInstrument>
                <TextInstrument className="text-lg font-light text-white/40 tracking-tight">
                  {location.address}, {location.city}
                </TextInstrument>
              </ContainerInstrument>

              {location.access_instructions && (
                <ContainerInstrument className="p-6 bg-white/5 rounded-[20px] border border-white/5 space-y-3">
                  <ContainerInstrument className="flex items-center gap-3 text-primary">
                    <Info size={18} />
                    <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase">
                      <VoiceglotText translationKey="studio.location.access" defaultText="Toegang" />
                    </TextInstrument>
                  </ContainerInstrument>
                  <TextInstrument className="text-[14px] text-white/60 font-light leading-relaxed">
                    {location.access_instructions}
                  </TextInstrument>
                </ContainerInstrument>
              )}

              {location.map_url && (
                <ButtonInstrument 
                  as="a"
                  href={location.map_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-va-black rounded-[12px] font-bold tracking-widest hover:bg-white transition-all duration-500 group/map"
                >
                  <MapPin size={18} />
                  <TextInstrument as="span"><VoiceglotText translationKey="action.route_description" defaultText="ROUTE BESCHRIJVING" /></TextInstrument>
                  <ExternalLink size={14} className="opacity-40 group-hover/map:translate-x-1 transition-transform" />
                </ButtonInstrument>
              )}
            </ContainerInstrument>
          </ContainerInstrument>
        )}

      </ContainerInstrument>
    </SectionInstrument>
  );
};
