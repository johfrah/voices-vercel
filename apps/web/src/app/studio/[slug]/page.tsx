/**
 * STUDIO [SLUG] HANDLER (2026)
 *
 * ID-First Handshake: Resolves via slug_registry FIRST.
 * Routing: workshop → detail page, article → InstrumentRenderer/specific component.
 * Sub-Foyer: doe-je-mee, quiz, faq, contact (World 2 info pages).
 * Nuclear Loading: Islands loaded dynamically (ssr: false).
 */

import { ContainerInstrument, HeadingInstrument, PageWrapperInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import { getStudioWorkshopsData, WorkshopApiResponse } from "@/lib/services/studio-service";
import { createClient } from "@supabase/supabase-js";
import { MarketManager } from "@/lib/system/core/market-manager";

// NUCLEAR ISLANDS (ssr: false)
const WorkshopHeroIsland = nextDynamic(() => import("@/components/studio/WorkshopHeroIsland").then(mod => mod.WorkshopHeroIsland), { ssr: false });
const SkillDNAIsland = nextDynamic(() => import("@/components/studio/SkillDNAIsland").then(mod => mod.SkillDNAIsland), { ssr: false });
const DayScheduleIsland = nextDynamic(() => import("@/components/studio/DayScheduleIsland").then(mod => mod.DayScheduleIsland), { ssr: false });
const InstructorLocationIsland = nextDynamic(() => import("@/components/studio/InstructorLocationIsland").then(mod => mod.InstructorLocationIsland), { ssr: false });
const ReviewGrid = nextDynamic(() => import("@/components/studio/ReviewGrid").then(mod => mod.ReviewGrid), { ssr: false });
const LiquidBackground = nextDynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { ssr: false });
const WorkshopInterestForm = nextDynamic(() => import("@/components/studio/WorkshopInterestForm").then(mod => mod.WorkshopInterestForm), { ssr: false });
const WorkshopQuiz = nextDynamic(() => import("@/components/studio/WorkshopQuiz").then(mod => mod.WorkshopQuiz), { ssr: false });

// 🛡️ CHRIS-PROTOCOL: SDK for slug_registry resolution
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

// 🛡️ ID-First Handshake: resolve slug via registry
interface RegistryEntry {
  entity_id: number;
  routing_type: string;
  world_id: number | null;
}

async function resolveFromRegistry(slug: string): Promise<RegistryEntry | null> {
  try {
    const lookupSlug = `studio/${slug}`.toLowerCase();
    const { data } = await supabase
      .from('slug_registry')
      .select('entity_id, routing_type, world_id')
      .eq('slug', lookupSlug)
      .eq('is_active', true)
      .maybeSingle();
    return data || null;
  } catch {
    return null;
  }
}

async function getWorkshopByEntityId(entityId: number): Promise<WorkshopApiResponse['workshops'][number] | null> {
  try {
    const data = await getStudioWorkshopsData();
    return data.workshops.find(w => w.id === entityId) || null;
  } catch {
    return null;
  }
}

async function getWorkshopBySlug(slug: string): Promise<WorkshopApiResponse['workshops'][number] | null> {
  try {
    const data = await getStudioWorkshopsData();
    return data.workshops.find(w => w.slug === slug || w.id.toString() === slug) || null;
  } catch {
    return null;
  }
}

// 🛡️ CHRIS-PROTOCOL: Metadata via ID-First
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const entry = await resolveFromRegistry(params.slug);

  if (entry?.routing_type === 'article') {
    const { data: article } = await supabase
      .from('content_articles')
      .select('title')
      .eq('id', entry.entity_id)
      .maybeSingle();
    return { title: article?.title || 'Voices Studio' };
  }

  if (entry?.routing_type === 'workshop') {
    const workshop = await getWorkshopByEntityId(entry.entity_id);
    if (workshop) {
      return {
        title: `${workshop.title} | Voices Studio`,
        description: workshop.expert_note || workshop.description,
        openGraph: {
          images: workshop.featured_image ? [`https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/${workshop.featured_image.file_path}`] : []
        }
      };
    }
  }

  // Fallback: special component routes
  const specialTitles: Record<string, string> = {
    'doe-je-mee': 'Doe je mee? | Voices Studio',
    'quiz': 'Workshop Quiz | Voices Studio',
  };
  if (specialTitles[params.slug]) return { title: specialTitles[params.slug] };

  // Fallback: try workshop by slug directly (Lazy Discovery)
  const workshop = await getWorkshopBySlug(params.slug);
  if (workshop) {
    return {
      title: `${workshop.title} | Voices Studio`,
      description: workshop.expert_note || workshop.description,
    };
  }

  return { title: "Voices Studio" };
}

export default async function StudioSlugPage({ params }: { params: { slug: string } }) {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STAP 1: ID-First Handshake via slug_registry
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const entry = await resolveFromRegistry(params.slug);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STAP 2: Route op basis van routing_type
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // 2A: Workshop (entity_type = workshop in registry)
  if (entry?.routing_type === 'workshop') {
    const workshop = await getWorkshopByEntityId(entry.entity_id);
    if (workshop) return renderWorkshopDetail(workshop);
  }

  // 2B: Article (sub-foyer CMS pages: faq, contact, etc.)
  if (entry?.routing_type === 'article') {
    return await renderSubFoyerArticle(entry.entity_id, params.slug);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STAP 3: Special component routes (geen registry entry)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (params.slug === 'doe-je-mee') {
    return (
      <PageWrapperInstrument className="bg-va-off-white">
        <Suspense fallback={null}><LiquidBackground /></Suspense>
        <ContainerInstrument className="py-32 max-w-4xl mx-auto">
          <ContainerInstrument plain className="mb-16 text-center">
            <HeadingInstrument level={1} className="text-5xl font-light tracking-tighter mb-4">
              <VoiceglotText translationKey="studio.interest.title" defaultText="Doe je mee?" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 font-light">
              <VoiceglotText translationKey="studio.interest.subtitle" defaultText="Laat ons weten welke workshop je interesseert." />
            </TextInstrument>
          </ContainerInstrument>
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STAP 4: Lazy Discovery — workshop niet in registry maar wel in DB
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const workshopFallback = await getWorkshopBySlug(params.slug);
  if (workshopFallback) return renderWorkshopDetail(workshopFallback);

  // Niets gevonden
  notFound();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RENDER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function renderWorkshopDetail(workshop: WorkshopApiResponse['workshops'][number]) {
  return (
    <PageWrapperInstrument className="bg-va-off-white min-h-screen pb-32">
      <Suspense fallback={<ContainerInstrument className="h-[600px] bg-va-black animate-pulse" />}>
        <WorkshopHeroIsland workshop={workshop} />
      </Suspense>

      <ContainerInstrument className="max-w-7xl mx-auto px-6 mt-24 space-y-32">
        <Suspense fallback={<ContainerInstrument className="h-96 bg-white rounded-[30px] animate-pulse" />}>
          <SkillDNAIsland workshop={workshop} />
        </Suspense>

        <Suspense fallback={<ContainerInstrument className="h-96 bg-white rounded-[30px] animate-pulse" />}>
          <DayScheduleIsland workshop={workshop} />
        </Suspense>

        <Suspense fallback={<ContainerInstrument className="h-96 bg-white rounded-[30px] animate-pulse" />}>
          <InstructorLocationIsland workshop={workshop} />
        </Suspense>
      </ContainerInstrument>

      <ContainerInstrument plain className="mt-32">
        <Suspense fallback={<ContainerInstrument className="h-96 bg-va-off-white animate-pulse" />}>
          <ReviewGrid
            reviews={workshop.reviews}
            title={`Wat deelnemers zeggen over ${workshop.title}`}
            maxItems={6}
          />
        </Suspense>
      </ContainerInstrument>
    </PageWrapperInstrument>
  );
}

async function renderSubFoyerArticle(entityId: number, slug: string) {
  // FAQ: entity opgehaald via ID, FAQs via studio-service (Source of Truth)
  if (slug === 'faq') {
    const { faqs } = await getStudioWorkshopsData();
    return (
      <PageWrapperInstrument className="bg-va-off-white">
        <Suspense fallback={null}><LiquidBackground /></Suspense>
        <ContainerInstrument className="max-w-4xl mx-auto px-6 py-32">
          <ContainerInstrument plain className="text-center mb-20">
            <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
              <VoiceglotText translationKey="studio.faq.label" defaultText="Veelgestelde Vragen" />
            </TextInstrument>
            <HeadingInstrument level={1} className="text-4xl md:text-5xl font-light tracking-tighter text-va-black">
              <VoiceglotText translationKey="studio.faq.title" defaultText="Alles wat je moet weten over onze workshops" />
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

  // Contact: Studio-specifieke contactinfo
  if (slug === 'contact') {
    const studioMarket = MarketManager.getCurrentMarket('voices.be', '/studio/contact');
    const studioAddress = (studioMarket.address || {}) as {
      street?: string;
      number?: string;
      city?: string;
      postal_code?: string;
    };
    const contactEmail = studioMarket.email || '';
    const contactPhone = studioMarket.phone || '';
    const contactStreet = [studioAddress.street, studioAddress.number].filter(Boolean).join(' ').trim();
    const contactCity = [studioAddress.postal_code, studioAddress.city].filter(Boolean).join(' ').trim();

    return (
      <PageWrapperInstrument className="bg-va-off-white">
        <Suspense fallback={null}><LiquidBackground /></Suspense>
        <ContainerInstrument className="max-w-4xl mx-auto px-6 py-32">
          <ContainerInstrument plain className="text-center mb-20">
            <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
              <VoiceglotText translationKey="studio.contact.label" defaultText="Contact" />
            </TextInstrument>
            <HeadingInstrument level={1} className="text-4xl md:text-5xl font-light tracking-tighter text-va-black mb-4">
              <VoiceglotText translationKey="studio.contact.title" defaultText="Voices Studio" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 font-light text-lg">
              <VoiceglotText translationKey="studio.contact.subtitle" defaultText="Heb je vragen over onze workshops of wil je meer weten? Neem gerust contact op." />
            </TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ContainerInstrument className="bg-white rounded-[20px] p-8 border border-black/[0.03] shadow-aura space-y-4">
              <HeadingInstrument level={3} className="text-xl font-light text-va-black"><VoiceglotText translationKey="studio.contact.reach" defaultText="Bereikbaarheid" /></HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light"><VoiceglotText translationKey="studio.contact.email" defaultText={`E-mail: ${contactEmail || 'op aanvraag'}`} noTranslate /></TextInstrument>
              <TextInstrument className="text-va-black/60 font-light"><VoiceglotText translationKey="studio.contact.phone" defaultText={`Telefoon: ${contactPhone || 'op aanvraag'}`} noTranslate /></TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="bg-va-black text-white rounded-[20px] p-8 shadow-aura-lg space-y-4">
              <HeadingInstrument level={3} className="text-xl font-light text-white"><VoiceglotText translationKey="studio.contact.studio_title" defaultText="De Studio" /></HeadingInstrument>
              <TextInstrument className="text-white/60 font-light"><VoiceglotText translationKey="studio.contact.address" defaultText={contactStreet || 'Adres op aanvraag'} noTranslate /></TextInstrument>
              <TextInstrument className="text-white/60 font-light"><VoiceglotText translationKey="studio.contact.city" defaultText={contactCity || 'Locatie op aanvraag'} noTranslate /></TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </PageWrapperInstrument>
    );
  }

  // Generieke article: ophalen via entity_id en renderen
  const { data: article } = await supabase
    .from('content_articles')
    .select('*, content_blocks(*)')
    .eq('id', entityId)
    .maybeSingle();

  if (article?.content_blocks?.length > 0) {
    const { InstrumentRenderer } = await import("@/components/ui/InstrumentRenderer");
    return (
      <PageWrapperInstrument className="bg-va-off-white">
        <Suspense fallback={null}><LiquidBackground /></Suspense>
        <InstrumentRenderer blocks={article.content_blocks} />
      </PageWrapperInstrument>
    );
  }

  notFound();
}
