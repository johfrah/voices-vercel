import { AcademyRecorder } from "@/components/academy/AcademyRecorder";
import { VideoPlayer } from "@/components/academy/VideoPlayer";
import { AcademyContent } from "@/components/ui/AcademyContent";
import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ContainerInstrument,
    HeadingInstrument,
    LoadingScreenInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { getAcademyLesson } from "@/lib/api-server";
import { MobileBridge } from '@/lib/mobile-bridge';
import { SecurityService } from '@/lib/security-service';
import { createClient } from "@/utils/supabase/server";
import { db } from "@db";
import { courseProgress, users } from "@db/schema";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { and, eq } from "drizzle-orm";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, FileText, Info, ShieldCheck } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from 'react';

// 🛡️ CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sdkClient = createSupabaseClient(supabaseUrl, supabaseKey);

import { AcademyPdfButton } from "@/components/ui/AcademyPdfButton";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const data = await getAcademyLesson(params.id);
    if (!data || data.type === 'notice') return {};

    const title = `${data.header.title} - Voices Academy Les ${params.id} | Voices.be`;
    const description = data.header.subtitle || `Volg les ${params.id} van de Voices Academy. Leer alles over stemgebruik, techniek en de business.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      alternates: {
        canonical: `https://www.voices.be/academy/lesson/${params.id}`,
      }
    };
  } catch (e) {
    return {};
  }
}

export default function LessonPage({ params, searchParams }: { params: { id: string }, searchParams: { preview?: string } }) {
  return (
    <PageWrapperInstrument>
      <Suspense fallback={<LoadingScreenInstrument />}>
        <LessonContent params={params} searchParams={searchParams} />
      </Suspense>
    </PageWrapperInstrument>
  );
}

async function LessonContent({ params, searchParams }: { params: { id: string }, searchParams: { preview?: string } }) {
  const data = await getAcademyLesson(params.id);
  const supabase = createClient();
  const supabaseUser = supabase ? (await supabase.auth.getUser()).data.user : null;

  // Fetch full user profile from DB to get role and ID
  let user: any = null;
  if (supabaseUser?.email) {
    try {
      const [dbUser] = await db.select().from(users).where(eq(users.email, supabaseUser.email!)).limit(1);
      user = dbUser;
    } catch (dbError) {
      console.warn('⚠️ Academy Lesson Drizzle failed, falling back to SDK');
      const { data: sdkUser } = await sdkClient
        .from('users')
        .select('*')
        .eq('email', supabaseUser.email!)
        .single();
      user = sdkUser;
    }
  }

  const isAdmin = user?.role === 'admin';
  const isPreviewMode = isAdmin && searchParams.preview === 'student';

  // 🛡️ SECURITY CHECK: Heeft de gebruiker toegang?
  const hasAccess = user ? await SecurityService.checkAccess(user.id, 1) : false; // 1 is placeholder voor courseId
  const isLessonOne = params.id === "1";

  // 💧 DRIP CONTENT LOGIC (Per-user progression)
  const lessonOrder = parseInt(params.id);
  let isLockedByDrip = false;
  let availableDate = null;
  let reason = "drip";

  if (user && !isAdmin && hasAccess && !isLessonOne) {
    // 1. Haal de voortgang van de VORIGE les op
    const previousLessonOrder = lessonOrder - 1;
    const [previousProgress] = await db.select()
      .from(courseProgress)
      .where(and(
        eq(courseProgress.userId, user.id), 
        eq(courseProgress.lessonId, previousLessonOrder),
        eq(courseProgress.status, 'completed')
      ))
      .limit(1);

    if (!previousProgress) {
      isLockedByDrip = true;
      reason = "previous_incomplete";
    } else {
      // 2. Check de tussenpoze (bijv. 3 dagen na afronding vorige les voor 2 lessen per week ritme)
      const completionDate = new Date(previousProgress.completedAt!);
      const daysWait = 3; // 3-4 dagen tussenpoze voor een ritme van 2 per week
      const nextAvailableAt = new Date(completionDate.getTime() + (daysWait * 24 * 60 * 60 * 1000));
      
      if (Date.now() < nextAvailableAt.getTime()) {
        isLockedByDrip = true;
        availableDate = nextAvailableAt;
        reason = "wait_period";
      }
    }
  }

  // Admin preview override
  const effectiveIsAdmin = isAdmin && !isPreviewMode;
  const effectiveHasAccess = hasAccess || effectiveIsAdmin;

  // Track device fingerprint (God Mode Security)
  if (user) {
    const fingerprint = await MobileBridge.getDeviceId();
    await SecurityService.trackDevice(user.id, fingerprint);
  }

  if (data.type === 'notice') {
    return (
      <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <ContainerInstrument className="bg-blue-50 border-l-4 border-blue-500 p-8 rounded-xl">
          <ContainerInstrument className="flex items-center gap-4">
            <Info className="text-blue-500" size={32} />
            <TextInstrument className="text-blue-700 font-bold">{data.message}</TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </PageWrapperInstrument>
    );
  }

  // Use clean JSON data from the API
  const exerciseHtml = data.exercise || "";
  const videoUrl = data.video_url || "";
  const extraVideoUrl = data.extra_video_url || "";
  const progress = data.progress || { percentage: 0 };

  // Personalization variables
  const variables = {
    firstName: user?.firstName || "Academy Student",
  };

  if ((!effectiveHasAccess && !isLessonOne) || (isLockedByDrip && !effectiveIsAdmin)) {
    return (
      <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        {isAdmin && (
          <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <EyeOff size={20} className="text-primary" />
              <TextInstrument className="text-sm font-black tracking-tight text-primary">Student Preview Modus</TextInstrument>
            </div>
            <Link href={`/academy/lesson/${params.id}`} className="va-btn-pro !py-2 !px-4 !text-[15px]">
              Terug naar Admin Mode
            </Link>
          </div>
        )}
        <SectionInstrument className="mb-12 space-y-6">
          <Link 
            href="/academy" 
            className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-va-black/40 hover:text-primary transition-all"
          >
            <ArrowLeft size={14} /> 
            <VoiceglotText translationKey="academy.back_to_overview" defaultText="Terug naar overzicht" />
          </Link>
          
          <ContainerInstrument className="space-y-2">
            <HeadingInstrument level={1} className="text-5xl font-black tracking-tighter">
              <VoiceglotText translationKey={`academy.lesson.${params.id}.title`} defaultText={data.header.title} />
            </HeadingInstrument>
          </ContainerInstrument>
        </SectionInstrument>

        <BentoGrid>
          <BentoCard span="xl" className="hred p-16 text-white text-center space-y-8">
            <ContainerInstrument className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
              {isLockedByDrip ? <Info size={48} className="text-white" /> : <ShieldCheck size={48} className="text-white" />}
            </ContainerInstrument>
            <HeadingInstrument level={2} className="text-5xl font-black tracking-tighter leading-none">
              <VoiceglotText 
                translationKey={isLockedByDrip ? "academy.drip.title" : "academy.paywall.title"} 
                defaultText={reason === "previous_incomplete" ? "Eerst de vorige les afronden" : isLockedByDrip ? "Even laten bezinken..." : "Deze les is vergrendeld"} 
              />
            </HeadingInstrument>
            <TextInstrument className="text-xl text-white/60 font-medium max-w-xl mx-auto">
              {reason === "previous_incomplete" ? (
                <VoiceglotText 
                  translationKey="academy.drip.previous_incomplete" 
                  defaultText="Je kunt deze les pas starten als je de vorige les volledig hebt doorlopen en je opname hebt ingediend." 
                />
              ) : reason === "wait_period" ? (
                <VoiceglotText 
                  translationKey="academy.drip.wait" 
                  defaultText={`Goed gewerkt in de vorige les. Neem nu even de tijd om het te laten bezinken. Deze les komt vrij op ${availableDate?.toLocaleDateString('nl-BE')}.`} 
                />
              ) : (
                <VoiceglotText 
                  translationKey="academy.paywall.text" 
                  defaultText="Schrijf je in voor de Academy om toegang te krijgen tot alle video's, scripts en persoonlijke feedback van onze coaches." 
                />
              )}
            </TextInstrument>
            <ContainerInstrument className="pt-8">
              <Link 
                href="/academy" 
                className="va-btn-pro !bg-white !text-black !px-12 !py-4"
              >
                <VoiceglotText 
                  translationKey={isLockedByDrip ? "academy.drip.cta" : "academy.paywall.cta"} 
                  defaultText={isLockedByDrip ? "Terug naar overzicht" : "Bekijk Inschrijfmogelijkheden"} 
                />
              </Link>
            </ContainerInstrument>
          </BentoCard>
        </BentoGrid>
      </PageWrapperInstrument>
    );
  }

  return (
    <PageWrapperInstrument 
      className="max-w-7xl mx-auto px-6 py-20 relative z-10 select-none print:hidden" 
      onContextMenu={(e) => !isAdmin && e.preventDefault()} 
      onCopy={(e) => !isAdmin && e.preventDefault()}
    >
      {/* 🕸️ SUZY'S SCHEMA INJECTION: Course & VideoObject */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": data.header.title,
            "description": data.header.subtitle,
            "provider": {
              "@type": "Organization",
              "name": "Voices Academy",
              "url": "https://www.voices.be/academy"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Voices",
              "url": "https://www.voices.be"
            },
            "hasCourseInstance": {
              "@type": "CourseInstance",
              "courseMode": "online",
              "educationalLevel": "Professional",
              "instructor": {
                "@type": "Person",
                "name": "Johfrah Lefebvre",
                "url": "https://www.voices.be/voice/johfrah-lefebvre"
              }
            },
            "video": videoUrl ? {
              "@type": "VideoObject",
              "name": data.header.title,
              "description": data.header.subtitle,
              "thumbnailUrl": `https://www.voices.be/api/academy/thumbnail/${params.id}`,
              "uploadDate": new Date().toISOString(),
              "contentUrl": videoUrl,
              "transcript": data.exercise, // Gebruik exercise als basis voor transcript
              "duration": "PT10M", // Placeholder, idealiter dynamisch
              "hasPart": [
                {
                  "@type": "Clip",
                  "name": "Introductie",
                  "startOffset": "PT0S",
                  "endOffset": "PT2M"
                },
                {
                  "@type": "Clip",
                  "name": "Kern van de les",
                  "startOffset": "PT2M",
                  "endOffset": "PT8M"
                },
                {
                  "@type": "Clip",
                  "name": "Oefening & Afronding",
                  "startOffset": "PT8M",
                  "endOffset": "PT10M"
                }
              ]
            } : undefined
          })
        }}
      />
      {/* 🛡️ ANTI-SCREENSHOT OVERLAY (Only for non-admins) */}
      {!isAdmin && (
        <style dangerouslySetInnerHTML={{ __html: `
          @media screen {
            body {
              -webkit-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
          }
          /* Verberg content bij printen/PDF-export via browser */
          @media print {
            body { display: none !important; }
          }
        `}} />
      )}
      {isAdmin && (
        <div className="mb-8 p-4 bg-va-black rounded-2xl flex items-center justify-between shadow-xl border border-white/5">
          <div className="flex items-center gap-3 text-white">
            <Eye size={20} className="text-primary" />
            <TextInstrument className="text-sm font-black tracking-tight">Admin Mode Actief</TextInstrument>
          </div>
          <div className="flex gap-4">
            {!isPreviewMode ? (
              <>
                <button 
                  onClick={() => window.print()} 
                  className="va-btn-pro !bg-white/10 !text-white !py-2 !px-4 !text-[15px] hover:!bg-white/20 flex items-center gap-2"
                >
                  <FileText size={14} />
                  Print Workshop (PDF)
                </button>
                <Link href={`/academy/lesson/${params.id}?preview=student`} className="va-btn-pro !bg-white/10 !text-white !py-2 !px-4 !text-[15px] hover:!bg-white/20">
                  Preview als Student
                </Link>
              </>
            ) : (
              <Link href={`/academy/lesson/${params.id}`} className="va-btn-pro !py-2 !px-4 !text-[15px]">
                Terug naar Admin Mode
              </Link>
            )}
          </div>
        </div>
      )}
      {/* Header */}
      <SectionInstrument className="mb-12 space-y-6">
        <Link 
          href="/academy" 
          className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-va-black/40 hover:text-primary transition-all"
        >
          <ArrowLeft size={14} /> 
          <VoiceglotText translationKey="academy.back_to_overview" defaultText="Terug naar overzicht" />
        </Link>
        
        <ContainerInstrument className="space-y-2">
          <HeadingInstrument level={1} className="text-5xl font-black tracking-tighter">
            <VoiceglotText translationKey={`academy.lesson.${params.id}.title`} defaultText={data.header.title} />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/50 font-medium">
            <VoiceglotText translationKey={`academy.lesson.${params.id}.subtitle`} defaultText={data.header.subtitle} />
          </TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <BentoGrid>
        {/* Main Content Area */}
        <BentoCard span="xl" className="space-y-12" id="lesson-content-to-export">
          {/* Video Section */}
          <VideoPlayer 
            url={videoUrl} 
            title={<VoiceglotText translationKey="academy.lesson.video_title" defaultText="Les Video" />}
          />

          {/* Exercise Content */}
          <ContainerInstrument className="prose prose-va max-w-none">
            <HeadingInstrument level={2} className="text-3xl font-black tracking-tight mb-6">
              <VoiceglotText translationKey="academy.lesson.exercise_title" defaultText="Oefening" />
            </HeadingInstrument>
            <ContainerInstrument className="text-va-black/70 leading-relaxed academy-content">
              <AcademyContent 
                translationKey={`academy.lesson.${params.id}.content`} 
                defaultHtml={exerciseHtml} 
                variables={variables}
              />
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Recorder Section */}
          <AcademyRecorder lessonId={params.id} initialText={data.exercise} />

          {/* 📊 NULMETING REFLECTIE (Alleen voor Les 1) */}
          {isLessonOne && (
            <BentoCard span="xl" className="bg-va-off-white p-12 border border-black/5">
              <HeadingInstrument level={3} className="text-3xl font-black tracking-tighter mb-8">
                <VoiceglotText translationKey="academy.lesson1.nulmeting.title" defaultText="Zelfreflectie: Jouw Nulmeting" />
              </HeadingInstrument>
              <ContainerInstrument className="space-y-8">
                <TextInstrument className="text-va-black/60 font-medium leading-relaxed">
                  <VoiceglotText 
                    translationKey="academy.lesson1.nulmeting.intro" 
                    defaultText="Luister je eigen opname hierboven eens rustig terug. Probreed niet te oordelen, maar observeer nuchter wat je hoort. Deze vragen helpen je daarbij:" 
                  />
                </TextInstrument>
                <ContainerInstrument className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <ContainerInstrument className="space-y-4">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black">1</div>
                    <TextInstrument className="font-bold text-sm tracking-widest">
                      <VoiceglotText translationKey="academy.lesson1.q1" defaultText="Geloof je jezelf?" />
                    </TextInstrument>
                    <TextInstrument className="text-[15px] text-va-black/40 leading-relaxed font-light">
                      <VoiceglotText translationKey="academy.lesson1.q1.desc" defaultText="Hoor je iemand die een tekst voorleest, of hoor je iemand die een verhaal vertelt aan een vriend?" />
                    </TextInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="space-y-4">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black">2</div>
                    <TextInstrument className="font-bold text-sm tracking-widest">
                      <VoiceglotText translationKey="academy.lesson1.q2" defaultText="Hoor je de adem?" />
                    </TextInstrument>
                    <TextInstrument className="text-[15px] text-va-black/40 leading-relaxed font-light">
                      <VoiceglotText translationKey="academy.lesson1.q2.desc" defaultText="Zit er rust in je klank, of hoor je de inspanning en de nood om de zin af te maken?" />
                    </TextInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="space-y-4">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black">3</div>
                    <TextInstrument className="font-bold text-sm tracking-widest">
                      <VoiceglotText translationKey="academy.lesson1.q3" defaultText="De Glimlach?" />
                    </TextInstrument>
                    <TextInstrument className="text-[15px] text-va-black/40 leading-relaxed font-light">
                      <VoiceglotText translationKey="academy.lesson1.q3.desc" defaultText="Kun je horen dat je plezier hebt in wat je vertelt, of klinkt het als een verplichte opdracht?" />
                    </TextInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
                <ContainerInstrument className="pt-8 border-t border-black/5">
                  <TextInstrument className="italic text-va-black/40 text-sm font-light">
                    <VoiceglotText 
                      translationKey="academy.lesson1.nulmeting.footer" 
                      defaultText="Bewaar deze opname goed. Over 20 lessen luisteren we hier samen naar terug om te horen hoe je intentie is gegroeid." 
                    />
                  </TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            </BentoCard>
          )}

          {/* 🛡️ ADMIN ONLY: Video Scripts Section */}
          {isAdmin && (
            <BentoGrid columns={2} className="mt-12">
              <BentoCard span="md" className="bg-va-black text-white p-8">
                <HeadingInstrument level={3} className="text-xl font-black tracking-tight mb-4 text-primary">
                  <VoiceglotText translationKey="academy.admin.intro_script_title" defaultText="Introductie Script (2 min)" />
                </HeadingInstrument>
                <div className="prose prose-invert prose-xs max-h-96 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
                  <AcademyContent 
                    translationKey={`academy.lesson.${params.id}.intro_script`} 
                    defaultHtml={data.intro_script || "Geen intro script beschikbaar."} 
                    variables={variables}
                  />
                </div>
              </BentoCard>

              <BentoCard span="md" className="bg-va-black text-white p-8">
                <HeadingInstrument level={3} className="text-xl font-black tracking-tight mb-4 text-primary">
                  <VoiceglotText translationKey="academy.admin.deep_dive_script_title" defaultText="Verdieping Script (4 min)" />
                </HeadingInstrument>
                <div className="prose prose-invert prose-xs max-h-96 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
                  <AcademyContent 
                    translationKey={`academy.lesson.${params.id}.deep_dive_script`} 
                    defaultHtml={data.deep_dive_script || "Geen verdieping script beschikbaar."} 
                    variables={variables}
                  />
                </div>
              </BentoCard>
            </BentoGrid>
          )}
        </BentoCard>

        {/* Sidebar */}
        <ContainerInstrument className="space-y-8">
          {/* Technical Briefing */}
          <BentoCard span="sm" className="hred text-white">
            <HeadingInstrument level={4} className="text-[15px] font-black tracking-widest text-white/40 mb-6 flex items-center gap-2">
              <Info size={14} /> 
              <VoiceglotText translationKey="academy.lesson.technical_briefing" defaultText="Briefing" />
            </HeadingInstrument>
            <ContainerInstrument as="ul" className="space-y-4 text-[15px] font-medium">
              <ContainerInstrument as="li" className="flex gap-3">
                <CheckCircle2 size={16} className="shrink-0 text-white" />
                <TextInstrument as="span">
                  <VoiceglotText translationKey="academy.lesson.briefing_1" defaultText="Gebruik oortjes of een koptelefoon." />
                </TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument as="li" className="flex gap-3">
                <CheckCircle2 size={16} className="shrink-0 text-white" />
                <TextInstrument as="span">
                  <VoiceglotText translationKey="academy.lesson.briefing_2" defaultText="Zet je camera aan (optioneel)." />
                </TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument as="li" className="flex gap-3">
                <CheckCircle2 size={16} className="shrink-0 text-white" />
                <TextInstrument as="span">
                  <VoiceglotText translationKey="academy.lesson.briefing_3" defaultText="Geef browser toegang tot microfoon." />
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </BentoCard>

          {/* Progress Widget */}
          <BentoCard span="sm" className="bg-va-black text-white">
            <HeadingInstrument level={4} className="text-[15px] font-black tracking-widest text-white/40 mb-4">
              <VoiceglotText translationKey="academy.lesson.progress_label" defaultText="Voortgang" />
            </HeadingInstrument>
            <ContainerInstrument className="text-4xl font-black tracking-tighter text-primary mb-4">{progress.percentage}%</ContainerInstrument>
            <ContainerInstrument className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-6">
              <ContainerInstrument className="h-full bg-primary" {...({ style: { width: `${progress.percentage}%` } } as any)} />
            </ContainerInstrument>
            {isAdmin && (
              <AcademyPdfButton 
                lessonTitle={data.header.title} 
                contentSelector="#lesson-content-to-export" 
                fileName={`Voices-Academy-Les-${params.id}-${variables.firstName}.pdf`}
              />
            )}
          </BentoCard>
        </ContainerInstrument>
      </BentoGrid>
    </PageWrapperInstrument>
  );
}
