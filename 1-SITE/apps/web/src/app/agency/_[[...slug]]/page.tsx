import { AgencyHeroInstrument } from "@/components/ui/AgencyHeroInstrument";
import { ContainerInstrument, LoadingScreenInstrument, PageWrapperInstrument, SectionInstrument } from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { VoiceGrid } from "@/components/ui/VoiceGrid";
import { getActors } from "@/lib/api";
import { Suspense } from "react";

import { VoicesMasterControl } from "@/components/ui/VoicesMasterControl";

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
      <LiquidBackground strokeWidth={1.5} />
      <AgencyHeroInstrument 
        title={slug ? `${slug.toUpperCase()} Stemmen` : "Vlaamse Voice-overs"} 
        subtitle="Vind de perfecte stem voor uw project."
        filters={searchResults.filters}
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
