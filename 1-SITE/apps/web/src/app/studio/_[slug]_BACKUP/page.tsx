import { WorkshopContent } from "@/components/studio/WorkshopContent";
import {
    ContainerInstrument,
    PageWrapperInstrument
} from "@/components/ui/LayoutInstruments";
import { ReviewsInstrument } from "@/components/ui/ReviewsInstrument";
import { WorkshopHero } from "@/components/ui/Studio/WorkshopHero";
import { StudioDataBridge } from "@/lib/studio-bridge";
import { notFound } from "next/navigation";

/**
 * STUDIO DETAIL PAGE
 * Orchestrator voor workshop details.
 * HTML Zero, CSS Zero, Text Zero.
 */
export default async function WorkshopDetailPage({ params }: { params: { slug: string } }) {
  const workshop = await StudioDataBridge.getWorkshopBySlug(params.slug);

  if (!workshop) {
    notFound();
  }

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
      {/* 🧪 LIQUID BACKGROUND */}
      <ContainerInstrument className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none">
        <ContainerInstrument className="absolute inset-0 hmagic animate-slow-pulse" />
      </ContainerInstrument>

      <WorkshopHero  title={workshop.title} journey="studio" />

      <WorkshopContent  workshop={workshop} />

      {/* 🌟 REVIEWS SPECIFIEK VOOR DEZE WORKSHOP */}
      {workshop.reviews && workshop.reviews.length > 0 && (
        <ReviewsInstrument 
          reviews={workshop.reviews} 
          title={`Ervaringen met deze Workshop`}
          subtitle={`Lees wat deelnemers zeggen over hun dag in de studio.`}
          translationKeyPrefix={`workshop.${workshop.id}.reviews`}
        />
      )}

      {/* LLM CONTEXT LAYER */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": workshop.title,
            "description": workshop.aftermovie_description,
            "provider": {
              "@type": "Organization",
              "name": "Voices",
              "url": "https://voices.be"
            },
            "_llm_context": {
              "journey": "studio",
              "product_id": workshop.id,
              "slug": params.slug,
              "price_excl_vat": workshop.price_excl_vat || 0,
              "persona": ["quality-seeker", "self-recorder"],
              "intent": "conversion",
              "visual_dna": ["Bento Grid", "Liquid Gradients", "Sticky Decision Box"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
