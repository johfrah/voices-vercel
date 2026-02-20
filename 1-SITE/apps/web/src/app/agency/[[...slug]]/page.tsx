import { AgencyHeroInstrument } from "@/components/ui/AgencyHeroInstrument";
import { ContainerInstrument, PageWrapperInstrument, SectionInstrument } from "@/components/ui/LayoutInstruments";
import { getActors } from "@/lib/api-server";
import { headers } from "next/headers";
import { AgencyContent } from "../AgencyContent";
import nextDynamic from "next/dynamic";
import { Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";

//  NUCLEAR LOADING MANDATE
const LiquidBackground = nextDynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { ssr: false });

export const dynamic = 'force-dynamic';

export default async function AgencyDynamicPage({ 
  params, 
  searchParams 
}: { 
  params: { slug?: string[] },
  searchParams: Record<string, string>
}) {
  const slug = params.slug || [];
  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';
  const market = headersList.get('x-voices-market') || 'BE';

  //  SMART MAPPING: Vertaal URL segmenten naar filters
  // /agency/commercial/tv
  // /agency/telephony
  // /agency/video
  const filters: Record<string, string> = { ...searchParams };
  
  let journey = 'video';
  if (slug[0] === 'commercial' || slug[0] === 'advertentie' || slug[0] === 'reclame') journey = 'commercial';
  else if (slug[0] === 'telephony' || slug[0] === 'telefonie' || slug[0] === 'telefoon') journey = 'telephony';
  else if (slug[0] === 'video' || slug[0] === 'corporate') journey = 'video';

  if (journey === 'commercial' && slug[1]) {
    filters.media = slug[1];
  }

  let searchResults;
  try {
    searchResults = await getActors(filters, lang);
  } catch (error) {
    console.error('[AgencyDynamicPage] getActors failed:', error);
    searchResults = { results: [], filters: { genders: [], languages: [], styles: [] } };
  }
  const actors = searchResults.results || [];

  const mappedActors = actors.map(actor => ({
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
    price_unpaid: actor.price_unpaid, // Explicitly pass for engine
    price_online: actor.price_online,
    holiday_from: actor.holiday_from,
    holiday_till: actor.holiday_till,
    rates_raw: actor.rates_raw || {}
  }));

  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <LiquidBackground strokeWidth={1.5} />
      </Suspense>
      <AgencyHeroInstrument 
        filters={searchResults.filters}
        market={market}
        searchParams={filters}
      />
      <div className="!pt-0 -mt-24 relative z-40">
        <AgencyContent mappedActors={mappedActors} filters={searchResults.filters} />
      </div>
    </AuthProvider>
  );
}
