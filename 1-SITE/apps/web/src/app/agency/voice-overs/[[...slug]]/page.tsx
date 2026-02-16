import { AgencyHeroInstrument } from "@/components/ui/AgencyHeroInstrument";
import { ContainerInstrument, LoadingScreenInstrument, PageWrapperInstrument, SectionInstrument } from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { VoiceGrid } from "@/components/ui/VoiceGrid";
import { getActors } from "@/lib/api-server";
import { headers } from "next/headers";
import { Suspense } from "react";

import { VoicesMasterControl } from "@/components/ui/VoicesMasterControl";

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
    demos: actor.demos || [],
    bio: actor.bio // 🛡️ CHRIS-PROTOCOL: Zorg dat de bio wordt doorgegeven voor de VoiceCard
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
      <SectionInstrument className="!pt-0 -mt-24 relative z-40">
        <ContainerInstrument plain className="max-w-7xl mx-auto px-4 md:px-6">
          <VoicesMasterControl filters={searchResults.filters} />
          <div className="mt-12">
            <Suspense  fallback={<LoadingScreenInstrument />}>
              <VoiceGrid strokeWidth={1.5} actors={mappedActors as any} />
            </Suspense>
          </div>
        </ContainerInstrument>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
