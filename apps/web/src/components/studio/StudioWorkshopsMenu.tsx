"use client";

import React, { useEffect, useState } from "react";
import { ContainerInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { VoicesLinkInstrument } from "@/components/ui/VoicesLinkInstrument";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Calendar } from "lucide-react";
import {
  getWorkshopIcon,
  sortWorkshopsByUpcomingThenAlpha,
  type StudioWorkshopNavItem
} from "./studio-workshop-nav-utils";

/**
 * Studio Workshops Mega Menu (2026)
 * 
 * Data-driven dropdown: haalt alle workshops op via de API.
 * Sorteert op eerstvolgende editie, daarna alfabetisch.
 */
export const StudioWorkshopsMenu: React.FC = () => {
  const [workshops, setWorkshops] = useState<StudioWorkshopNavItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const res = await fetch("/api/studio/workshops/");
        const data = await res.json();
        const rawItems = Array.isArray(data?.workshops) ? data.workshops : [];
        const normalized: StudioWorkshopNavItem[] = rawItems.map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          description: item.short_description || item.description || null,
          lucide_icon: item.lucide_icon || null,
          upcoming_editions: Array.isArray(item.upcoming_editions) ? item.upcoming_editions : []
        }));
        setWorkshops(sortWorkshopsByUpcomingThenAlpha(normalized));
      } catch {
        setWorkshops([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkshops();
  }, []);

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
      <ContainerInstrument plain>
        <TextInstrument className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary/60 px-3 mb-2">
          <VoiceglotText translationKey="nav.studio.section.workshops_sorted" defaultText="Workshops (volgorde op datum)" />
        </TextInstrument>
        <ContainerInstrument plain className="max-h-[360px] overflow-y-auto no-scrollbar">
          {workshops.map((workshop) => {
            const Icon = getWorkshopIcon(workshop.lucide_icon);
            const firstEdition = Array.isArray(workshop.upcoming_editions) ? workshop.upcoming_editions[0] : null;
            const firstDate = firstEdition?.date ? new Date(firstEdition.date) : null;
            const validDate = firstDate && Number.isFinite(firstDate.getTime()) ? firstDate : null;
            return (
              <VoicesLinkInstrument
                key={workshop.id}
                href={`/studio/${workshop.slug}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 transition-all duration-300 group"
              >
                <ContainerInstrument plain className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon size={15} strokeWidth={1.5} className="text-primary" />
                </ContainerInstrument>
                <ContainerInstrument plain className="min-w-0">
                  <TextInstrument className="text-[13px] font-light text-va-black/70 group-hover:text-va-black transition-colors truncate">
                    {workshop.title}
                  </TextInstrument>
                  <TextInstrument className="text-[10px] text-va-black/35 font-light tracking-wide truncate">
                    {validDate
                      ? `${validDate.toLocaleDateString("nl-BE", { day: "2-digit", month: "short" })}${firstEdition?.location?.city ? ` · ${firstEdition.location.city}` : ""}`
                      : "Nog geen editie gepland"}
                  </TextInstrument>
                </ContainerInstrument>
              </VoicesLinkInstrument>
            );
          })}
        </ContainerInstrument>
      </ContainerInstrument>

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
