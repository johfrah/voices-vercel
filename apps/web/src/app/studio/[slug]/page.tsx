/**
 * WORKSHOP & SUB-FOYER PAGE (2026)
 *
 * Smart Router: Works with both slugs and IDs.
 * Sub-Foyer: Handles Studio info pages (doe-je-mee, faq, contact, quiz)
 * that are NOT workshops but belong to World 2 (Studio).
 * Nuclear Loading: Islands are loaded dynamically (ssr: false).
 * Handshake: 100% data-driven from Supabase.
 */

import { ContainerInstrument, HeadingInstrument, PageWrapperInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { InstrumentRenderer } from "@/components/ui/InstrumentRenderer";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import { getStudioWorkshopsData } from "@/lib/services/studio-service";
import { createClient } from "@supabase/supabase-js";

// NUCLEAR ISLANDS (ssr: false)
const WorkshopHeroIsland = nextDynamic(() => import("@/components/studio/WorkshopHeroIsland").then(mod => mod.WorkshopHeroIsland), { ssr: false });
const SkillDNAIsland = nextDynamic(() => import("@/components/studio/SkillDNAIsland").then(mod => mod.SkillDNAIsland), { ssr: false });
const DayScheduleIsland = nextDynamic(() => import("@/components/studio/DayScheduleIsland").then(mod => mod.DayScheduleIsland), { ssr: false });
const InstructorLocationIsland = nextDynamic(() => import("@/components/studio/InstructorLocationIsland").then(mod => mod.InstructorLocationIsland), { ssr: false });
const ReviewGrid = nextDynamic(() => import("@/components/studio/ReviewGrid").then(mod => mod.ReviewGrid), { ssr: false });
const LiquidBackground = nextDynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { ssr: false });
const WorkshopInterestForm = nextDynamic(() => import("@/components/studio/WorkshopInterestForm").then(mod => mod.WorkshopInterestForm), { ssr: false });
const WorkshopQuiz = nextDynamic(() => import("@/components/studio/WorkshopQuiz").then(mod => mod.WorkshopQuiz), { ssr: false });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

async function getWorkshopData(slugOrId: string) {
  try {
    const data = await getStudioWorkshopsData();
    const workshop = data.workshops.find(w => w.slug === slugOrId || w.id.toString() === slugOrId);
    return workshop || null;
  } catch (err) {
    console.error(`[Workshop Detail] Failed to fetch workshop data for ${slugOrId}:`, err);
    return null;
  }
}

async function getSubFoyerArticle(slug: string) {
  try {
    const lookupSlug = `studio/${slug}`;
    const { data: entry } = await supabase
      .from('slug_registry')
      .select('entity_id, routing_type, world_id, metadata')
      .eq('slug', lookupSlug.toLowerCase())
      .eq('is_active', true)
      .maybeSingle();

    if (!entry) return null;

    const { data: article } = await supabase
      .from('content_articles')
      .select('*, content_blocks(*)')
      .eq('id', entry.entity_id)
      .maybeSingle();

    return article || null;
  } catch (err) {
    console.error(`[Studio Sub-Foyer] Failed to resolve slug "${slug}":`, err);
    return null;
  }
}

const STUDIO_SUB_FOYER_ROUTES = ['doe-je-mee', 'quiz', 'faq', 'contact', 'maak-een-afspraak'] as const;

function isSubFoyerRoute(slug: string): boolean {
  return STUDIO_SUB_FOYER_ROUTES.includes(slug as any);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  if (isSubFoyerRoute(params.slug)) {
    const titleMap: Record<string, string> = {
      'doe-je-mee': 'Doe je mee? | Voices Studio',
      'quiz': 'Workshop Quiz | Voices Studio',
      'faq': 'Veelgestelde Vragen | Voices Studio',
      'contact': 'Contact | Voices Studio',
      'maak-een-afspraak': 'Maak een afspraak | Voices Studio',
    };
    return { title: titleMap[params.slug] || 'Voices Studio' };
  }

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
  // 🛡️ CHRIS-PROTOCOL: Sub-Foyer routes FIRST (v2.28.1)
  // These are info pages, NOT workshops. They must resolve before workshop lookup.
  if (params.slug === 'doe-je-mee') {
    return (
      <PageWrapperInstrument className="bg-va-off-white">
        <Suspense fallback={null}><LiquidBackground /></Suspense>
        <ContainerInstrument className="py-32 max-w-4xl mx-auto">
          <header className="mb-16 text-center">
            <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter mb-4">Doe je mee?</HeadingInstrument>
            <TextInstrument className="text-va-black/40 font-light">Laat ons weten welke workshop je interesseert.</TextInstrument>
          </header>
          <WorkshopInterestForm />
        </ContainerInstrument>
      </PageWrapperInstrument>
    );
  }

  if (params.slug === 'quiz') {
    return (
      <PageWrapperInstrument className="bg-va-off-white">
        <Suspense fallback={null}><LiquidBackground /></Suspense>
        <ContainerInstrument className="py-32 max-w-xl mx-auto">
          <WorkshopQuiz />
        </ContainerInstrument>
      </PageWrapperInstrument>
    );
  }

  if (isSubFoyerRoute(params.slug)) {
    const article = await getSubFoyerArticle(params.slug);
    if (article) {
      return (
        <PageWrapperInstrument className="bg-va-off-white">
          <Suspense fallback={null}><LiquidBackground /></Suspense>
          <InstrumentRenderer article={article} worldId={2} />
        </PageWrapperInstrument>
      );
    }
    notFound();
  }

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
