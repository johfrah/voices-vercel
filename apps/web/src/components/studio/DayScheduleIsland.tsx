"use client";

import React from "react";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { Clock, MapPin } from "lucide-react";

interface DayScheduleIslandProps {
  workshop: any;
}

/**
 * SMART DAY SCHEDULE ISLAND (2026)
 *
 * Inheritance Logic:
 * 1. Checks if the next edition has a 'day_schedule_override'.
 * 2. If not, falls back to the workshop 'day_schedule' blueprint.
 * 
 * LAYA: Clean timeline visual, Raleway font, aura shadows.
 */
export const DayScheduleIsland: React.FC<DayScheduleIslandProps> = ({ workshop }) => {
  const nextEdition = workshop.upcoming_editions?.[0];
  const schedule = nextEdition?.day_schedule_override || workshop.day_schedule || [];

  if (!schedule || schedule.length === 0) return null;

  return (
    <section className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Left: Heading & Context */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
              Het Programma
            </TextInstrument>
            <HeadingInstrument level={2} className="text-4xl md:text-6xl font-light tracking-tighter text-va-black leading-tight">
              De Dagindeling
            </HeadingInstrument>
          </div>

          {nextEdition && (
            <div className="p-8 bg-va-black text-white rounded-[24px] shadow-aura-lg flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Clock size={20} />
                </div>
                <div>
                  <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/30 mb-0.5">
                    Timing
                  </TextInstrument>
                  <TextInstrument className="text-lg font-light tracking-tight">
                    09:45 Ontvangst — 17:00 Einde
                  </TextInstrument>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <MapPin size={20} />
                </div>
                <div>
                  <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/30 mb-0.5">
                    Locatie
                  </TextInstrument>
                  <TextInstrument className="text-lg font-light tracking-tight">
                    {nextEdition.location?.name}, {nextEdition.location?.city}
                  </TextInstrument>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Timeline */}
        <div className="lg:col-span-7 space-y-6 relative before:absolute before:left-[19px] before:top-8 before:bottom-8 before:w-px before:bg-va-black/[0.05]">
          {schedule.map((item: any, index: number) => (
            <div key={index} className="relative pl-16 group">
              <div className="absolute left-0 top-1.5 w-10 h-10 rounded-full bg-white border border-black/[0.05] shadow-sm flex items-center justify-center z-10 group-hover:border-primary/30 group-hover:shadow-aura-sm transition-all duration-500">
                <div className="w-2 h-2 rounded-full bg-va-black/10 group-hover:bg-primary transition-colors duration-500" />
              </div>
              
              <div className="p-6 bg-white rounded-[20px] shadow-aura border border-black/[0.01] group-hover:shadow-aura-lg group-hover:-translate-y-1 transition-all duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <HeadingInstrument level={4} className="text-xl font-light tracking-tight text-va-black">
                    {item.title}
                  </HeadingInstrument>
                  <TextInstrument className="text-[13px] font-bold tracking-widest text-primary/40 uppercase">
                    {item.time}
                  </TextInstrument>
                </div>
                <TextInstrument className="text-[15px] text-va-black/40 font-light leading-relaxed">
                  {item.description}
                </TextInstrument>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
