"use client";

import React, { useEffect, useState } from "react";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { VoicesLinkInstrument } from "@/components/ui/VoicesLinkInstrument";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Calendar, BookOpen, Film, Mic, Radio, Heart, Sliders, Sparkles, Video, Smile, Eye, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  "film": Film,
  "mic": Mic,
  "radio": Radio,
  "heart": Heart,
  "sliders": Sliders,
  "sparkles": Sparkles,
  "video": Video,
  "smile": Smile,
  "eye": Eye,
  "graduation-cap": GraduationCap,
};

interface WorkshopMenuItem {
  id: number;
  title: string;
  slug: string;
  lucide_icon: string | null;
  taxonomy: { category: string; type: string };
  upcoming_editions: Array<{ date: string; location: { city: string } | null }>;
}

/**
 * Studio Workshops Mega Menu (2026)
 * 
 * Data-driven dropdown: haalt alle workshops op via de API.
 * Toont Vaste Waarden en Gastworkshops apart met Lucide icons.
 */
export const StudioWorkshopsMenu: React.FC = () => {
  const [workshops, setWorkshops] = useState<WorkshopMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const res = await fetch("/api/studio/workshops/");
        const data = await res.json();
        setWorkshops(data.workshops || []);
      } catch {
        setWorkshops([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkshops();
  }, []);

  const vasteWorkshops = workshops.filter(w =>
    w.taxonomy.type === 'Vaste Workshop' || w.taxonomy.type === 'Anker (Maandelijks)'
  );
  const gastWorkshops = workshops.filter(w =>
    w.taxonomy.type !== 'Vaste Workshop' && w.taxonomy.type !== 'Anker (Maandelijks)'
  );

  const getIcon = (iconName: string | null): LucideIcon => {
    if (!iconName) return Sparkles;
    return ICON_MAP[iconName] || Sparkles;
  };

  const nextEditions = workshops
    .flatMap(w => w.upcoming_editions.map(e => ({ ...e, workshop: w })))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  if (isLoading) {
    return (
      <ContainerInstrument plain className="p-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <ContainerInstrument key={i} className="h-8 bg-va-black/5 rounded-lg animate-pulse" />
        ))}
      </ContainerInstrument>
    );
  }

  return (
    <ContainerInstrument plain className="p-4 space-y-4">
      {/* Vaste Waarden */}
      {vasteWorkshops.length > 0 && (
        <ContainerInstrument plain>
          <TextInstrument className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary/60 px-3 mb-2">
            <VoiceglotText translationKey="nav.studio.section.vaste" defaultText="Vaste Waarden" />
          </TextInstrument>
          {vasteWorkshops.map((w) => {
            const Icon = getIcon(w.lucide_icon);
            return (
              <VoicesLinkInstrument key={w.id} href={`/studio/${w.slug}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 transition-all duration-300 group">
                <ContainerInstrument plain className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon size={15} strokeWidth={1.5} className="text-primary" />
                </ContainerInstrument>
                <TextInstrument className="text-[14px] font-light text-va-black/70 group-hover:text-va-black transition-colors">
                  {w.title}
                </TextInstrument>
              </VoicesLinkInstrument>
            );
          })}
        </ContainerInstrument>
      )}

      {/* Gastworkshops */}
      {gastWorkshops.length > 0 && (
        <ContainerInstrument plain className="pt-2 border-t border-black/5">
          <TextInstrument className="text-[10px] font-bold tracking-[0.25em] uppercase text-va-black/30 px-3 mb-2">
            <VoiceglotText translationKey="nav.studio.section.gast" defaultText="Specialisaties" />
          </TextInstrument>
          <ContainerInstrument plain className="grid grid-cols-2 gap-x-2">
            {gastWorkshops.map((w) => {
              const Icon = getIcon(w.lucide_icon);
              return (
                <VoicesLinkInstrument key={w.id} href={`/studio/${w.slug}`} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-primary/5 transition-all duration-300 group">
                  <Icon size={14} strokeWidth={1.5} className="text-va-black/30 group-hover:text-primary transition-colors shrink-0" />
                  <TextInstrument className="text-[13px] font-light text-va-black/50 group-hover:text-va-black transition-colors truncate">
                    {w.title}
                  </TextInstrument>
                </VoicesLinkInstrument>
              );
            })}
          </ContainerInstrument>
        </ContainerInstrument>
      )}

      {/* Volgende data */}
      {nextEditions.length > 0 && (
        <ContainerInstrument plain className="pt-3 border-t border-black/5">
          <TextInstrument className="text-[10px] font-bold tracking-[0.25em] uppercase text-va-black/30 px-3 mb-2">
            <VoiceglotText translationKey="nav.studio.section.agenda" defaultText="Eerstvolgende" />
          </TextInstrument>
          {nextEditions.map((e, i) => {
            const date = new Date(e.date);
            const day = date.getDate();
            const month = date.toLocaleDateString('nl-BE', { month: 'short' }).toUpperCase();
            return (
              <VoicesLinkInstrument key={i} href={`/studio/${e.workshop.slug}`} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary/5 transition-all duration-300 group">
                <ContainerInstrument plain className="w-8 h-8 rounded-lg bg-va-black text-white flex flex-col items-center justify-center shrink-0 text-center leading-none">
                  <TextInstrument as="span" className="text-[11px] font-bold">{day}</TextInstrument>
                  <TextInstrument as="span" className="text-[7px] font-bold tracking-wider opacity-60">{month}</TextInstrument>
                </ContainerInstrument>
                <ContainerInstrument plain className="min-w-0">
                  <TextInstrument className="text-[13px] font-light text-va-black/70 group-hover:text-va-black truncate">{e.workshop.title}</TextInstrument>
                  <TextInstrument className="text-[10px] text-va-black/30">{e.location?.city || ''}</TextInstrument>
                </ContainerInstrument>
              </VoicesLinkInstrument>
            );
          })}
        </ContainerInstrument>
      )}

      {/* CTA */}
      <ContainerInstrument plain className="pt-2 border-t border-black/5 px-3">
        <VoicesLinkInstrument href="/studio#workshops" className="flex items-center gap-2 text-[12px] font-bold text-primary hover:opacity-70 transition-opacity py-2">
          <Calendar size={13} />
          <VoiceglotText translationKey="nav.studio.cta" defaultText="Bekijk alle workshops" />
        </VoicesLinkInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
};
