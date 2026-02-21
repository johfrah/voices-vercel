import { AgencyHeroInstrument } from "@/components/ui/AgencyHeroInstrument";
import { PageWrapperInstrument, SectionInstrument } from "@/components/ui/LayoutInstruments";
import { getActors } from "@/lib/api-server";
import { headers } from "next/headers";
import { AgencyContent } from "../../AgencyContent";
import nextDynamic from "next/dynamic";
import { Suspense } from "react";

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
  
  //  SMART MAPPING: Vertaal URL segmenten naar filters
  // /agency/voice-overs/nederlands/man/corporate
  const filters: Record<string, string> = { ...searchParams };
  
  if (slug.length > 0) filters.language = slug[0];
  if (slug.length > 1) filters.gender = slug[1];
  if (slug.length > 2) filters.style = slug[2];

  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';
  const t = (key: string, def: string, params?: any) => def; // Fallback for server component

  const searchResults = await getActors(filters, lang);
  const actors = searchResults.results;

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
    price_online: actor.price_online,
    holiday_from: actor.holiday_from,
    holiday_till: actor.holiday_till,
    rates_raw: actor.rates_raw || {}
  }));

  return (
    <PageWrapperInstrument>
      <Suspense fallback={null}>
        <LiquidBackground strokeWidth={1.5} />
      </Suspense>
      <AgencyHeroInstrument 
        title={filters.language ? t('agency.hero.language_title', `${filters.language.toUpperCase()} Stemmen`, { language: filters.language.toUpperCase() }) : undefined} 
        subtitle={t('agency.hero.subtitle', "Vind de perfecte stem voor uw project.")}
        filters={searchResults.filters}
        searchParams={filters}
      />
      <SectionInstrument className="!pt-0 -mt-24 relative z-40">
        <AgencyContent mappedActors={mappedActors} filters={searchResults.filters} />
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
