"use client";

import React from "react";
import { WorkshopCarousel } from "./WorkshopCarousel";
import { ReviewGrid, type ReviewItem } from "./ReviewGrid";

export interface WorkshopApiItem {
  id: number;
  title: string;
  slug: string | null;
  description: string | null;
  price: string | null;
  taxonomy: { category: string | null; type: string | null };
  skill_dna: Record<string, number>;
  featured_image: { file_path: string; alt_text: string | null } | null;
  expert_note: string | null;
  preparation_template: string | null;
  reviews: ReviewItem[];
  upcoming_editions: Array<{
    id: number;
    date: string;
    location: { name: string; city: string | null; address: string | null } | null;
    capacity: number;
    status: string | null;
  }>;
}

interface StudioWorkshopsSectionProps {
  workshops: WorkshopApiItem[];
}

/**
 * Maps API format to WorkshopCarousel/WorkshopCard expected format.
 * CHRIS-PROTOCOL: snake_case in API, camelCase for legacy components.
 */
function mapToCarouselFormat(workshop: WorkshopApiItem) {
  return {
    id: workshop.id,
    title: workshop.title,
    slug: workshop.slug,
    description: workshop.description,
    price: workshop.price,
    media: workshop.featured_image
      ? { file_path: workshop.featured_image.file_path, filePath: workshop.featured_image.file_path }
      : null,
    editions: workshop.upcoming_editions.map((e) => ({
      id: e.id,
      date: e.date,
      location: e.location,
      capacity: e.capacity,
      status: e.status,
    })),
    taxonomy: workshop.taxonomy,
    skill_dna: workshop.skill_dna,
    expert_note: workshop.expert_note,
    reviews: workshop.reviews,
  };
}

/**
 * Studio Workshops Section: WorkshopCarousel + ReviewGrid.
 * NUCLEAR LOADING: Rendered client-side (ssr: false) for 100ms LCP.
 */
export const StudioWorkshopsSection: React.FC<StudioWorkshopsSectionProps> = ({ workshops }) => {
  const carouselWorkshops = workshops.map(mapToCarouselFormat);
  const allReviews = workshops.flatMap((w) => w.reviews);
  const uniqueReviews = Array.from(
    new Map(allReviews.map((r) => [r.id, r])).values()
  ).slice(0, 9);

  return (
    <>
      <section id="workshops" className="py-24 bg-white border-y border-black/[0.03]">
        <WorkshopCarousel workshops={carouselWorkshops} />
      </section>
      <ReviewGrid reviews={uniqueReviews} maxItems={6} />
    </>
  );
};
