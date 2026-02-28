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
import { Metadata } from "next";
import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
  if (!res.ok) return { workshops: [] };
  const data = await res.json();
  return { workshops: data.workshops || [] };
}

export const metadata: Metadata = {
  title: "Workshops | Voices Studio",
  description: "Professionele voice-over workshops en studio-opnames. Leer van de besten.",
};

export default async function StudioPage() {
  const { workshops } = await getWorkshops();

  return (
    <PageWrapperInstrument className="bg-va-off-white min-h-screen">
      <Suspense fallback={null}>
        <LiquidBackground />
      </Suspense>

      {/* Hero */}
      <section className="relative z-10 pt-32 pb-24">
        <ContainerInstrument className="max-w-4xl mx-auto text-center">
          <HeadingInstrument level={1} className="text-5xl md:text-7xl font-light tracking-tighter leading-none text-va-black mb-8">
            Workshops voor je stem
          </HeadingInstrument>
          <TextInstrument className="text-xl md:text-2xl text-va-black/50 font-light leading-relaxed mb-12">
            Van basisuitspraak tot professionele voice-over technieken. Leer van de besten in onze maandelijkse workshops.
          </TextInstrument>
          <Link
            href="#workshops"
            className="inline-flex items-center gap-3 px-12 py-6 bg-va-black text-white rounded-[10px] font-light tracking-widest hover:bg-primary transition-all duration-500"
          >
            Bekijk workshops
            <ArrowRight size={18} strokeWidth={1.5} />
          </Link>
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
        <StudioWorkshopsSection workshops={workshops} />
      </Suspense>
    </PageWrapperInstrument>
  );
}
