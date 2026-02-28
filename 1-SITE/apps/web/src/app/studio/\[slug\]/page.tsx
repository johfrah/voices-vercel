/**
 * WORKSHOP DETAIL PAGE (2026)
 *
 * Smart Router: Works with both slugs and IDs.
 * Nuclear Loading: Islands are loaded dynamically (ssr: false).
 * Handshake: 100% data-driven from Supabase.
 */

import { ContainerInstrument, PageWrapperInstrument } from "@/components/ui/LayoutInstruments";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import { WorkshopApiResponse } from "../../api/workshops/route";

// NUCLEAR ISLANDS (ssr: false)
const WorkshopHeroIsland = nextDynamic(() => import("@/components/studio/WorkshopHeroIsland").then(mod => mod.WorkshopHeroIsland), { ssr: false });
const SkillDNAIsland = nextDynamic(() => import("@/components/studio/SkillDNAIsland").then(mod => mod.SkillDNAIsland), { ssr: false });
const DayScheduleIsland = nextDynamic(() => import("@/components/studio/DayScheduleIsland").then(mod => mod.DayScheduleIsland), { ssr: false });
const InstructorLocationIsland = nextDynamic(() => import("@/components/studio/InstructorLocationIsland").then(mod => mod.InstructorLocationIsland), { ssr: false });
const ReviewGrid = nextDynamic(() => import("@/components/studio/ReviewGrid").then(mod => mod.ReviewGrid), { ssr: false });

async function getWorkshopData(slugOrId: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/studio/workshops`, { cache: "no-store" });
  if (!res.ok) return null;
  
  const data: WorkshopApiResponse = await res.json();
  const workshop = data.workshops.find(w => w.slug === slugOrId || w.id.toString() === slugOrId);
  
  return workshop || null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const workshop = await getWorkshopData(params.slug);
  if (!workshop) return { title: "Workshop niet gevonden" };

  return {
    title: `${workshop.title} | Voices Studio`,
    description: workshop.expert_note || workshop.description,
    openGraph: {
      images: workshop.featured_image ? [`https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/${workshop.featured_image.file_path}`] : []
    }
  };
}

export default async function WorkshopDetailPage({ params }: { params: { slug: string } }) {
  const workshop = await getWorkshopData(params.slug);
  if (!workshop) notFound();

  return (
    <PageWrapperInstrument className="bg-va-off-white min-h-screen pb-32">
      
      {/* 1. HERO ISLAND: Video, Expert Note, Price, CTA */}
      <Suspense fallback={<div className="h-[600px] bg-va-black animate-pulse" />}>
        <WorkshopHeroIsland workshop={workshop} />
      </Suspense>

      <ContainerInstrument className="max-w-7xl mx-auto px-6 mt-24 space-y-32">
        
        {/* 2. SKILL DNA & LEVEL ISLAND */}
        <Suspense fallback={<div className="h-96 bg-white rounded-[30px] animate-pulse" />}>
          <SkillDNAIsland workshop={workshop} />
        </Suspense>

        {/* 3. SMART DAY SCHEDULE ISLAND */}
        <Suspense fallback={<div className="h-96 bg-white rounded-[30px] animate-pulse" />}>
          <DayScheduleIsland workshop={workshop} />
        </Suspense>

        {/* 4. INSTRUCTOR & LOCATION ISLAND */}
        <Suspense fallback={<div className="h-96 bg-white rounded-[30px] animate-pulse" />}>
          <InstructorLocationIsland workshop={workshop} />
        </Suspense>

      </ContainerInstrument>

      {/* 5. SOCIAL PROOF: Filtered Reviews */}
      <div className="mt-32">
        <Suspense fallback={<div className="h-96 bg-va-off-white animate-pulse" />}>
          <ReviewGrid 
            reviews={workshop.reviews} 
            title={`Wat deelnemers zeggen over ${workshop.title}`} 
            maxItems={6} 
          />
        </Suspense>
      </div>

    </PageWrapperInstrument>
  );
}
