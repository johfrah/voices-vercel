import {
    LoadingScreenInstrument,
    PageWrapperInstrument
} from "@/components/ui/LayoutInstruments";
import { getActor } from "@/lib/api-server";
import { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { VoiceDetailClient } from "./VoiceDetailClient";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';
  
  try {
    const actor = await getActor(params.slug, lang);
    if (!actor) return {};

    const title = `${actor.name} - Voice-over ${actor.gender === 'male' ? 'Stem' : 'Stem'} | Voices.be`;
    const description = actor.description || `Ontdek de stem van ${actor.name} op Voices.be. Beluister demo's en boek direct voor jouw productie.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: actor.image ? [actor.image] : [],
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: actor.image ? [actor.image] : [],
      },
      alternates: {
        canonical: `https://www.voices.be/voice/${params.slug}`,
      },
      //  SUZY-MANDATE: Inject LLM Context for AI-readability
      other: {
        'x-voices-intent': 'voice_booking',
        'x-voices-persona': 'agency_buyer',
        'x-voices-market': actor.market || 'BE',
        'x-voices-journey': 'agency',
        'x-voices-flow': 'commercial',
        'x-voices-entity-type': 'voice_actor',
        'x-voices-entity-id': actor.id,
        'x-voices-entity-name': actor.name,
        'x-voices-entity-lang': actor.nativeLang || 'nl',
        'x-voices-entity-gender': actor.gender
      }
    };
  } catch (e) {
    return {};
  }
}

export default async function VoiceDetailPage({ params }: { params: { slug: string } }) {
  return (
    <PageWrapperInstrument>
      <Suspense  fallback={<LoadingScreenInstrument />}>
        <VoiceDetailContent strokeWidth={1.5} params={params} />
      </Suspense>
    </PageWrapperInstrument>
  );
}

async function VoiceDetailContent({ params }: { params: { slug: string } }) {
  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';
  
  try {
    const actor = await getActor(params.slug, lang);
    if (!actor) return notFound();
    return <VoiceDetailClient strokeWidth={1.5} actor={actor} />;
  } catch (e) {
    console.error("VoiceDetail error:", e);
    return notFound();
  }
}
