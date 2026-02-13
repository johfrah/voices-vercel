import { AgencyHeroInstrument } from "@/components/ui/AgencyHeroInstrument";
import { ContainerInstrument, PageWrapperInstrument, SectionInstrument, LoadingScreenInstrument } from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { VoiceGrid } from "@/components/ui/VoiceGrid";
import { getActors } from "@/lib/api-server";
import { Suspense } from "react";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function AgencyDynamicPage({ 
  params, 
  searchParams 
}: { 
  params: { slug?: string[] },
  searchParams: Record<string, string>
}) {
  const slug = params.slug || [];
  
  // 🧠 SMART MAPPING: Vertaal URL segmenten naar filters
  // /agency/voice-overs/nederlands/man/corporate
  const filters: Record<string, string> = { ...searchParams };
  
  if (slug.length > 0) filters.language = slug[0];
  if (slug.length > 1) filters.gender = slug[1];
  if (slug.length > 2) filters.style = slug[2];

  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';

  const searchResults = await getActors(filters, lang);
  const actors = searchResults.results;

  const mappedActors = actors.map(actor => ({
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
      <LiquidBackground strokeWidth={1.5} />
      <AgencyHeroInstrument 
        title={filters.language ? `${filters.language.toUpperCase()} Stemmen` : undefined} 
        subtitle="Vind de perfecte stem voor uw project."
        filters={searchResults.filters}
        searchParams={filters}
      />
      <SectionInstrument>
        <ContainerInstrument>
          <Suspense  fallback={<LoadingScreenInstrument />}>
            <VoiceGrid strokeWidth={1.5} actors={mappedActors as any} />
          </Suspense>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
