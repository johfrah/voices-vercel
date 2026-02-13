import { getActor } from "@/lib/api-server";
import { notFound } from "next/navigation";
import { 
  PageWrapperInstrument, 
  LoadingScreenInstrument
} from "@/components/ui/LayoutInstruments";
import { Suspense } from "react";
import { headers } from "next/headers";
import { VoiceDetailClient } from "./VoiceDetailClient";

export const dynamic = 'force-dynamic';

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
