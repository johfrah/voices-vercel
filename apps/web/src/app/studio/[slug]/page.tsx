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
import { getStudioWorkshopsData, WorkshopApiResponse } from "@/lib/services/studio-service";
import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// NUCLEAR ISLANDS (ssr: false)
const WorkshopHeroIsland = nextDynamic(() => import("@/components/studio/WorkshopHeroIsland").then(mod => mod.WorkshopHeroIsland), { ssr: false });
const SkillDNAIsland = nextDynamic(() => import("@/components/studio/SkillDNAIsland").then(mod => mod.SkillDNAIsland), { ssr: false });
const DayScheduleIsland = nextDynamic(() => import("@/components/studio/DayScheduleIsland").then(mod => mod.DayScheduleIsland), { ssr: false });
const InstructorLocationIsland = nextDynamic(() => import("@/components/studio/InstructorLocationIsland").then(mod => mod.InstructorLocationIsland), { ssr: false });
const ReviewGrid = nextDynamic(() => import("@/components/studio/ReviewGrid").then(mod => mod.ReviewGrid), { ssr: false });
const LiquidBackground = nextDynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { ssr: false });
const VideoPlayerDynamic = nextDynamic(() => import("@/components/ui/VideoPlayer").then(mod => mod.VideoPlayer), { ssr: false });
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
      const { AssetManager } = await import('@/lib/system/core/asset-manager');
      return {
        title: `${workshop.title} | Voices Studio`,
        description: workshop.expert_note || workshop.description,
        openGraph: {
          images: workshop.featured_image ? [AssetManager.constructStorageUrl(workshop.featured_image.file_path)] : []
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

async function AftermovieVideo({ videoPath }: { videoPath: string }) {
  const { AssetManager } = await import('@/lib/system/core/asset-manager');
  return (
    <VideoPlayerDynamic
      src={AssetManager.constructStorageUrl(videoPath)}
      className="w-full h-full object-cover"
      autoPlay={false}
      muted={true}
    />
  );
}

function renderWorkshopDetail(workshop: WorkshopApiResponse['workshops'][number]) {
  const hasUpcomingEdition = Array.isArray(workshop.upcoming_editions) && workshop.upcoming_editions.length > 0;

  return (
    <PageWrapperInstrument className="bg-va-off-white min-h-screen pb-32">
      <Suspense fallback={<ContainerInstrument className="h-[600px] bg-va-black animate-pulse" />}>
        <WorkshopHeroIsland workshop={workshop} />
      </Suspense>

      {/* Workshop Content: short_description + workshop_content_detail */}
      {(workshop.short_description || workshop.workshop_content_detail) && (
        <ContainerInstrument className="max-w-4xl mx-auto px-6 mt-24 space-y-8">
          {workshop.short_description && (
            <ContainerInstrument plain>
              <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
                <VoiceglotText translationKey="studio.detail.about_label" defaultText="Over deze workshop" />
              </TextInstrument>
              <TextInstrument className="text-xl md:text-2xl font-light text-va-black/70 leading-relaxed">
                {workshop.short_description}
              </TextInstrument>
            </ContainerInstrument>
          )}
          {workshop.workshop_content_detail && (
            <ContainerInstrument className="bg-white rounded-[24px] p-8 md:p-10 border border-black/[0.03] shadow-aura">
              <HeadingInstrument level={3} className="text-2xl font-light tracking-tighter text-va-black mb-6">
                <VoiceglotText translationKey="studio.detail.content_title" defaultText="Wat ga je leren?" />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light leading-relaxed whitespace-pre-line">
                {workshop.workshop_content_detail}
              </TextInstrument>
            </ContainerInstrument>
          )}
        </ContainerInstrument>
      )}

      {/* Aftermovie sectie met video */}
      {(workshop.aftermovie_description || workshop.aftermovie_video) && (
        <ContainerInstrument className="max-w-5xl mx-auto px-6 mt-24">
          <ContainerInstrument plain className="mb-8">
            <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
              <VoiceglotText translationKey="studio.detail.aftermovie_label" defaultText="Een blik achter de schermen" />
            </TextInstrument>
            <HeadingInstrument level={2} className="text-3xl md:text-4xl font-light tracking-tighter text-va-black">
              <VoiceglotText translationKey="studio.detail.aftermovie_title" defaultText="Zo ziet een workshopdag eruit" />
            </HeadingInstrument>
          </ContainerInstrument>
          <ContainerInstrument plain className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {workshop.aftermovie_video && (
              <ContainerInstrument plain className="lg:col-span-5 flex justify-center">
                <ContainerInstrument plain className="w-full max-w-[320px] aspect-[9/16] rounded-[24px] overflow-hidden shadow-2xl">
                  <Suspense fallback={<ContainerInstrument className="w-full h-full bg-va-black animate-pulse" />}>
                    <AftermovieVideo videoPath={workshop.aftermovie_video.file_path} />
                  </Suspense>
                </ContainerInstrument>
              </ContainerInstrument>
            )}
            {workshop.aftermovie_description && (
              <ContainerInstrument plain className={workshop.aftermovie_video ? "lg:col-span-7" : "lg:col-span-12"}>
                <TextInstrument className="text-va-black/50 font-light leading-relaxed whitespace-pre-line text-[15px]">
                  {workshop.aftermovie_description}
                </TextInstrument>
              </ContainerInstrument>
            )}
          </ContainerInstrument>
        </ContainerInstrument>
      )}

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

      {/* Workshop-specifieke FAQ's */}
      {workshop.faqs && workshop.faqs.length > 0 && (
        <ContainerInstrument className="max-w-4xl mx-auto px-6 mt-32">
          <ContainerInstrument plain className="text-center mb-16">
            <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
              <VoiceglotText translationKey="studio.detail.faq_label" defaultText="Vragen over deze workshop" />
            </TextInstrument>
            <HeadingInstrument level={2} className="text-3xl md:text-4xl font-light tracking-tighter text-va-black">
              <VoiceglotText translationKey="studio.detail.faq_title" defaultText="Veelgestelde vragen" />
            </HeadingInstrument>
          </ContainerInstrument>
          <ContainerInstrument plain className="space-y-4">
            {workshop.faqs.map((faq: { id: number; question: string; answer: string }) => (
              <ContainerInstrument key={faq.id} className="bg-white rounded-[20px] p-8 border border-black/[0.03] shadow-aura">
                <HeadingInstrument level={4} className="text-lg font-light text-va-black mb-3">{faq.question}</HeadingInstrument>
                <TextInstrument className="text-va-black/50 font-light leading-relaxed">{faq.answer}</TextInstrument>
              </ContainerInstrument>
            ))}
          </ContainerInstrument>
        </ContainerInstrument>
      )}

      {/* Feedback Snippets (Interne feedback als social proof) */}
      {workshop.feedback_snippets && workshop.feedback_snippets.length > 0 && (
        <ContainerInstrument className="max-w-4xl mx-auto px-6 mt-16">
          <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-6">
            <VoiceglotText translationKey="studio.detail.feedback_label" defaultText="Wat deelnemers het meest waardeerden" />
          </TextInstrument>
          <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workshop.feedback_snippets.slice(0, 6).map((fb: { text: string; rating: number }, i: number) => (
              <ContainerInstrument key={i} className="bg-white rounded-[16px] p-6 border border-black/[0.03] shadow-aura">
                <TextInstrument className="text-primary text-[13px] mb-2">{'⭐'.repeat(fb.rating || 5)}</TextInstrument>
                <TextInstrument className="text-[14px] text-va-black/60 font-light leading-relaxed italic">
                  &ldquo;{fb.text}&rdquo;
                </TextInstrument>
              </ContainerInstrument>
            ))}
          </ContainerInstrument>
        </ContainerInstrument>
      )}

      {/* Volgende Stappen (Related Journeys) */}
      {workshop.next_steps && workshop.next_steps.length > 0 && (
        <ContainerInstrument className="max-w-4xl mx-auto px-6 mt-32">
          <ContainerInstrument plain className="text-center mb-12">
            <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
              <VoiceglotText translationKey="studio.detail.next_label" defaultText="Verder groeien?" />
            </TextInstrument>
            <HeadingInstrument level={2} className="text-3xl md:text-4xl font-light tracking-tighter text-va-black">
              <VoiceglotText translationKey="studio.detail.next_title" defaultText="Aanbevolen vervolgworkshops" />
            </HeadingInstrument>
          </ContainerInstrument>
          <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workshop.next_steps.map((step: { label: string; slug: string; title: string }, i: number) => (
              <ContainerInstrument key={i} className="bg-white rounded-[20px] p-8 border border-black/[0.03] shadow-aura hover:shadow-aura-lg transition-all duration-500 group cursor-pointer">
                <a href={`/studio/${step.slug}`} className="block space-y-3">
                  <TextInstrument className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary">
                    {step.label}
                  </TextInstrument>
                  <HeadingInstrument level={4} className="text-xl font-light tracking-tight text-va-black group-hover:text-primary transition-colors">
                    {step.title}
                  </HeadingInstrument>
                </a>
              </ContainerInstrument>
            ))}
          </ContainerInstrument>
        </ContainerInstrument>
      )}

      {!hasUpcomingEdition && (
        <ContainerInstrument id="workshop-interest-form" className="max-w-5xl mx-auto px-6 mt-24">
          <ContainerInstrument plain className="text-center mb-12">
            <TextInstrument className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
              <VoiceglotText translationKey="studio.detail.interest_label" defaultText="Interesselijst" />
            </TextInstrument>
            <HeadingInstrument level={2} className="text-3xl md:text-4xl font-light tracking-tighter text-va-black mb-4">
              <VoiceglotText translationKey="studio.detail.interest_title" defaultText="Nog geen datum? Zet je op de lijst." />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/50 font-light leading-relaxed max-w-2xl mx-auto">
              <VoiceglotText
                translationKey="studio.detail.interest_subtitle"
                defaultText="Laat je gegevens achter en we contacteren je als er een nieuwe editie voor deze workshop gepland staat."
              />
            </TextInstrument>
          </ContainerInstrument>
          <WorkshopInterestForm preselectedWorkshopId={workshop.id} hideWorkshopSelection />
        </ContainerInstrument>
      )}

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
              <TextInstrument className="text-va-black/60 font-light"><VoiceglotText translationKey="studio.contact.email" defaultText="E-mail: studio@voices.be" noTranslate /></TextInstrument>
              <TextInstrument className="text-va-black/60 font-light"><VoiceglotText translationKey="studio.contact.phone" defaultText="Telefoon: +32 (0)2 793 19 91" noTranslate /></TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="bg-va-black text-white rounded-[20px] p-8 shadow-aura-lg space-y-4">
              <HeadingInstrument level={3} className="text-xl font-light text-white"><VoiceglotText translationKey="studio.contact.studio_title" defaultText="De Studio" /></HeadingInstrument>
              <TextInstrument className="text-white/60 font-light"><VoiceglotText translationKey="studio.contact.address" defaultText="Jules Delhaizestraat 42" noTranslate /></TextInstrument>
              <TextInstrument className="text-white/60 font-light"><VoiceglotText translationKey="studio.contact.city" defaultText="1080 Brussel (Molenbeek)" noTranslate /></TextInstrument>
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
