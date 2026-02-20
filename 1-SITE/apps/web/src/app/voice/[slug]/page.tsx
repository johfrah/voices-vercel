import { getActor } from "@/lib/api-server";
import { notFound } from "next/navigation";
import { VoiceDetailClient } from "./VoiceDetailClient";
import { PageWrapperInstrument } from "@/components/ui/LayoutInstruments";
import { headers } from "next/headers";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';
  
  try {
    const actor = await getActor(params.slug, lang);
    if (actor) {
      return {
        title: `${actor.firstName} - Voice-over Stem | Voices.be`,
        description: actor.bio || `Ontdek de stem van ${actor.firstName} op Voices.be.`,
      };
    }
  } catch (e) {
    // No actor found
  }

  return {
    title: `${params.slug} | Voices.be`,
  };
}

export default async function VoiceDetailPage({ params }: { params: { slug: string } }) {
  const headersList = headers();
  const lang = headersList.get('x-voices-lang') || 'nl';
  const cleanSlug = params.slug.toLowerCase().replace(/\/$/, '');

  console.log(`[VoiceDetailPage] Loading slug: ${cleanSlug}, lang: ${lang}`);

  try {
    const actor = await getActor(cleanSlug, lang);
    
    if (!actor) {
      return notFound();
    }

    return (
      <PageWrapperInstrument>
        <VoiceDetailClient actor={actor} />
      </PageWrapperInstrument>
    );
  } catch (e) {
    console.error("VoiceDetailPage error:", e);
    return notFound();
  }
}
