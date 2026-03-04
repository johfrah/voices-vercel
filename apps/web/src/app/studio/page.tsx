/**
 * Studio Page (2026)
 *
 * Fetches workshops directly via getStudioWorkshopsData and renders:
 * - WorkshopCarousel (next/dynamic ssr: false)
 * - ReviewGrid (next/dynamic ssr: false)
 *
 * @protocol BOB-METHODE: Islands, Nuclear Loading
 * @protocol CHRIS-PROTOCOL: Direct DB access via StudioService (v2.16.103)
 */

import { ContainerInstrument, HeadingInstrument, PageWrapperInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { Metadata } from "next";
import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import { getStudioWorkshopsData } from "@/lib/services/studio-service";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
const STORAGE_BASE = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/voices`;

const toStorageUrl = (filePath?: string | null): string | null => {
  if (!filePath) return null;
  const cleanPath = filePath.replace(/^\//, '');
  return `${STORAGE_BASE}/${cleanPath}`;
};

const normalizeSubtitleTracks = (subtitleData: any): Array<{ srcLang: string; label: string; data: Array<{ start: number; end: number; text: string }> }> => {
  if (!subtitleData) return [];

  if (Array.isArray(subtitleData)) {
    return subtitleData
      .filter((track) => Array.isArray(track?.items) && track.items.length > 0)
      .map((track) => ({
        srcLang: track.lang || 'nl',
        label: track.label || track.lang || 'Nederlands',
        data: track.items
      }));
  }

  if (Array.isArray(subtitleData.items) && subtitleData.items.length > 0) {
    return [{
      srcLang: subtitleData.lang || 'nl',
      label: subtitleData.label || 'Nederlands',
      data: subtitleData.items
    }];
  }

  return [];
};

const LiquidBackground = nextDynamic(
  () => import("@/components/ui/LiquidBackground").then((mod) => mod.LiquidBackground),
  { ssr: false, loading: () => <div className="fixed inset-0 z-0 bg-va-off-white" /> }
);

const StudioWorkshopsSection = nextDynamic(
  () => import("@/components/studio/StudioWorkshopsSection").then((mod) => mod.StudioWorkshopsSection),
  {
    ssr: false,
    loading: () => (
      <div className="py-24 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    ),
  }
);

export async function generateMetadata(): Promise<Metadata> {
  const { getWorldConfig } = await import('@/lib/services/world-config-service');
  const config = await getWorldConfig(2);
  return {
    title: config?.meta_title || "Workshops | Voices Studio",
    description: config?.meta_description || "Professionele voice-over workshops en studio-opnames.",
    openGraph: config?.og_image_url ? { images: [config.og_image_url] } : undefined,
  };
}

export default async function StudioPage() {
  // 🛡️ CHRIS-PROTOCOL: Nuclear Handshake (Direct DB access)
  const { workshops, instructors, faqs } = await getStudioWorkshopsData();
  const heroWorkshop = workshops.find((workshop: any) => workshop?.video?.id === 722) || workshops.find((workshop: any) => workshop?.video?.file_path);
  const subtitleWorkshop = (normalizeSubtitleTracks(heroWorkshop?.subtitle_data).length > 0
    ? heroWorkshop
    : workshops.find((workshop: any) => normalizeSubtitleTracks(workshop?.subtitle_data).length > 0)
  ) || heroWorkshop;

  const heroVideoUrl = toStorageUrl(heroWorkshop?.video?.file_path);
  const heroPosterUrl = toStorageUrl(
    heroWorkshop?.featured_image?.file_path ||
    workshops.find((workshop: any) => workshop?.featured_image?.file_path)?.featured_image?.file_path
  );
  const heroSubtitles = normalizeSubtitleTracks(subtitleWorkshop?.subtitle_data);

  return (
    <PageWrapperInstrument className="bg-va-off-white min-h-screen" data-world="studio">
      <Suspense fallback={null}>
        <LiquidBackground />
      </Suspense>

      {/* HERO SECTION: Video (Left) + Content (Right) */}
      <section className="relative z-10 pt-32 pb-24 overflow-hidden" data-block-type="hero">
        <ContainerInstrument className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Video Player Island */}
            <div className="relative group animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="absolute -inset-4 bg-primary/5 rounded-[30px] blur-2xl group-hover:bg-primary/10 transition-all duration-700" />
              {heroVideoUrl ? (
                <VideoPlayer 
                  src={heroVideoUrl}
                  poster={heroPosterUrl || undefined}
                  subtitles={heroSubtitles}
                  className="w-full aspect-video rounded-[20px] shadow-aura-lg border border-white/20 relative z-10"
                  autoPlay={false}
                  muted={false}
                />
              ) : (
                <ContainerInstrument className="w-full aspect-video rounded-[20px] border border-white/20 bg-va-off-white/80 backdrop-blur-sm shadow-aura-lg relative z-10 flex items-center justify-center">
                  <TextInstrument className="text-va-black/50 text-sm tracking-wide">Studio video niet beschikbaar</TextInstrument>
                </ContainerInstrument>
              )}
              {/* Floating Decorative Element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            </div>

            {/* Right: Content Island */}
            <div className="flex flex-col items-start animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
              <TextInstrument className="text-[13px] font-light tracking-[0.4em] uppercase text-primary mb-6 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-primary/30" />
                <VoiceglotText translationKey="page.studio.projecttype" defaultText="Studio" />
              </TextInstrument>
              
              <HeadingInstrument level={1} className="text-5xl md:text-7xl font-light tracking-tighter leading-[1.1] text-va-black mb-8">
                <VoiceglotText translationKey="page.studio.title" defaultText="Workshops voor professionele sprekers" />
              </HeadingInstrument>
              
              <TextInstrument className="text-xl md:text-2xl text-va-black/60 font-light leading-relaxed mb-12 max-w-xl">
                <VoiceglotText 
                  translationKey="page.studio.description" 
                  defaultText="Verbeter je stem, ontdek verschillende voice-overstijlen en perfectioneer je opnamevaardigheden. Leer professioneler spreken met Bernadette en Johfrah." 
                />
              </TextInstrument>
            </div>
          </div>
        </ContainerInstrument>
      </section>

      {/* WORKSHOPS SECTION: Carousel Island */}
      <StudioWorkshopsSection workshops={workshops} instructors={instructors} faqs={faqs} />
    </PageWrapperInstrument>
  );
}
