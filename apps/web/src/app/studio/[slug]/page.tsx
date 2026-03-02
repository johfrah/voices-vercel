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

  if (params.slug === 'faq') {
    const { faqs } = await getStudioWorkshopsData();
    return (
      <PageWrapperInstrument className="bg-va-off-white">
        <Suspense fallback={null}><LiquidBackground /></Suspense>
        <ContainerInstrument className="max-w-4xl mx-auto px-6 py-32">
          <ContainerInstrument plain className="text-center mb-20">
            <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
              Veelgestelde Vragen
            </TextInstrument>
            <HeadingInstrument level={1} className="text-4xl md:text-5xl font-light tracking-tighter text-va-black">
              Alles wat je moet weten over onze workshops
            </HeadingInstrument>
          </ContainerInstrument>
          <ContainerInstrument plain className="space-y-4">
            {faqs.map((faq) => (
              <ContainerInstrument key={faq.id} className="bg-white rounded-[20px] p-8 border border-black/[0.03] shadow-aura">
                <HeadingInstrument level={4} className="text-xl font-light text-va-black mb-4">{faq.question}</HeadingInstrument>
                <TextInstrument className="text-va-black/60 font-light leading-relaxed">{faq.answer}</TextInstrument>
              </ContainerInstrument>
            ))}
          </ContainerInstrument>
        </ContainerInstrument>
      </PageWrapperInstrument>
    );
  }

  if (params.slug === 'contact') {
    return (
      <PageWrapperInstrument className="bg-va-off-white">
        <Suspense fallback={null}><LiquidBackground /></Suspense>
        <ContainerInstrument className="max-w-4xl mx-auto px-6 py-32">
          <ContainerInstrument plain className="text-center mb-20">
            <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
              Contact
            </TextInstrument>
            <HeadingInstrument level={1} className="text-4xl md:text-5xl font-light tracking-tighter text-va-black mb-4">
              Voices Studio
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 font-light text-lg">
              Heb je vragen over onze workshops of wil je meer weten? Neem gerust contact op.
            </TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ContainerInstrument className="bg-white rounded-[20px] p-8 border border-black/[0.03] shadow-aura space-y-4">
              <HeadingInstrument level={3} className="text-xl font-light text-va-black">Bereikbaarheid</HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light">E-mail: studio@voices.be</TextInstrument>
              <TextInstrument className="text-va-black/60 font-light">Telefoon: +32 (0)2 793 19 91</TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="bg-va-black text-white rounded-[20px] p-8 shadow-aura-lg space-y-4">
              <HeadingInstrument level={3} className="text-xl font-light text-white">De Studio</HeadingInstrument>
              <TextInstrument className="text-white/60 font-light">Jules Delhaizestraat 42</TextInstrument>
              <TextInstrument className="text-white/60 font-light">1080 Brussel (Molenbeek)</TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </PageWrapperInstrument>
    );
  }

  if (isSubFoyerRoute(params.slug)) {
    const article = await getSubFoyerArticle(params.slug);
    if (article && article.content_blocks?.length > 0) {
      return (
        <PageWrapperInstrument className="bg-va-off-white">
          <Suspense fallback={null}><LiquidBackground /></Suspense>
          <InstrumentRenderer blocks={article.content_blocks} />
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
