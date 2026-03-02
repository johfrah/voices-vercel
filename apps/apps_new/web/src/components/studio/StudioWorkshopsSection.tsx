"use client";

import React from "react";
import Image from "next/image";
import { WorkshopCarousel } from "./WorkshopCarousel";
import { ReviewGrid, type ReviewItem } from "./ReviewGrid";
import { ContainerInstrument, HeadingInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { ChevronDown, ArrowRight, Calendar, MapPin, User, ChevronRight } from "lucide-react";
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
    instructor: { id?: number; name: string; photo_url: string | null } | null;
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
 * Studio Workshops Section: WorkshopCarousel + ReviewGrid + Planning.
 * NUCLEAR LOADING: Rendered client-side (ssr: false) for 100ms LCP.
 */
export const StudioWorkshopsSection: React.FC<StudioWorkshopsSectionProps> = ({ workshops, instructors, faqs }) => {
  const carouselWorkshops = workshops.map(mapToCarouselFormat);
  
  // Filter workshops into categories (Bob-methode: Vaste vs. Gast)
  const vasteWorkshops = carouselWorkshops.filter(w => 
    w.taxonomy.type === 'Vaste Workshop' || w.taxonomy.type === 'Anker (Maandelijks)'
  );
  const gastWorkshops = carouselWorkshops.filter(w => 
    w.taxonomy.type === 'Gastworkshop' || w.taxonomy.type === 'Gastworkshop (Expert)' || w.taxonomy.type === 'Specialisatie'
  );

  const allReviews = workshops.flatMap((w) => w.reviews);
  const uniqueReviews = Array.from(
    new Map(allReviews.map((r) => [r.id, r])).values()
  ).slice(0, 9);

  // Flatten all upcoming editions for the calendar (Luxe Sectie)
  const allUpcomingEditions = workshops
    .flatMap(w => w.upcoming_editions.map(e => ({ ...e, workshopTitle: w.title, workshopSlug: w.slug, workshopId: w.id })))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8);

  return (
    <>
      {/* VASTE WAARDEN */}
      <section id="workshops" className="py-24 bg-white border-y border-black/[0.03]" data-block-type="workshops-vaste">
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

        {/* GASTWORKSHOPS / SPECIALISATIES */}
        {gastWorkshops.length > 0 && (
          <div className="mt-32" data-block-type="workshops-gast">
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

      {/* REVIEWS */}
      <ReviewGrid reviews={uniqueReviews} maxItems={9} />

      {/* PLANNING (Luxe Sectie) */}
      <section className="py-32 bg-va-off-white" data-block-type="planning">
        <ContainerInstrument className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
              <VoiceglotText translationKey="studio.section.planning.title" defaultText="De Studio Planning" />
            </TextInstrument>
            <HeadingInstrument level={2} className="text-4xl md:text-6xl font-light tracking-tighter text-va-black">
              <VoiceglotText translationKey="studio.section.planning.subtitle" defaultText="Hier zie je een handig overzicht van onze volgende workshops." />
            </HeadingInstrument>
          </div>

          <div className="space-y-4">
            {allUpcomingEditions.map((edition) => (
              <Link 
                key={edition.id} 
                href={`/studio/${edition.workshopSlug}`}
                className="group block bg-white hover:bg-va-black p-6 md:p-8 rounded-[24px] border border-black/[0.03] shadow-aura hover:shadow-aura-lg transition-all duration-500"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-8">
                    {/* Date Chip */}
                    <div className="w-20 h-20 bg-va-off-white group-hover:bg-white/10 rounded-[18px] flex flex-col items-center justify-center transition-colors">
                      <span className="text-2xl font-light tracking-tighter text-va-black group-hover:text-white leading-none">
                        {new Date(edition.date).getDate()}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-va-black/30 group-hover:text-white/30 mt-1">
                        {new Date(edition.date).toLocaleString('nl-BE', { month: 'short' })}
                      </span>
                    </div>

                    <div>
                      <HeadingInstrument level={3} className="text-2xl md:text-3xl font-light tracking-tighter text-va-black group-hover:text-white transition-colors">
                        {edition.workshopTitle}
                      </HeadingInstrument>
                      <div className="flex items-center gap-6 mt-2">
                        <div className="flex items-center gap-2 text-va-black/40 group-hover:text-white/40 text-sm transition-colors">
                          <MapPin size={14} strokeWidth={1.5} />
                          <span>{edition.location?.city || 'Locatie n.t.b.'}</span>
                        </div>
                        {edition.instructor && (
                          <div className="flex items-center gap-2 text-va-black/40 group-hover:text-white/40 text-sm transition-colors">
                            <User size={14} strokeWidth={1.5} />
                            <span>{edition.instructor.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="px-4 py-2 bg-primary/5 group-hover:bg-white/10 rounded-full transition-colors">
                      <span className="text-[11px] font-bold tracking-widest uppercase text-primary group-hover:text-white">
                        <VoiceglotText translationKey="studio.status.open" defaultText="Inschrijvingen Open" />
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-black/5 group-hover:border-white/20 flex items-center justify-center text-va-black/20 group-hover:text-white transition-all">
                      <ChevronRight size={20} strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ContainerInstrument>
      </section>

      {/* INSTRUCTORS */}
      <section className="py-32 bg-white" data-block-type="instructors">
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
                    <Image 
                      src={instructor.photo_url} 
                      alt={instructor.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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

      {/* FAQ */}
      <section className="py-32 bg-va-off-white" data-block-type="faq">
        <ContainerInstrument className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-20">
            <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
              <VoiceglotText translationKey="studio.section.faq.title" defaultText="Veelgestelde Vragen" />
            </TextInstrument>
            <HeadingInstrument level={2} className="text-4xl md:text-5xl font-light tracking-tighter text-va-black">
              <VoiceglotText translationKey="studio.section.faq.subtitle" defaultText="Alles wat je moet weten over onze workshops" />
            </HeadingInstrument>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-[20px] p-8 border border-black/[0.03] shadow-aura">
                <HeadingInstrument level={4} className="text-xl font-light text-va-black mb-4">{faq.question}</HeadingInstrument>
                <TextInstrument className="text-va-black/60 font-light leading-relaxed">{faq.answer}</TextInstrument>
              </div>
            ))}
          </div>
        </ContainerInstrument>
      </section>
    </>
  );
};
