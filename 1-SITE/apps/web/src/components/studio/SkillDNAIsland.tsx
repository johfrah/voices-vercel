"use client";

import React from "react";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { cn } from "@/lib/utils";
import { VoiceglotText } from "@/components/ui/VoiceglotText";

interface SkillDNAIslandProps {
  workshop: any;
}

/**
 * SKILL DNA ISLAND (2026)
 *
 * Esthetische visualisatie van de 6 leerpijlers met ●/○ bollen.
 * Inclusief niveau-indicator (Starter vs. Basiservaring).
 * LAYA: Aura shadows, Raleway font, vloeibare layout.
 */
export const SkillDNAIsland: React.FC<SkillDNAIslandProps> = ({ workshop }) => {
  const skills = [
    { key: "stemtechniek", label: "Stemtechniek" },
    { key: "uitspraak", label: "Uitspraak" },
    { key: "intonatie", label: "Intonatie" },
    { key: "storytelling", label: "Storytelling" },
    { key: "studiotechniek", label: "Studiotechniek" },
    { key: "business", label: "Business" },
  ];

  const dna = workshop.skill_dna || {};
  const level = workshop.level || "Starter";

  return (
    <section className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Left: Heading & Level */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
              Wat leer je écht?
            </TextInstrument>
            <HeadingInstrument level={2} className="text-4xl md:text-6xl font-light tracking-tighter text-va-black leading-tight">
              Jouw Skill DNA
            </HeadingInstrument>
          </div>

          <div className="p-8 bg-white rounded-[24px] shadow-aura border border-black/[0.02] flex items-center gap-6 group hover:shadow-aura-lg transition-all duration-500">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform duration-500">
              <span className="text-2xl font-light tracking-tighter">
                {level === 'Starter' ? 'S' : 'B'}
              </span>
            </div>
            <div>
              <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase text-va-black/30 mb-1">
                Instapniveau
              </TextInstrument>
              <TextInstrument className="text-xl font-light tracking-tight text-va-black">
                {level === 'Starter' ? 'Geen ervaring vereist' : 'Basiservaring vereist'}
              </TextInstrument>
            </div>
          </div>
        </div>

        {/* Right: Skill Dots Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {skills.map((skill) => {
            const score = dna[skill.key] || 1;
            return (
              <div key={skill.key} className="space-y-4">
                <div className="flex justify-between items-end">
                  <TextInstrument className="text-[13px] font-medium tracking-widest uppercase text-va-black/60">
                    {skill.label}
                  </TextInstrument>
                  <TextInstrument className="text-[11px] font-bold text-primary/40">
                    {score}/5
                  </TextInstrument>
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "w-full h-2.5 rounded-full transition-all duration-700",
                        i < score 
                          ? "bg-primary shadow-[0_0_10px_rgba(255,196,33,0.3)]" 
                          : "bg-va-black/[0.05]"
                      )}
                      style={{ transitionDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
