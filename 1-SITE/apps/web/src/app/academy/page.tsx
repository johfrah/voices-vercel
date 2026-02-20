import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    LoadingScreenInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { db } from '@db';
import { lessons as lessonsTable } from '@db/schema';
import { asc, sql } from 'drizzle-orm';
import { Play, ArrowRight, Mic, Video, Globe, MessageSquare, Clock, Award, Zap, Info } from "lucide-react";
import { headers } from 'next/headers';
import Link from "next/link";
import { Suspense } from 'react';
import { getArticle, getActor } from "@/lib/api-server";
import { SlimmeKassa } from "@/lib/pricing-engine";
import Image from "next/image";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { StudioVideoPlayer } from "@/components/ui/StudioVideoPlayer";
import { ReviewsInstrument } from "@/components/ui/ReviewsInstrument";
import { createClient } from "@/utils/supabase/server";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

/**
 * ACADEMY SALES PAGE (2026)
 */

async function LessonGrid() {
  let lessons: any[] = [];
  try {
    lessons = await db.query.lessons.findMany({
      orderBy: [asc(lessonsTable.displayOrder)],
    });
    console.log('✅ LessonGrid: Found', lessons.length, 'lessons in DB');
  } catch (error) {
    console.error('❌ LessonGrid: Failed to fetch lessons from DB:', error);
  }

  if (!lessons || lessons.length === 0) {
    lessons = [
      { id: 1, displayOrder: 1, title: 'Wat doet een voice-over eigenlijk?', description: 'De essentie van het vak: waarom je geen voorlezer bent, maar een gids.', duration: '15 min' },
      { id: 2, displayOrder: 2, title: 'Je stem mag klinken', description: 'Durf ruimte in te nemen met je klank.', duration: '20 min' },
      { id: 3, displayOrder: 3, title: 'Spreken voor iemand', description: 'Leer hoe je een onzichtbare luisteraar raakt.', duration: '25 min' }
    ];
  }

  return (
    <BentoGrid strokeWidth={1.5} columns={3} className="px-0">
      {lessons.map((lesson) => (
        <BentoCard 
          key={lesson.id} 
          span="md"
          className="group p-10 bg-white hover:bg-va-black transition-all duration-700 rounded-[20px] shadow-aura hover:shadow-aura-lg border border-black/5"
        >
          <ContainerInstrument className="flex justify-between items-start mb-12">
            <ContainerInstrument className="bg-va-black/5 group-hover:bg-white/10 text-va-black group-hover:text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-[0.2em] uppercase transition-colors "><VoiceglotText  translationKey="academy.badge" defaultText="Academy" /></ContainerInstrument>
            <TextInstrument className="text-[11px] font-bold text-va-black/30 group-hover:text-white/30 tracking-[0.2em] uppercase transition-colors "><VoiceglotText  translationKey="academy.type" defaultText={`Les ${lesson.displayOrder || lesson.id}`} /></TextInstrument>
          </ContainerInstrument>

          <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter leading-[0.9] mb-8 text-va-black group-hover:text-white transition-colors"><VoiceglotText  translationKey={`academy.lesson.${lesson.id}.title`} defaultText={lesson.title} /></HeadingInstrument>
          <TextInstrument className="text-va-black/40 group-hover:text-white/40 text-[15px] mb-8 font-light leading-relaxed"><VoiceglotText  translationKey={`academy.lesson.${lesson.id}.description`} defaultText={lesson.description || ""} /></TextInstrument>

          <Link  href={`/academy/lesson/${lesson.displayOrder || lesson.id}`} className="mt-auto flex justify-between items-end">
            <ContainerInstrument>
              <TextInstrument className="text-[11px] text-va-black/40 group-hover:text-white/40 font-bold tracking-[0.2em] uppercase mb-1 transition-colors "><VoiceglotText  translationKey="academy.start_now" defaultText="Start nu" /></TextInstrument>
              <TextInstrument as="span" className="text-2xl font-light tracking-tighter text-va-black group-hover:text-white transition-colors"><VoiceglotText  translationKey="academy.view_lesson" defaultText="Bekijk les" /></TextInstrument>
            </ContainerInstrument>
            <ButtonInstrument className="!bg-va-black group-hover:!bg-white group-hover:!text-va-black !rounded-[10px] !px-6 transition-all">
              <Play strokeWidth={1.5} size={16} fill="currentColor" />
            </ButtonInstrument>
          </Link>
        </BentoCard>
      ))}
    </BentoGrid>
  );
}

async function AcademyReviewsWrapper() {
  let dbReviews: any[] = [];
  try {
    const dbReviewsRaw = await db.execute(sql`SELECT * FROM reviews WHERE business_slug = 'academy' LIMIT 10`);
    dbReviews = (dbReviewsRaw as unknown as any[]) || [];
  } catch (error) {
    console.error('❌ AcademyReviews: Failed to fetch reviews from DB:', error);
  }

  const mappedReviews = dbReviews.map((r: any) => ({
    id: r.id,
    name: r.author_name || r.authorName,
    text: r.text_nl || r.textNl || r.text_en || r.textEn,
    rating: r.rating,
    date: new Date(r.created_at || r.createdAt || Date.now()).toLocaleDateString('nl-BE'),
    authorPhotoUrl: r.author_photo_url || r.authorPhotoUrl
  }));

  if (mappedReviews.length === 0) return null;

  return (
    <ReviewsInstrument 
      reviews={mappedReviews} 
      title="Academy Ervaringen"
      subtitle="Lees hoe anderen hun stem hebben ontdekt."
      averageRating="5.0"
      totalReviews={String(mappedReviews.length)}
    />
  );
}

export default async function AcademyPage() {
  const headerList = headers();
  const lang = headerList.get('x-voices-lang') || 'nl';

  const supabase = createClient();
  const supabaseUser = supabase ? (await supabase.auth.getUser()).data.user : null;

  let userProfile: any = null;
  if (supabaseUser?.email) {
    try {
      const [dbUser] = await db.select().from(users).where(eq(users.email, supabaseUser.email!)).limit(1);
      userProfile = dbUser;
    } catch (e) {}
  }

  const isAdmin = userProfile?.role === 'admin' || supabaseUser?.app_metadata?.role === 'admin' || supabaseUser?.user_metadata?.role === 'admin';

  let pageData: any = null;
  try {
    pageData = await getArticle('academy', lang);
  } catch (error) {
    console.error('❌ AcademyPage: Failed to fetch page data:', error);
  }

  let johfrah: any = null;
  try {
    johfrah = await getActor('johfrah', lang);
  } catch (error) {
    console.error('❌ AcademyPage: Failed to fetch Johfrah data:', error);
  }
  
  const enrollmentPrice = SlimmeKassa.format(SlimmeKassa.calculate({ usage: 'subscription', plan: 'pro', actorRates: {}, journey: 'academy' } as any).total);

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white selection:bg-primary selection:text-white">
      <Suspense fallback={null}>
        <LiquidBackground />
      </Suspense>

      {/* 1. HERO SECTION (VOICES-VIDEO-LEFT STANDARD) */}
      <SectionInstrument id="hero" className="relative pt-48 pb-32 overflow-hidden">
        <ContainerInstrument className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[0.45fr_0.55fr] gap-24 items-center">
            <ContainerInstrument className="flex justify-center order-2 lg:order-1">
              <ContainerInstrument className="voices-hero-visual-container w-full max-w-[365px] aspect-[9/16] max-h-[650px] rounded-[32px] overflow-hidden shadow-aura-lg relative group bg-va-black">
                <Suspense fallback={<ContainerInstrument className="w-full h-full bg-va-black/5 animate-pulse rounded-[32px]" />}>
                  <StudioVideoPlayer 
                    url="https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/visuals/academy/academy-hero-johfrah.mp4" 
                    aspect="portrait"
                    className="w-full h-full rounded-[32px]"
                  />
                </Suspense>
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="space-y-12 order-1 lg:order-2">
                <ContainerInstrument className="space-y-8">
                  <ContainerInstrument className="inline-flex items-center gap-3 px-4 py-1.5 bg-va-black rounded-full">
                    <Award strokeWidth={1.5} size={16} className="text-white" />
                    <TextInstrument className="text-[11px] font-bold tracking-[0.2em] text-white uppercase">
                      <VoiceglotText translationKey="academy.hero.badge" defaultText="Voices Academy" />
                    </TextInstrument>
                  </ContainerInstrument>
                  <HeadingInstrument level={1} className="text-7xl md:text-[5.5vw] font-light tracking-tighter leading-[0.85] text-va-black">
                    <VoiceglotText 
                      translationKey="page.academy.title" 
                      defaultText="Ontwikkel je eigen stem." 
                    />
                  </HeadingInstrument>
                  <TextInstrument className="text-2xl md:text-3xl text-va-black/40 font-light leading-tight tracking-tight max-w-xl">
                    <VoiceglotText 
                      translationKey="page.academy.subtitle" 
                      defaultText="Geen trucjes, maar het ambacht van betekenis geven. Leer hoe je een luisteraar echt bereikt." 
                    />
                  </TextInstrument>
                </ContainerInstrument>

                <div className="flex flex-wrap items-center gap-10 pt-6">
                  {isAdmin ? (
                    <ButtonInstrument 
                      as={Link}
                      href="#traject"
                      className="va-btn-pro !rounded-[10px] px-12 py-6 text-base shadow-aura-lg hover:scale-105 transition-transform duration-500"
                    >
                      <VoiceglotText translationKey="academy.admin.view_lessons" defaultText="Beheer de lessen" />
                    </ButtonInstrument>
                  ) : (
                    <ButtonInstrument 
                      as={Link}
                      href="#inschrijven"
                      className="va-btn-pro !rounded-[10px] px-12 py-6 text-base shadow-aura-lg hover:scale-105 transition-transform duration-500"
                    >
                      <VoiceglotText translationKey="academy.cta.enroll_now" defaultText="Start nu met leren" />
                    </ButtonInstrument>
                  )}
                  <ButtonInstrument as={Link} href="#traject" variant="plain" size="none" className="text-[13px] font-bold tracking-[0.2em] uppercase text-va-black/30 hover:text-primary transition-all duration-500 flex items-center gap-4 group">
                    <VoiceglotText translationKey="academy.cta.view_lessons" defaultText="Bekijk het traject" />
                    <ContainerInstrument className="w-12 h-12 rounded-full border border-black/5 flex items-center justify-center group-hover:border-primary/20 group-hover:bg-primary/5 transition-all duration-700 shadow-sm group-hover:shadow-aura-sm">
                      <ArrowRight strokeWidth={1.5} size={18} className="group-hover:translate-x-1.5 transition-transform duration-500 ease-va-bezier" />
                    </ContainerInstrument>
                  </ButtonInstrument>
                </div>
            </ContainerInstrument>
          </div>
        </ContainerInstrument>
      </SectionInstrument>

      {/* 2. THE PAIN (SPLIT-SCREEN RHYTHM) */}
      <SectionInstrument className="py-48 bg-white border-y border-black/[0.03]">
        <ContainerInstrument className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
            <div className="lg:col-span-5 space-y-6">
              <ContainerInstrument className="inline-flex items-center gap-3 px-4 py-1.5 bg-va-black/5 rounded-full">
                <Mic strokeWidth={1.5} size={16} className="text-va-black/40" />
                <TextInstrument className="text-[11px] font-bold tracking-[0.2em] text-va-black/40 uppercase">
                  <VoiceglotText translationKey="academy.pain.label" defaultText="De Uitdaging" />
                </TextInstrument>
              </ContainerInstrument>
              <HeadingInstrument level={2} className="text-5xl font-light tracking-tighter leading-none text-va-black">
                <VoiceglotText translationKey="academy.pain.title" defaultText="Iedereen zegt dat je een mooie stem hebt." />
              </HeadingInstrument>
              <TextInstrument className="text-2xl text-va-black/20 font-medium leading-tight tracking-tight">
                Maar waar begin je?
              </TextInstrument>
            </div>
            <div className="lg:col-span-7 space-y-12 pt-4">
              <TextInstrument className="text-2xl text-va-black/60 font-light leading-relaxed">
                <VoiceglotText translationKey="academy.pain.intro" defaultText="Je droomt ervan om teksten tot leven te wekken, maar je loopt vast op de techniek, de apparatuur of de onzekerheid of je het wel 'goed' doet. De meeste beginners verdrinken in YouTube-tutorials zonder ooit echt de essentie van het vak te leren." />
              </TextInstrument>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-black/[0.03]">
                <div className="space-y-4">
                  <HeadingInstrument level={3} className="text-xl font-light tracking-tight text-va-black">De Onzekerheid</HeadingInstrument>
                  <TextInstrument className="text-[15px] text-va-black/40 font-light leading-relaxed">Klink ik wel natuurlijk? Waarom klinkt mijn eigen opname zo anders dan wat ik op de radio hoor?</TextInstrument>
                </div>
                <div className="space-y-4">
                  <HeadingInstrument level={3} className="text-xl font-light tracking-tight text-va-black">De Techniek</HeadingInstrument>
                  <TextInstrument className="text-[15px] text-va-black/40 font-light leading-relaxed">Welke microfoon heb ik nodig? En hoe zorg ik dat ik geen last heb van galm of omgevingsgeluid?</TextInstrument>
                </div>
              </div>
            </div>
          </div>
        </ContainerInstrument>
      </SectionInstrument>

      {/* 3. THE SOLUTION (STORY LAYOUT) */}
      <SectionInstrument className="py-48 bg-va-off-white overflow-hidden">
        <ContainerInstrument className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
            <div className="lg:col-span-7 space-y-12">
              <div className="space-y-6">
                <ContainerInstrument className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/5 rounded-full">
                  <Zap strokeWidth={1.5} size={16} className="text-primary" />
                  <TextInstrument className="text-[11px] font-bold tracking-[0.2em] text-primary uppercase">
                    <VoiceglotText translationKey="academy.solution.label" defaultText="De Oplossing" />
                  </TextInstrument>
                </ContainerInstrument>
                <HeadingInstrument level={2} className="text-6xl md:text-7xl font-light tracking-tighter leading-none text-va-black">
                  Leren in je <br/>
                  <span className="text-primary italic">eigen tempo</span>.
                </HeadingInstrument>
              </div>
              <TextInstrument className="text-xl text-va-black/60 font-light leading-relaxed max-w-xl">
                <VoiceglotText translationKey="academy.solution.text" defaultText="De Voices Academy is geen saaie cursus, maar een traject waarin je stap voor stap wordt meegenomen door Johfrah. Je kijkt de video's wanneer het jou uitkomt, oefent met echte scripts en krijgt persoonlijke feedback op je vorderingen." />
              </TextInstrument>
              <div className="flex flex-wrap gap-8">
                {[
                  { label: "Online Lessen", icon: Video },
                  { label: "Persoonlijke Feedback", icon: MessageSquare },
                  { label: "Echte Scripts", icon: Mic }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow-aura flex items-center justify-center text-primary">
                      <item.icon size={18} strokeWidth={1.5} />
                    </div>
                    <TextInstrument className="text-[13px] font-bold tracking-widest uppercase text-va-black/40">{item.label}</TextInstrument>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <ContainerInstrument className="aspect-square bg-va-black rounded-[40px] overflow-hidden shadow-aura-lg relative group border border-black/5">
                <Image 
                  src="https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/visuals/common/studio-mic.webp"
                  alt="Professional Microphone"
                  fill
                  className="object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000"
                />
                <ContainerInstrument className="absolute inset-0 flex items-center justify-center">
                   <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                     <Play fill="currentColor" size={24} />
                   </div>
                </ContainerInstrument>
              </ContainerInstrument>
            </div>
          </div>
        </ContainerInstrument>
      </SectionInstrument>

      {/* 4. THE EXPERT (STORY LAYOUT) */}
      <SectionInstrument className="py-48 bg-va-black text-white relative overflow-hidden">
        <ContainerInstrument className="absolute inset-0 bg-primary/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />
        <ContainerInstrument className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
            <div className="lg:col-span-5 relative">
              <ContainerInstrument className="aspect-[4/5] rounded-[20px] overflow-hidden shadow-aura-lg relative group border border-white/10">
                {johfrah?.photo_url && (
                  <Image  
                    src={johfrah.photo_url} 
                    alt="Johfrah Lefebvre"
                    fill
                    className="object-cover transition-transform duration-[3000ms] group-hover:scale-110 va-bezier"
                  />
                )}
                <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-va-black/60 to-transparent opacity-60" />
              </ContainerInstrument>
            </div>
            <div className="lg:col-span-7 space-y-12">
              <div className="space-y-6">
                <ContainerInstrument className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 rounded-full border border-white/10">
                  <Award strokeWidth={1.5} size={16} className="text-primary" />
                  <TextInstrument className="text-[11px] font-bold tracking-[0.2em] text-white uppercase">
                    <VoiceglotText translationKey="academy.expert.label" defaultText="Jouw Mentor" />
                  </TextInstrument>
                </ContainerInstrument>
                <HeadingInstrument level={2} className="text-6xl md:text-8xl font-extralight tracking-tighter leading-none text-white">
                  Johfrah <br/>
                  <span className="text-primary/40 italic">Lefebvre</span>
                </HeadingInstrument>
              </div>
              <TextInstrument className="text-xl text-white/60 font-light leading-relaxed">
                <VoiceglotText translationKey="academy.expert.bio" defaultText="Met meer dan 10 jaar ervaring als voice-over voor merken als Tesla, Samsung en Stepstone, en als bekroond regisseur, deelt Johfrah zijn volledige workflow. Geen geheimen, alleen puur vakmanschap." />
              </TextInstrument>
              <div className="flex flex-wrap gap-8">
                <div className="space-y-2">
                  <TextInstrument className="text-3xl font-extralight text-white leading-none">10+</TextInstrument>
                  <TextInstrument className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">Jaar ervaring</TextInstrument>
                </div>
                <div className="space-y-2">
                  <TextInstrument className="text-3xl font-extralight text-white leading-none">5000+</TextInstrument>
                  <TextInstrument className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">Producties</TextInstrument>
                </div>
                <div className="space-y-2">
                  <TextInstrument className="text-3xl font-extralight text-white leading-none">1</TextInstrument>
                  <TextInstrument className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">Missie: Jouw stem</TextInstrument>
                </div>
              </div>
            </div>
          </div>
        </ContainerInstrument>
      </SectionInstrument>

      {/* 5. CURRICULUM (BOXED GRID) */}
      <SectionInstrument id="traject" className="py-48">
        <ContainerInstrument className="max-w-6xl mx-auto px-6 mb-24">
          <HeadingInstrument level={2} className="text-6xl md:text-8xl font-light tracking-tighter leading-none text-va-black text-center mb-12">
            <VoiceglotText translationKey="academy.curriculum.title" defaultText="Het Traject." />
          </HeadingInstrument>
          <TextInstrument className="text-xl text-va-black/40 font-light text-center max-w-2xl mx-auto">
            <VoiceglotText translationKey="academy.curriculum.subtitle" defaultText="20 lessen die je stap voor stap meenemen in de wereld van de professionele voice-over." />
          </TextInstrument>
        </ContainerInstrument>
        
        <ContainerInstrument className="max-w-6xl mx-auto px-6">
          <Suspense fallback={<LoadingScreenInstrument />}>
            <LessonGrid />
          </Suspense>
        </ContainerInstrument>
      </SectionInstrument>

      {/* 6. PERSONAL FEEDBACK (SPLIT-SCREEN RHYTHM) */}
      <SectionInstrument className="py-48 bg-va-off-white">
        <ContainerInstrument className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
            <div className="lg:col-span-8 space-y-12 order-2 lg:order-1">
              <TextInstrument className="text-2xl text-va-black/60 font-light leading-relaxed">
                <VoiceglotText translationKey="academy.feedback.intro" defaultText="Het grootste struikelblok voor beginners is het gebrek aan eerlijke, professionele feedback. In de Academy sta je er niet alleen voor. Op de belangrijkste opdrachten in het traject krijg je persoonlijke, audio-gebaseerde feedback van Johfrah." />
              </TextInstrument>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-black/[0.03]">
                <div className="space-y-4">
                  <HeadingInstrument level={3} className="text-xl font-light tracking-tight text-va-black">Geen algoritme</HeadingInstrument>
                  <TextInstrument className="text-[15px] text-va-black/40 font-light leading-relaxed">Echte oren die luisteren naar jouw intentie, uitspraak en klankkleur.</TextInstrument>
                </div>
                <div className="space-y-4">
                  <HeadingInstrument level={3} className="text-xl font-light tracking-tight text-va-black">Directe groei</HeadingInstrument>
                  <TextInstrument className="text-[15px] text-va-black/40 font-light leading-relaxed">Concrete tips waar je in je volgende opname direct mee aan de slag kunt.</TextInstrument>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
              <ContainerInstrument className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/5 rounded-full">
                <MessageSquare strokeWidth={1.5} size={16} className="text-primary" />
                <TextInstrument className="text-[11px] font-bold tracking-[0.2em] text-primary uppercase">
                  <VoiceglotText translationKey="academy.feedback.label" defaultText="De Begeleiding" />
                </TextInstrument>
              </ContainerInstrument>
              <HeadingInstrument level={2} className="text-5xl font-light tracking-tighter leading-none text-va-black">
                <VoiceglotText translationKey="academy.feedback.title" defaultText="Feedback die je echt verder helpt." />
              </HeadingInstrument>
            </div>
          </div>
        </ContainerInstrument>
      </SectionInstrument>

      {/* 7. REVIEWS (BENTO CAROUSEL) */}
      <SectionInstrument className="py-48 bg-white">
        <ContainerInstrument className="max-w-6xl mx-auto px-6">
          <Suspense fallback={null}>
            <AcademyReviewsWrapper />
          </Suspense>
        </ContainerInstrument>
      </SectionInstrument>

      {/* 8. PRICING (BOXED FOCUS) */}
      <SectionInstrument id="inschrijven" className="py-48 bg-va-off-white">
        <ContainerInstrument className="max-w-4xl mx-auto px-6">
          <BentoCard span="full" className="bg-white p-20 rounded-[40px] shadow-aura border border-black/[0.02] text-center space-y-12">
            <div className="space-y-6">
              <HeadingInstrument level={2} className="text-5xl md:text-7xl font-light tracking-tighter leading-none text-va-black">
                <VoiceglotText translationKey="academy.pricing.title" defaultText="Investeer in je toekomst." />
              </HeadingInstrument>
              <TextInstrument className="text-xl text-va-black/40 font-light max-w-xl mx-auto">
                <VoiceglotText translationKey="academy.pricing.subtitle" defaultText="Krijg levenslang toegang tot alle lessen, updates en de community." />
              </TextInstrument>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <TextInstrument className="text-8xl font-extralight tracking-tighter text-va-black leading-none">
                {enrollmentPrice}
              </TextInstrument>
              <TextInstrument className="text-[11px] font-bold text-va-black/30 uppercase tracking-[0.2em]">Eenmalige investering (excl. BTW)</TextInstrument>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-black/[0.03]">
              {[
                { title: "20+ Lessen", icon: Video },
                { title: "Persoonlijke Feedback", icon: MessageSquare },
                { title: "Levenslang Toegang", icon: Clock }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                    <item.icon size={20} strokeWidth={1.5} />
                  </div>
                  <TextInstrument className="text-[15px] font-light text-va-black/60">{item.title}</TextInstrument>
                </div>
              ))}
            </div>

            <div className="pt-12">
              <ButtonInstrument 
                as={Link}
                href="/checkout?journey=academy"
                className="va-btn-pro !rounded-[10px] px-20 py-8 text-xl shadow-aura-lg hover:scale-105 transition-transform duration-500"
              >
                <VoiceglotText translationKey="academy.cta.enroll_now" defaultText="Nu inschrijven" />
              </ButtonInstrument>
            </div>
          </BentoCard>
        </ContainerInstrument>
      </SectionInstrument>

      {/* 9. FAQ (SPLIT-SCREEN RHYTHM) */}
      <SectionInstrument className="py-48 bg-white">
        <ContainerInstrument className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
            <div className="lg:col-span-4 space-y-6">
              <ContainerInstrument className="inline-flex items-center gap-3 px-4 py-1.5 bg-va-black/5 rounded-full">
                <Info strokeWidth={1.5} size={16} className="text-va-black/40" />
                <TextInstrument className="text-[11px] font-bold tracking-[0.2em] text-va-black/40 uppercase">
                  <VoiceglotText translationKey="academy.faq.label" defaultText="Support" />
                </TextInstrument>
              </ContainerInstrument>
              <HeadingInstrument level={2} className="text-5xl font-light tracking-tighter leading-none text-va-black">
                <VoiceglotText translationKey="academy.faq.title" defaultText="Veelgestelde vragen." />
              </HeadingInstrument>
            </div>
            <div className="lg:col-span-8 space-y-12">
              {[
                { q: "Is de Academy geschikt voor beginners?", a: "Zeker. We beginnen bij de absolute basis en bouwen stap voor stap op naar een professioneel niveau." },
                { q: "Heb ik dure apparatuur nodig?", a: "Nee, in de eerste lessen leer je juist hoe je met minimale middelen (zoals je smartphone) al goede resultaten haalt, voordat je investeert." },
                { q: "Krijg ik echt feedback van Johfrah?", a: "Ja, op de cruciale opdrachten in het traject krijg je persoonlijke, audio-gebaseerde feedback van Johfrah zelf." },
                { q: "Hoe lang heb ik toegang?", a: "Je houdt levenslang toegang tot de cursus, inclusief alle toekomstige updates en nieuwe lessen." }
              ].map((faq, i) => (
                <div key={i} className="space-y-4 pb-12 border-b border-black/[0.03] last:border-none last:pb-0">
                  <HeadingInstrument level={3} className="text-2xl font-light tracking-tight text-primary">{faq.q}</HeadingInstrument>
                  <TextInstrument className="text-lg text-va-black/60 font-light leading-relaxed">{faq.a}</TextInstrument>
                </div>
              ))}
            </div>
          </div>
        </ContainerInstrument>
      </SectionInstrument>

      {/* 10. FINAL CTA (SIGNATURE CTA) */}
      <SectionInstrument className="px-8 pb-24">
        <ContainerInstrument className="max-w-6xl mx-auto">
          <BentoCard span="xl" className="bg-va-black p-16 text-white text-center space-y-8 overflow-hidden relative rounded-[60px] shadow-aura-lg">
            <ContainerInstrument className="relative z-10 space-y-6">
              <HeadingInstrument level={2} className="text-6xl md:text-8xl font-light tracking-tighter leading-none">
                <VoiceglotText  translationKey="academy.cta.final_title" defaultText="Kies voor jouw stem." />
                <TextInstrument className="text-xl md:text-2xl text-white/40 font-light max-w-2xl mx-auto block mt-4">
                  <VoiceglotText  
                    translationKey="academy.cta.final_text" 
                    defaultText="Start vandaag nog met het traject en ontdek de kracht van jouw eigen geluid." 
                  />
                </TextInstrument>
              </HeadingInstrument>
              <ContainerInstrument className="pt-8">
                <Link  
                  href={`/checkout?journey=academy`} 
                  className="inline-block bg-white text-va-black px-16 py-6 text-xl rounded-[10px] font-light tracking-widest hover:scale-105 transition-transform shadow-xl"
                >
                  <VoiceglotText  translationKey="academy.cta.button" defaultText="Schrijf je in" />
                </Link>
              </ContainerInstrument>
            </ContainerInstrument>
            
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
          </BentoCard>
        </ContainerInstrument>
      </SectionInstrument>

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
              "visual_dna": ["Bento Grid", "Liquid DNA", "Spatial Growth"],
              "accent_color": "#6366f1"
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
