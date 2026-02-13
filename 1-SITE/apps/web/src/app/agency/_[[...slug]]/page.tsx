import { AgencyHeroInstrument } from "@/components/ui/AgencyHeroInstrument";
import { ContainerInstrument, PageWrapperInstrument, SectionInstrument, LoadingScreenInstrument } from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { VoiceGrid } from "@/components/ui/VoiceGrid";
import { getActors } from "@/lib/api";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default async function AgencyDynamicPage({ params }: { params: { slug?: string[] } }) {
  const searchResults = await getActors();
  const actors = searchResults.results;
  const slug = params.slug?.[0];

  // Filter actors if slug is present (e.g., /agency/nl)
  const filteredActors = slug 
    ? actors.filter(a => a.native_lang?.toLowerCase() === slug.toLowerCase())
    : actors;

  const mappedActors = filteredActors.map(actor => ({
    id: actor.id,
    display_name: actor.display_name,
    photo_url: actor.photo_url,
    voice_score: actor.voice_score,
    native_lang: actor.native_lang,
    ai_tags: actor.ai_tags || [],
    slug: actor.slug,
    demos: actor.demos || []
  }));

  return (
    <PageWrapperInstrument>
      <LiquidBackground strokeWidth={1.5} / />
      <AgencyHeroInstrument 
        title={slug ? `${slug.toUpperCase()} Stemmen` : "Vlaamse Voice-overs"} 
        subtitle="Vind de perfecte stem voor uw project."
        filters={searchResults.filters}
      />
      <SectionInstrument>
        <ContainerInstrument>
          <Suspense strokeWidth={1.5} fallback={<LoadingScreenInstrument / />}>
            <VoiceGrid strokeWidth={1.5} actors={mappedActors as any} / />
          </Suspense>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
