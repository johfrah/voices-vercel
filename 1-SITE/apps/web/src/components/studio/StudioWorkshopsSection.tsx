"use client";

import React from "react";
import { WorkshopCarousel } from "./WorkshopCarousel";
import { ReviewGrid, type ReviewItem } from "./ReviewGrid";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { ChevronDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { VoiceglotText } from "@/components/ui/VoiceglotText";

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
    location: { id?: number; name: string; city: string | null; address: string | null } | null;
    capacity: number;
    status: string | null;
  }>;
}

interface StudioWorkshopsSectionProps {
  workshops: WorkshopApiItem[];
  instructors: Array<{
    id: number;
    name: string;
    tagline: string | null;
    bio: string | null;
    photo_url: string | null;
  }>;
  faqs: Array<{
    id: number;
    question: string;
    answer: string;
    category: string | null;
  }>;
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
export const StudioWorkshopsSection: React.FC<StudioWorkshopsSectionProps> = ({ workshops, instructors, faqs }) => {
  const carouselWorkshops = workshops.map(mapToCarouselFormat);
  
  // Filter workshops into categories (Bob-methode: Vaste vs. Gast)
  const vasteWorkshops = carouselWorkshops.filter(w => 
    w.taxonomy.type === 'Vaste Workshop' || w.taxonomy.type === 'Anker (Maandelijks)'
  );
  const gastWorkshops = carouselWorkshops.filter(w => 
    w.taxonomy.type === 'Gastworkshop' || w.taxonomy.type === 'Gastworkshop (Expert)'
  );

  const allReviews = workshops.flatMap((w) => w.reviews);
  const uniqueReviews = Array.from(
    new Map(allReviews.map((r) => [r.id, r])).values()
  ).slice(0, 9);

  // Flatten all upcoming editions for the calendar
  const allUpcomingEditions = carouselWorkshops
    .flatMap(w => w.editions.map(e => ({ ...e, workshopTitle: w.title, workshopSlug: w.slug, workshopId: w.id })))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8);

  return (
    <>
      <section id="workshops" className="py-24 bg-white border-y border-black/[0.03]">
        <ContainerInstrument className="max-w-7xl mx-auto px-6 mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
                <VoiceglotText translationKey="studio.section.workshops.title" defaultText="Onze Workshops" />
              </TextInstrument>
              <HeadingInstrument level={2} className="text-4xl md:text-6xl font-light tracking-tighter text-va-black">
                <VoiceglotText translationKey="studio.section.vaste_waarden.title" defaultText="Vaste Waarden" />
              </HeadingInstrument>
              <TextInstrument className="text-lg md:text-xl text-va-black/40 font-light mt-6">
                <VoiceglotText translationKey="studio.section.vaste_waarden.description" defaultText="De fundamenten voor elke stem. Deze workshops keren maandelijks terug en vormen de basis van je opleiding." />
              </TextInstrument>
            </div>
          </div>
        </ContainerInstrument>
        <WorkshopCarousel workshops={vasteWorkshops} />

        {gastWorkshops.length > 0 && (
          <div className="mt-32">
            <ContainerInstrument className="max-w-7xl mx-auto px-6 mb-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="max-w-2xl">
                  <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
                    <VoiceglotText translationKey="studio.section.specialisaties.title" defaultText="Specialisaties" />
                  </TextInstrument>
                  <HeadingInstrument level={2} className="text-4xl md:text-6xl font-light tracking-tighter text-va-black">
                    <VoiceglotText translationKey="studio.section.gastworkshops.title" defaultText="Gastworkshops" />
                  </HeadingInstrument>
                  <TextInstrument className="text-lg md:text-xl text-va-black/40 font-light mt-6">
                    <VoiceglotText translationKey="studio.section.gastworkshops.description" defaultText="Verdiep je in specifieke niches met experts uit het veld. Unieke kansen om je horizon te verbreden." />
                  </TextInstrument>
                </div>
              </div>
            </ContainerInstrument>
            <WorkshopCarousel workshops={gastWorkshops} />
          </div>
        )}
      </section>
      <ReviewGrid reviews={uniqueReviews} maxItems={9} />

      {/* Instructors Section */}
      <section className="py-32 bg-white">
        <ContainerInstrument className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-20">
            <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
              <VoiceglotText translationKey="studio.section.vakmanschap.title" defaultText="Vakmanschap" />
            </TextInstrument>
            <HeadingInstrument level={2} className="text-4xl md:text-6xl font-light tracking-tighter text-va-black">
              <VoiceglotText translationKey="studio.section.instructeurs.title" defaultText="Maak kennis met je instructeurs" />
            </HeadingInstrument>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {instructors.map((instructor) => (
              <div key={instructor.id} className="group flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] mb-8 bg-va-off-white shadow-aura group-hover:shadow-aura-lg transition-all duration-700">
                  {instructor.photo_url ? (
                    <img 
                      src={instructor.photo_url} 
                      alt={instructor.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-va-black/10">
                      <VoiceglotText translationKey="common.no_photo" defaultText="Geen foto" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-va-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
                <HeadingInstrument level={3} className="text-2xl font-light tracking-tight text-va-black mb-2">
                  <VoiceglotText translationKey={`instructor.${instructor.id}.name`} defaultText={instructor.name} />
                </HeadingInstrument>
                <TextInstrument className="text-[13px] font-medium tracking-widest uppercase text-primary mb-4">
                  <VoiceglotText translationKey={`instructor.${instructor.id}.tagline`} defaultText={instructor.tagline || ''} />
                </TextInstrument>
                <TextInstrument className="text-[15px] text-va-black/50 font-light leading-relaxed line-clamp-4">
                  <VoiceglotText translationKey={`instructor.${instructor.id}.bio`} defaultText={instructor.bio || ''} />
                </TextInstrument>
              </div>
            ))}
          </div>
        </ContainerInstrument>
      </section>

      {/* Calendar Section */}
      <section className="py-32 bg-va-black text-white overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2" />
        
        <ContainerInstrument className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
                <VoiceglotText translationKey="studio.section.planning.title" defaultText="Planning" />
              </TextInstrument>
              <HeadingInstrument level={2} className="text-4xl md:text-6xl font-light tracking-tighter text-white">
                <VoiceglotText translationKey="studio.section.kalender.title" defaultText="De Studio Kalender" />
              </HeadingInstrument>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {allUpcomingEditions.map((edition) => (
              <Link 
                key={edition.id}
                href={`/studio/${edition.workshopSlug}`}
                className="group flex flex-col md:flex-row md:items-center justify-between p-8 bg-white/5 hover:bg-white/10 border border-white/5 rounded-[20px] transition-all duration-500"
              >
                <div className="flex items-center gap-8 mb-4 md:mb-0">
                  <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-primary text-va-black">
                    <span className="text-[11px] font-bold uppercase tracking-widest">
                      {new Date(edition.date).toLocaleDateString('nl-BE', { month: 'short' })}
                    </span>
                    <span className="text-3xl font-light tracking-tighter">
                      {new Date(edition.date).toLocaleDateString('nl-BE', { day: 'numeric' })}
                    </span>
                  </div>
                  <div>
                    <HeadingInstrument level={4} className="text-2xl font-light tracking-tight mb-1 group-hover:text-primary transition-colors">
                      <VoiceglotText translationKey={`studio.workshop.${edition.workshopId}.title`} defaultText={edition.workshopTitle} />
                    </HeadingInstrument>
                    <TextInstrument className="text-[13px] text-white/40 font-light tracking-widest uppercase flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                      {edition.location?.name ? (
                        <VoiceglotText translationKey={`location.${edition.location.id}.name`} defaultText={edition.location.name} />
                      ) : (
                        <VoiceglotText translationKey="studio.location.unknown" defaultText="Locatie nog onbekend" />
                      )}
                    </TextInstrument>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="hidden lg:flex flex-col items-end">
                    <TextInstrument className="text-[11px] text-white/20 font-bold uppercase tracking-[0.2em] mb-1">
                      <VoiceglotText translationKey="common.status" defaultText="Status" />
                    </TextInstrument>
                    <TextInstrument className="text-[13px] text-primary font-medium tracking-widest uppercase">
                      {edition.status === 'live' ? (
                        <VoiceglotText translationKey="studio.status.open" defaultText="Inschrijvingen Open" />
                      ) : (
                        <VoiceglotText translationKey={`studio.status.${edition.status}`} defaultText={edition.status || ''} />
                      )}
                    </TextInstrument>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-va-black transition-all duration-500">
                    <ArrowRight size={20} strokeWidth={1.5} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ContainerInstrument>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-va-off-white border-t border-black/[0.03]">
        <ContainerInstrument className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-20">
            <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
              <VoiceglotText translationKey="studio.section.ondersteuning.title" defaultText="Ondersteuning" />
            </TextInstrument>
            <HeadingInstrument level={2} className="text-4xl md:text-6xl font-light tracking-tighter text-va-black">
              <VoiceglotText translationKey="studio.section.faq.title" defaultText="Veelgestelde vragen" />
            </HeadingInstrument>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.id} className="group bg-white rounded-[20px] shadow-aura border border-black/[0.02] overflow-hidden transition-all duration-500">
                <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                  <HeadingInstrument level={4} className="text-xl font-light tracking-tight text-va-black">
                    <VoiceglotText translationKey={`faq.${faq.id}.question`} defaultText={faq.question} />
                  </HeadingInstrument>
                  <div className="w-8 h-8 rounded-full bg-va-off-white flex items-center justify-center group-open:rotate-180 transition-transform duration-500">
                    <ChevronDown size={16} className="text-va-black/40" />
                  </div>
                </summary>
                <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-500">
                  <TextInstrument className="text-[15px] text-va-black/50 font-light leading-relaxed">
                    <VoiceglotText translationKey={`faq.${faq.id}.answer`} defaultText={faq.answer} />
                  </TextInstrument>
                </div>
              </details>
            ))}
          </div>
        </ContainerInstrument>
      </section>
    </>
  );
};
