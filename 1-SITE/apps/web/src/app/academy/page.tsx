import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  LoadingScreenInstrument,
  HeadingInstrument,
  TextInstrument,
  ButtonInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { ReviewsInstrument } from "@/components/ui/ReviewsInstrument";
import { AcademyTipWidget } from "@/components/academy/AcademyTipWidget";
import { db } from '@db';
import { lessons as lessonsTable } from '@db/schema';
import { asc, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { Play } from "lucide-react";
import Link from "next/link";

/**
 * ACADEMY
 * Persona: 'Praktische Mentor'
 */

async function LessonGrid() {
  const lessons = await db.query.lessons.findMany({
    orderBy: [asc(lessonsTable.displayOrder)],
  });

  const enrollmentPrice = 149;

  if (lessons.length === 0) {
    // Fallback voor demo doeleinden als de DB leeg is
    const fallbackLessons = [
      { id: 1, title: 'Wat doet een voice-over eigenlijk?', description: 'De essentie van het vak: waarom je geen voorlezer bent, maar een gids.', duration: '15 min' },
      { id: 2, title: 'Je stem mag klinken', description: 'Durf ruimte in te nemen met je klank.', duration: '20 min' },
      { id: 3, title: 'Spreken voor iemand', description: 'Leer hoe je een onzichtbare luisteraar raakt.', duration: '25 min' }
    ];
    return (
      <ContainerInstrument className="space-y-24">
        {/* 💡 ACADEMY TIPS FOR STUDENTS */}
        <ContainerInstrument className="px-8 mb-12">
          <div className="max-w-xl">
            <AcademyTipWidget userId={0} />
          </div>
        </ContainerInstrument>

        <BentoGrid columns={3} className="px-8">
          {fallbackLessons.map((lesson) => (
            <BentoCard 
              key={lesson.id} 
              span="md"
              className="group p-8 bg-white hover:bg-black transition-all duration-700"
            >
              <HeadingInstrument level={3} className="text-4xl font-black tracking-tighter leading-[0.9] mb-8 text-black group-hover:text-white transition-colors">
                <VoiceglotText translationKey={`academy.lesson.${lesson.id}.title`} defaultText={lesson.title} />
              </HeadingInstrument>
              <TextInstrument className="text-black/40 group-hover:text-white/40 text-sm mb-8 font-medium leading-relaxed">
                {lesson.description}
              </TextInstrument>
              <Link href={`/academy/lesson/${lesson.id}`} className="mt-auto flex justify-between items-end">
                <ContainerInstrument>
                  <TextInstrument className="text-[10px] text-black/40 group-hover:text-white/40 font-bold uppercase tracking-widest mb-1 transition-colors">
                    <VoiceglotText translationKey="academy.start_now" defaultText="Start nu" />
                  </TextInstrument>
                  <TextInstrument as="span" className="text-2xl font-black tracking-tighter text-black group-hover:text-white transition-colors">
                    <VoiceglotText translationKey="academy.view_lesson" defaultText="Bekijk les" />
                  </TextInstrument>
                </ContainerInstrument>
                <ButtonInstrument className="va-btn-pro !bg-black group-hover:!bg-white group-hover:!text-black !rounded-va-md !px-6 transition-all">
                  <Play size={16} fill="currentColor" />
                </ButtonInstrument>
              </Link>
            </BentoCard>
          ))}
        </BentoGrid>
      </ContainerInstrument>
    );
  }

  return (
    <ContainerInstrument className="space-y-24">
      {/* 💡 ACADEMY TIPS FOR STUDENTS */}
      <ContainerInstrument className="px-8 mb-12">
        <div className="max-w-xl">
          <AcademyTipWidget userId={0} />
        </div>
      </ContainerInstrument>

      <BentoGrid columns={3} className="px-8">
        {lessons.map((lesson) => (
          <BentoCard 
            key={lesson.id} 
            span="md"
            className="group p-8 bg-white hover:bg-black transition-all duration-700"
            data-voices-context="lesson-card"
            data-voices-intent="start-learning"
          >
            <ContainerInstrument className="flex justify-between items-start mb-12">
              <ContainerInstrument className="bg-black/5 group-hover:bg-white/10 text-black group-hover:text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest transition-colors">
                <VoiceglotText translationKey="academy.badge" defaultText="Academy" />
              </ContainerInstrument>
              <TextInstrument className="text-[10px] font-bold text-black/30 group-hover:text-white/30 uppercase tracking-widest transition-colors">
                <VoiceglotText translationKey="academy.type" defaultText="Lessen" />
              </TextInstrument>
            </ContainerInstrument>

            <HeadingInstrument level={3} className="text-4xl font-black tracking-tighter leading-[0.9] mb-8 text-black group-hover:text-white transition-colors">
              <VoiceglotText translationKey={`academy.lesson.${lesson.id}.title`} defaultText={lesson.title} />
            </HeadingInstrument>
            
            <TextInstrument className="text-black/40 group-hover:text-white/40 text-sm mb-8 font-medium leading-relaxed">
              <VoiceglotText translationKey={`academy.lesson.${lesson.id}.description`} defaultText={lesson.description || ""} />
            </TextInstrument>

            <Link href={`/academy/lesson/${lesson.id}`} className="mt-auto flex justify-between items-end">
              <ContainerInstrument>
                <TextInstrument className="text-[10px] text-black/40 group-hover:text-white/40 font-bold uppercase tracking-widest mb-1 transition-colors">
                  <VoiceglotText translationKey="academy.start_now" defaultText="Start nu" />
                </TextInstrument>
                <TextInstrument as="span" className="text-2xl font-black tracking-tighter text-black group-hover:text-white transition-colors">
                  <VoiceglotText translationKey="academy.view_lesson" defaultText="Bekijk les" />
                </TextInstrument>
              </ContainerInstrument>
              <ButtonInstrument className="va-btn-pro !bg-black group-hover:!bg-white group-hover:!text-black !rounded-va-md !px-6 transition-all">
                <Play size={16} fill="currentColor" />
              </ButtonInstrument>
            </Link>
          </BentoCard>
        ))}
      </BentoGrid>
      
      {/* 🌟 ACADEMY REVIEWS */}
      <AcademyReviews />
    </ContainerInstrument>
  );
}

async function AcademyReviews() {
  const dbReviewsRaw = await db.execute(sql`SELECT * FROM reviews WHERE business_slug = 'academy' LIMIT 3`);
  const dbReviews = (dbReviewsRaw as any) || [];

  const mappedReviews = dbReviews.map((r: any) => ({
    name: r.author_name || r.authorName,
    text: r.text_nl || r.textNl || r.text_en || r.textEn,
    rating: r.rating,
    date: new Date(r.created_at || r.createdAt || Date.now()).toLocaleDateString('nl-BE')
  }));

  if (mappedReviews.length === 0) return null;

  return (
    <ContainerInstrument className="px-8">
      <div className="space-y-8">
        <HeadingInstrument level={2} className="text-4xl font-black tracking-tighter">
          <VoiceglotText translationKey="academy.reviews.title" defaultText="Academy Ervaringen" />
        </HeadingInstrument>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mappedReviews.map((review: any, i: number) => (
            <div key={i} className="p-8 bg-white rounded-3xl border border-gray-100">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className={j < review.rating ? "text-yellow-400" : "text-gray-200"}>★</span>
                ))}
              </div>
              <TextInstrument className="text-lg font-medium mb-6 italic">
                &quot;<VoiceglotText translationKey={`academy.review.${i}.text`} defaultText={review.text} />&quot;
              </TextInstrument>
              <div className="mt-auto">
                <TextInstrument className="font-black text-sm uppercase tracking-widest">{review.name}</TextInstrument>
                <TextInstrument className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{review.date}</TextInstrument>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ContainerInstrument>
  );
}

import { getArticle } from "@/lib/api-server";

/**
 * ACADEMY
 * Persona: 'Praktische Mentor'
 */

export default async function AcademyPage() {
  const headerList = headers();
  const market = headerList.get('x-voices-market') || 'NL';
  const lang = headerList.get('x-voices-lang') || 'nl';

  // 🚀 NUCLEAR CONTENT: Haal pagina data uit de database via Page Architect
  const pageData = await getArticle('academy', lang);

  return (
    <PageWrapperInstrument className="min-h-screen pt-24 pb-24 bg-va-off-white">
      <LiquidBackground />

      <SectionInstrument className="mb-16">
        <ContainerInstrument>
          <ContainerInstrument className="inline-block bg-black text-white text-[10px] font-black px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
            <VoiceglotText translationKey="academy.hero.badge" defaultText="Academy" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-[8vw] md:text-[6vw] font-black tracking-tighter leading-[0.85] mb-8">
            <VoiceglotText 
              translationKey="page.academy.title" 
              defaultText={pageData?.title || "Ontwikkel je eigen stem."} 
            />
          </HeadingInstrument>
          <TextInstrument className="text-2xl md:text-3xl text-black/40 font-medium leading-tight tracking-tight max-w-3xl">
            <VoiceglotText 
              translationKey="page.academy.subtitle" 
              defaultText={pageData?.iapContext?.voicy_nudge || "Geen trucjes, maar het ambacht van betekenis geven. Leer hoe je een luisteraar echt bereikt."} 
            />
          </TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* 🚀 DYNAMIC BLOCKS FROM PAGE ARCHITECT */}
      {pageData?.blocks?.map((block: any, i: number) => (
        <SectionInstrument key={i} className="mb-12">
          <ContainerInstrument className="max-w-4xl prose prose-va">
            <VoiceglotText 
              translationKey={`page.academy.block.${i}`} 
              defaultText={block.content} 
              as="div"
            />
          </ContainerInstrument>
        </SectionInstrument>
      ))}

      <Suspense fallback={<LoadingScreenInstrument />}>
        <LessonGrid />
      </Suspense>

      {/* 🧠 LLM CONTEXT (Compliance) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Voices Academy",
            "description": "Ontwikkel je eigen stem. Leer hoe je een luisteraar echt bereikt.",
            "_llm_context": {
              "persona": "Praktische Mentor",
              "journey": "academy",
              "intent": "learning_discovery",
              "capabilities": ["view_lessons", "start_learning", "get_feedback"],
              "lexicon": ["Les", "Ambacht", "Betekenis geven"],
              "visual_dna": ["Bento Grid", "Liquid DNA", "Spatial Growth"]
            }
          })
        }}
      />

      {/* 🚀 ACADEMY CTA AREA */}
      <SectionInstrument className="px-8 mt-24">
        <BentoCard span="xl" className="bg-va-black p-16 text-white text-center space-y-8 overflow-hidden relative">
          <ContainerInstrument className="relative z-10 space-y-6">
            <HeadingInstrument level={2} className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              <VoiceglotText translationKey="academy.cta.title" defaultText="Vervolg je traject" />
            </HeadingInstrument>
            <TextInstrument className="text-xl md:text-2xl text-white/40 font-medium max-w-2xl mx-auto">
              <VoiceglotText 
                translationKey="academy.cta.text" 
                defaultText={`Krijg toegang tot de volledige 20 lessen, de professionele workflow en persoonlijke feedback op al je opnames voor €149.`} 
              />
            </TextInstrument>
            <ContainerInstrument className="pt-8">
              <Link 
                href={`/checkout?journey=academy&price=149`} 
                className="va-btn-pro !bg-white !text-black !px-16 !py-6 !text-xl hover:scale-105 transition-transform"
              >
                <VoiceglotText translationKey="academy.cta.button" defaultText="Schrijf je in" />
              </Link>
            </ContainerInstrument>
          </ContainerInstrument>
        </BentoCard>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
