"use client";

import {
  BookOpen,
  Eye,
  Film,
  GraduationCap,
  Heart,
  Mic,
  Radio,
  Sliders,
  Smile,
  Sparkles,
  Video
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface StudioWorkshopNavItem {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  lucide_icon?: string | null;
  upcoming_editions?: Array<{
    date: string;
    location?: { city?: string | null } | null;
  }>;
}

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
  "graduation-cap": GraduationCap
};

export function getWorkshopIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return Sparkles;
  return ICON_MAP[String(iconName)] || Sparkles;
}

function getNextEditionTimestamp(item: StudioWorkshopNavItem): number | null {
  const editions = Array.isArray(item.upcoming_editions) ? item.upcoming_editions : [];
  if (editions.length === 0) return null;

  let nextTs: number | null = null;
  for (const edition of editions) {
    const ts = new Date(edition.date).getTime();
    if (!Number.isFinite(ts)) continue;
    if (nextTs === null || ts < nextTs) nextTs = ts;
  }
  return nextTs;
}

export function sortWorkshopsByUpcomingThenAlpha(items: StudioWorkshopNavItem[]): StudioWorkshopNavItem[] {
  return [...items].sort((a, b) => {
    const nextA = getNextEditionTimestamp(a);
    const nextB = getNextEditionTimestamp(b);
    const hasA = nextA !== null;
    const hasB = nextB !== null;

    if (hasA && hasB && nextA !== nextB) return (nextA as number) - (nextB as number);
    if (hasA && !hasB) return -1;
    if (!hasA && hasB) return 1;

    return String(a.title || "").localeCompare(String(b.title || ""), "nl");
  });
}
