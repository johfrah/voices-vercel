import { AgencyHeroInstrument } from "@/components/ui/AgencyHeroInstrument";
import { ContainerInstrument, SectionInstrument } from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { getActors } from "@/lib/api-server";
import { headers } from "next/headers";
import { AgencyContent } from "./AgencyContent";
import { JourneyCta } from "@/components/ui/JourneyCta";

export const dynamic = 'force-dynamic';

export default async function AgencyPage() {
  const headerList = headers();
  const market = headerList.get('x-voices-market') || 'BE';
  const lang = headerList.get('x-voices-lang') || 'nl';

    //  MARKET-FIRST FETCH: Prefill language based on market
  let initialLang = undefined;
  if (market === 'FR') initialLang = 'Frans';
  else if (market === 'ES') initialLang = 'Spaans';
  else if (market === 'PT') initialLang = 'Portugees';
  else if (market === 'NL') initialLang = 'Nederlands';
  else if (market === 'DE') initialLang = 'Duits';
  else if (market === 'BE') initialLang = 'Vlaams'; //  CHRIS-PROTOCOL: Forceer Vlaams voor België

  console.log(`[AgencyPage] Fetching actors for market: ${market}, initialLang: ${initialLang}`);

  //  LOUIS-RECOVERY: If we are on localhost, we might want to see ALL actors if the market-filter is too strict
  const searchResults = await getActors(initialLang ? { language: initialLang } : {}, lang);
  let actors = searchResults?.results || [];

  if (actors.length === 0 && initialLang) {
    console.log(`[AgencyPage] No actors found for ${initialLang}, falling back to all actors`);
    const fallbackResults = await getActors({}, lang);
    actors = fallbackResults?.results || [];
  }

  console.log(`[AgencyPage] Found ${actors.length} actors`);

  const mappedActors = actors.map((actor: any) => ({
    id: actor.id,
    display_name: actor.display_name,
    first_name: actor.first_name || actor.firstName,
    last_name: actor.last_name || actor.lastName,
    firstName: actor.firstName || actor.first_name,
    lastName: actor.lastName || actor.last_name,
    email: actor.email,
    photo_url: actor.photo_url,
    voice_score: actor.voice_score,
    native_lang: actor.native_lang,
    gender: actor.gender,
    starting_price: actor.starting_price,
    delivery_days_min: actor.delivery_days_min || 1,
    delivery_days_max: actor.delivery_days_max || 2,
    extra_langs: actor.extra_langs,
    tone_of_voice: actor.tone_of_voice,
    clients: actor.clients,
    cutoff_time: actor.cutoff_time || '18:00',
    availability: actor.availability || [],
    tagline: actor.tagline,
    ai_tags: actor.ai_tags || [],
    slug: actor.slug,
    demos: actor.demos || [],
    bio: actor.bio,
    price_ivr: actor.price_ivr,
    price_online: actor.price_online,
    holiday_from: actor.holiday_from,
    holiday_till: actor.holiday_till,
    rates_raw: actor.rates_raw || {}
  }));

  return (
    <>
      <LiquidBackground strokeWidth={1.5} />
      <AgencyHeroInstrument 
        filters={searchResults.filters}
        market={market}
        searchParams={initialLang ? { language: initialLang } : {}}
      />
      <div className="!pt-0 -mt-24 relative z-40">
        <AgencyContent mappedActors={mappedActors} filters={searchResults.filters} />
        
        {/* SALLY-MANDATE: Signature CTA for Agency Journey */}
        <ContainerInstrument className="mt-20">
          <JourneyCta journey="commercial" />
        </ContainerInstrument>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": market === 'FR' ? "Voix-off Franaises" : market === 'DE' ? "Deutsche Synchronsprecher" : "Vlaamse Voice-overs",
            "description": "Ontdek de beste stemmen van Belgi voor uw commercials, documentaires en bedrijfsfilms.",
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
    </>
  );
}
