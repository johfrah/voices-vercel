import { AgencyHeroInstrument } from "@/components/ui/AgencyHeroInstrument";
import { ContainerInstrument, PageWrapperInstrument, SectionInstrument, LoadingScreenInstrument } from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { VoiceGrid } from "@/components/ui/VoiceGrid";
import { getActors } from "@/lib/api-server";
import { Suspense } from "react";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function AgencyPage() {
  const headerList = headers();
  const market = headerList.get('x-voices-market') || 'BE';
  const lang = headerList.get('x-voices-lang') || 'nl';

  // 🌍 MARKET-FIRST FETCH: Prefill language based on market
  let initialLang = undefined;
  if (market === 'FR') initialLang = 'frans';
  else if (market === 'ES') initialLang = 'spaans';
  else if (market === 'PT') initialLang = 'portugees';
  else if (market === 'NL') initialLang = 'nederlands';
  else if (market === 'DE') initialLang = 'duits';

  const searchResults = await getActors(initialLang ? { language: initialLang } : {}, lang);
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
      <LiquidBackground strokeWidth={1.5} / />
      <AgencyHeroInstrument 
        title={market === 'FR' ? "Voix-off Françaises" : market === 'DE' ? "Deutsche Synchronsprecher" : "Vlaamse Voice-overs"} 
        subtitle={market === 'FR' ? "Découvrez les meilleures voix pour vos projets." : market === 'DE' ? "Entdecken Sie die besten Stimmen für Ihre Projekte." : "Ontdek de beste stemmen van België voor uw commercials, documentaires en bedrijfsfilms."}
        filters={searchResults.filters}
        market={market}
        searchParams={initialLang ? { language: initialLang } : {}}
      />
      <SectionInstrument>
        <ContainerInstrument>
          <Suspense strokeWidth={1.5} fallback={<LoadingScreenInstrument / />}>
            <VoiceGrid strokeWidth={1.5} actors={mappedActors as any} / />
          </Suspense>
        </ContainerInstrument>
      </SectionInstrument>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": market === 'FR' ? "Voix-off Françaises" : market === 'DE' ? "Deutsche Synchronsprecher" : "Vlaamse Voice-overs",
            "description": "Ontdek de beste stemmen van België voor uw commercials, documentaires en bedrijfsfilms.",
            "_llm_context": {
              "intent": "search_voices",
              "persona": "visitor",
              "journey": "agency",
              "market": market,
              "capabilities": ["search_voices", "filter_voices", "listen_demos"],
              "visual_dna": ["Voice Grid", "Bento UI", "Liquid DNA"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
