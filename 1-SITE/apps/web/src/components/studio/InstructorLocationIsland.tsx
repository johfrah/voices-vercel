"use client";

import React from "react";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
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
    <section className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Instructor Card */}
        {instructor && (
          <div className="flex flex-col bg-white rounded-[30px] overflow-hidden shadow-aura border border-black/[0.01] group hover:shadow-aura-lg transition-all duration-700">
            <div className="relative aspect-[16/9] overflow-hidden">
              {instructor.photo_url ? (
                <img 
                  src={instructor.photo_url} 
                  alt={instructor.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-va-off-white flex items-center justify-center text-va-black/10">Geen foto</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-va-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-2">
                  Jouw Coach
                </TextInstrument>
                <HeadingInstrument level={3} className="text-3xl font-light tracking-tighter text-white">
                  {instructor.name}
                </HeadingInstrument>
              </div>
            </div>
            
            <div className="p-10 space-y-6">
              <TextInstrument className="text-[13px] font-medium tracking-widest uppercase text-primary">
                {instructor.tagline}
              </TextInstrument>
              <TextInstrument className="text-[15px] text-va-black/50 font-light leading-relaxed">
                {instructor.bio}
              </TextInstrument>
            </div>
          </div>
        )}

        {/* Location Card */}
        {location && (
          <div className="flex flex-col bg-va-black text-white rounded-[30px] p-10 shadow-aura-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 space-y-10">
              <div>
                <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
                  De Studio
                </TextInstrument>
                <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter text-white mb-2">
                  {location.name}
                </HeadingInstrument>
                <TextInstrument className="text-lg font-light text-white/40 tracking-tight">
                  {location.address}, {location.city}
                </TextInstrument>
              </div>

              {location.access_instructions && (
                <div className="p-6 bg-white/5 rounded-[20px] border border-white/5 space-y-3">
                  <div className="flex items-center gap-3 text-primary">
                    <Info size={18} />
                    <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase">
                      Toegang
                    </TextInstrument>
                  </div>
                  <TextInstrument className="text-[14px] text-white/60 font-light leading-relaxed">
                    {location.access_instructions}
                  </TextInstrument>
                </div>
              )}

              {location.map_url && (
                <a 
                  href={location.map_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-va-black rounded-[12px] font-bold tracking-widest hover:bg-white transition-all duration-500 group/map"
                >
                  <MapPin size={18} />
                  <span>ROUTE BESCHRIJVING</span>
                  <ExternalLink size={14} className="opacity-40 group-hover/map:translate-x-1 transition-transform" />
                </a>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
