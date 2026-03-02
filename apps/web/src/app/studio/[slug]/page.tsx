/**
 * WORKSHOP DETAIL PAGE (2026)
 *
 * Smart Router: Works with both slugs and IDs.
 * Nuclear Loading: Islands are loaded dynamically (ssr: false).
 * Handshake: 100% data-driven from Supabase.
 *
 * 🛡️ CHRIS-PROTOCOL: Studio sub-foyer pages (quiz, doe-je-mee, contact, faq)
 * are handled here before the workshop lookup to prevent false 404s.
 */

import { ContainerInstrument, HeadingInstrument, TextInstrument, PageWrapperInstrument } from "@/components/ui/LayoutInstruments";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import { getStudioWorkshopsData } from "@/lib/services/studio-service";

// NUCLEAR ISLANDS (ssr: false)
const WorkshopHeroIsland = nextDynamic(() => import("@/components/studio/WorkshopHeroIsland").then(mod => mod.WorkshopHeroIsland), { ssr: false });
const SkillDNAIsland = nextDynamic(() => import("@/components/studio/SkillDNAIsland").then(mod => mod.SkillDNAIsland), { ssr: false });
const DayScheduleIsland = nextDynamic(() => import("@/components/studio/DayScheduleIsland").then(mod => mod.DayScheduleIsland), { ssr: false });
const InstructorLocationIsland = nextDynamic(() => import("@/components/studio/InstructorLocationIsland").then(mod => mod.InstructorLocationIsland), { ssr: false });
const ReviewGrid = nextDynamic(() => import("@/components/studio/ReviewGrid").then(mod => mod.ReviewGrid), { ssr: false });
const WorkshopQuiz = nextDynamic(() => import("@/components/studio/WorkshopQuiz").then(mod => mod.WorkshopQuiz), { ssr: false });
const WorkshopInterestForm = nextDynamic(() => import("@/components/studio/WorkshopInterestForm").then(mod => mod.WorkshopInterestForm), { ssr: false });
const LiquidBackground = nextDynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { ssr: false });

const STUDIO_SUB_PAGES = ['quiz', 'doe-je-mee', 'contact', 'faq', 'maak-een-afspraak'] as const;

async function getWorkshopData(slugOrId: string) {
  try {
    // 🛡️ CHRIS-PROTOCOL: Direct Service Call (v2.24.9)
    // Eliminates internal HTTP fetch during SSR to prevent timeouts and deadlocks.
    const data = await getStudioWorkshopsData();
    const workshop = data.workshops.find(w => w.slug === slugOrId || w.id.toString() === slugOrId);
    return workshop || null;
  } catch (err) {
    console.error(`[Workshop Detail] Failed to fetch workshop data for ${slugOrId}:`, err);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  if (STUDIO_SUB_PAGES.includes(params.slug as any)) {
    const titles: Record<string, string> = {
      'quiz': 'Welke workshop past bij jou? | Voices Studio',
      'doe-je-mee': 'Doe je mee? | Voices Studio',
      'contact': 'Contact | Voices Studio',
      'faq': 'FAQ | Voices Studio',
      'maak-een-afspraak': 'Maak een afspraak | Voices Studio',
    };
    return { title: titles[params.slug] || 'Voices Studio' };
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

  if (params.slug === 'contact' || params.slug === 'faq' || params.slug === 'maak-een-afspraak') {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
    );
    const cmsSlug = `studio/${params.slug}`;
    const { data: page } = await supabase.from('content_articles').select('*').eq('slug', cmsSlug).maybeSingle();
    if (page) {
      const { data: blocks } = await supabase.from('content_blocks').select('*').eq('article_id', page.id).order('display_order', { ascending: true });
      const { InstrumentRenderer } = await import('@/components/ui/InstrumentRenderer');
      const { VoiceglotText } = await import('@/components/ui/VoiceglotText');
      return (
        <PageWrapperInstrument className="bg-va-off-white">
          <Suspense fallback={null}><LiquidBackground /></Suspense>
          <ContainerInstrument className="py-48 relative z-10 max-w-5xl mx-auto px-6">
            <header className="mb-64">
              <TextInstrument className="text-[11px] font-bold tracking-[0.4em] text-primary/60 mb-12 block uppercase">Studio</TextInstrument>
              <HeadingInstrument level={1} className="text-[10vw] lg:text-[120px] font-light tracking-tighter mb-20 leading-[0.85] text-va-black" suppressHydrationWarning>
                <VoiceglotText translationKey={`page.${cmsSlug}.title`} defaultText={page.title} />
              </HeadingInstrument>
            </header>
            <InstrumentRenderer blocks={blocks || []} />
          </ContainerInstrument>
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
