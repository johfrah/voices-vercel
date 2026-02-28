/**
 * Studio Page (2026)
 *
 * Fetches workshops from /api/studio/workshops and renders:
 * - WorkshopCarousel (next/dynamic ssr: false)
 * - ReviewGrid (next/dynamic ssr: false)
 *
 * @protocol BOB-METHODE: Islands, Nuclear Loading
 */

import { ContainerInstrument, HeadingInstrument, PageWrapperInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { Metadata } from "next";
import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

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

async function getWorkshops() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/studio/workshops`, { cache: "no-store" });
  if (!res.ok) return { workshops: [], instructors: [], faqs: [] };
  const data = await res.json();
  return { 
    workshops: data.workshops || [],
    instructors: data.instructors || [],
    faqs: data.faqs || []
  };
}

export const metadata: Metadata = {
  title: "Workshops | Voices Studio",
  description: "Professionele voice-over workshops en studio-opnames. Leer van de besten.",
};

export default async function StudioPage() {
  const { workshops, instructors, faqs } = await getWorkshops();

  return (
    <PageWrapperInstrument className="bg-va-off-white min-h-screen">
      <Suspense fallback={null}>
        <LiquidBackground />
      </Suspense>

      {/* HERO SECTION: Video (Left) + Content (Right) */}
      <section className="relative z-10 pt-32 pb-24 overflow-hidden">
        <ContainerInstrument className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Video Player Island */}
            <div className="relative group animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="absolute -inset-4 bg-primary/5 rounded-[30px] blur-2xl group-hover:bg-primary/10 transition-all duration-700" />
              <VideoPlayer 
                src="https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/assets/common/branding/johfrah/portfolio/video-canvas.mp4"
                poster="/assets/common/branding/johfrah/johfrah-hero.jpg"
                className="w-full aspect-video rounded-[20px] shadow-aura-lg border border-white/20 relative z-10"
                autoPlay={false}
                muted={false}
              />
              {/* Floating Decorative Element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            </div>

            {/* Right: Content Island */}
            <div className="flex flex-col items-start animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
              <TextInstrument className="text-[13px] font-light tracking-[0.4em] uppercase text-primary mb-6 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-primary/30" />
                <VoiceglotText translationKey="page.studio.projecttype" defaultText="Workshop World" />
              </TextInstrument>
              
              <HeadingInstrument level={1} className="text-5xl md:text-7xl font-light tracking-tighter leading-[1.1] text-va-black mb-8">
                <VoiceglotText translationKey="page.studio.title" defaultText="Workshops voor je stem" />
              </HeadingInstrument>
              
              <TextInstrument className="text-xl md:text-2xl text-va-black/60 font-light leading-relaxed mb-12 max-w-xl">
                <VoiceglotText 
                  translationKey="page.studio.description" 
                  defaultText="Van basisuitspraak tot professionele voice-over technieken. Leer van de besten in onze maandelijkse workshops." 
                />
              </TextInstrument>
              
              <div className="flex flex-wrap gap-6">
                <Link
                  href="#workshops"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-va-black text-white rounded-[12px] font-light tracking-widest hover:bg-primary transition-all duration-500 shadow-aura hover:shadow-aura-lg group"
                >
                  <VoiceglotText translationKey="page.studio.cta" defaultText="Bekijk workshops" />
                  <ArrowRight size={18} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-white/50 backdrop-blur-md text-va-black border border-black/5 rounded-[12px] font-light tracking-widest hover:bg-white transition-all duration-500 shadow-aura-sm"
                >
                  <PlayCircle size={18} strokeWidth={1.5} className="text-primary" />
                  <VoiceglotText translationKey="nav.studio.contact" defaultText="Contact" />
                </Link>
              </div>
            </div>

          </div>
        </ContainerInstrument>
      </section>

      {/* Workshops Carousel + ReviewGrid (Nuclear: ssr: false) */}
      <Suspense
        fallback={
          <div className="py-24 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        }
      >
        <StudioWorkshopsSection workshops={workshops} instructors={instructors} faqs={faqs} />
      </Suspense>
    </PageWrapperInstrument>
  );
}
