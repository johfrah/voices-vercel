import { WorkshopCalendar } from "@/components/studio/WorkshopCalendar";
import { WorkshopCarousel } from "@/components/studio/WorkshopCarousel";
import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument, 
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { ReviewsInstrument } from "@/components/ui/ReviewsInstrument";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { JourneyCta } from "@/components/ui/JourneyCta";
import { getWorkshops } from "@/lib/api-server";
import { ArrowRight, BookOpen, MessageSquare, Mic } from 'lucide-react';
import { Metadata } from 'next';
import Image from "next/image";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import { Suspense } from "react";

//  NUCLEAR LOADING MANDATE
const LiquidBackground = nextDynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { ssr: false });
const StudioVideoPlayer = nextDynamic(() => import("@/components/ui/StudioVideoPlayer").then(mod => mod.StudioVideoPlayer), { ssr: false });

/**
 * STUDIO
 * Mantra: "Directe begeleiding. Jouw verhaal komt binnen."
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Voices Studio - Plezante voice-over workshops in België",
  description: "Verbeter je stem, ontdek verschillende voice-overstijlen en perfectioneer je opnamevaardigheden. Leer van de experts in onze fysieke studio in Gent.",
  openGraph: {
    title: "Voices Studio - Plezante voice-over workshops in België",
    description: "Verbeter je stem, ontdek verschillende voice-overstijlen en perfectioneer je opnamevaardigheden.",
    type: "website",
  },
  alternates: {
    canonical: "https://www.voices.be/studio",
  }
};

export default async function StudioPage() {
  //  Fetch Workshops with Fallback for DB errors
  const activeWorkshops = await getWorkshops();

  //  VOLGORDE MANDATE: Eerstvolgende workshop eerst, daarna alfabetisch zonder datum
  activeWorkshops.sort((a, b) => {
    const nextA = a.editions?.[0]?.date;
    const nextB = b.editions?.[0]?.date;

    if (nextA && nextB) {
      return new Date(nextA).getTime() - new Date(nextB).getTime();
    }
    if (nextA) return -1;
    if (nextB) return 1;

    // Beiden geen datum -> alfabetisch op titel
    return (a.title || '').localeCompare(b.title || '');
  });

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white selection:bg-primary selection:text-white">
      <Suspense fallback={null}>
        <LiquidBackground />
      </Suspense>
      
      {/* HERO SECTION WITH PROMOVIDEO */}
      <SectionInstrument className="voices-hero">
        <ContainerInstrument plain className="voices-video-hero-grid">
          {/* LINKS: VERTICAL PROMOVIDEO (40%) */}
            <ContainerInstrument plain className="voices-hero-right group lg:order-1">
              <ContainerInstrument plain className="voices-hero-visual-container">
                <Suspense fallback={<div className="w-full h-full bg-va-black/5 animate-pulse rounded-[32px]" />}>
                  <StudioVideoPlayer 
                    url="/assets/studio/workshops/videos/workshop_studio_teaser.mp4" 
                    subtitles="/assets/studio/workshops/subtitles/workshop_studio_teaser-nl.vtt"
                    poster="/assets/visuals/branding/branding-branding-photo-horizontal-1.webp"
                    aspect="portrait"
                    className="shadow-aura-lg border-none w-full h-full"
                  />
                </Suspense>
              </ContainerInstrument>
              {/* Decorative elements */}
              <ContainerInstrument plain className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px] -z-10 animate-pulse" />
              <ContainerInstrument plain className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px] -z-10" />
            </ContainerInstrument>

            {/* RECHTS: TITEL & INTRO (60%) */}
            <ContainerInstrument plain className="voices-hero-left lg:order-2">
              <HeadingInstrument level={1} className="voices-hero-title font-light">
                <VoiceglotText translationKey="studio.hero.title_v2" defaultText="Workshops voor professionele sprekers." />
              </HeadingInstrument>
              
              <TextInstrument className="voices-hero-subtitle font-light">
                <VoiceglotText  
                  translationKey="studio.hero.subtitle" 
                  defaultText="Verbeter je stem, ontdek verschillende voice-overstijlen en perfectioneer je opnamevaardigheden." 
                />
              </TextInstrument>

              <ContainerInstrument plain className="pt-4">
                <Link href="#workshops">
                  <ButtonInstrument className="!bg-va-black !text-white px-12 py-6 !rounded-[10px] font-light tracking-widest hover:bg-primary transition-all duration-500 flex items-center gap-3 shadow-aura-lg">
                    <VoiceglotText translationKey="studio.hero.cta" defaultText="Bekijk workshops" />
                    <ArrowRight size={18} strokeWidth={1.5} />
                  </ButtonInstrument>
                </Link>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
      </SectionInstrument>

      {/*  WORKSHOP UITLEG & CAROUSEL */}
      <SectionInstrument id="workshops" className="py-40 bg-white border-y border-black/[0.03]">
        <ContainerInstrument plain className="max-w-6xl mx-auto px-4 md:px-6">
          <ContainerInstrument plain className="max-w-3xl mb-24 space-y-8 mx-auto text-center">
            <HeadingInstrument level={2} className="text-5xl md:text-6xl font-light tracking-tighter leading-none text-va-black">
              <VoiceglotText translationKey="studio.workshops.title" defaultText="Leer professioneler spreken met Bernadette en Johfrah" />
            </HeadingInstrument>
            <TextInstrument className="text-xl md:text-2xl text-black/40 font-light leading-relaxed">
              <VoiceglotText translationKey="studio.workshops.intro" defaultText="Wij leren je in onze maandelijkse basisworkshops 'Perfect spreken in 1 dag' en 'Voice-overs voor beginners' hoe je spreekt met helderheid, warmte en impact. Daarnaast organiseren we af en toe unieke workshops met gastdocenten." />
            </TextInstrument>
          </ContainerInstrument>

          {/* WORKSHOP CAROUSEL */}
          <WorkshopCarousel workshops={activeWorkshops} />
        </ContainerInstrument>
      </SectionInstrument>

      {/*  DRIE PIJLERS SECTIE */}
      <SectionInstrument className="py-40 bg-white">
        <ContainerInstrument className="max-w-[1140px]">
          <ContainerInstrument plain className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* 1. UITSPRAAK */}
            <ContainerInstrument className="p-12 rounded-[20px] bg-va-off-white border border-black/[0.03] shadow-sm hover:shadow-aura transition-all duration-700 group flex flex-col h-full">
              <ContainerInstrument plain className="w-16 h-16 rounded-[10px] bg-primary/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                <MessageSquare strokeWidth={1.5} className="text-primary" size={32} />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-3xl font-light tracking-tight mb-6 text-va-black">
                <VoiceglotText translationKey="studio.pillars.uitspraak.title" defaultText="1. Uitspraak" />
              </HeadingInstrument>
              <TextInstrument className="text-lg text-black/50 font-light leading-relaxed">
                <VoiceglotText translationKey="studio.pillars.uitspraak.text" defaultText="Leer alles over correct stemgebruik, perfecte uitspraak en intonatie, 3 essentiële vaardigheden voor elke professionele spreker." />
              </TextInstrument>
            </ContainerInstrument>

            {/* 2. VOICE-OVER */}
            <ContainerInstrument className="p-12 rounded-[20px] bg-va-off-white border border-black/[0.03] shadow-sm hover:shadow-aura transition-all duration-700 group flex flex-col h-full">
              <ContainerInstrument plain className="w-16 h-16 rounded-[10px] bg-primary/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                <Mic strokeWidth={1.5} className="text-primary" size={32} />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-3xl font-light tracking-tight mb-6 text-va-black">
                <VoiceglotText translationKey="studio.pillars.voiceover.title" defaultText="2. Voice-over" />
              </HeadingInstrument>
              <TextInstrument className="text-lg text-black/50 font-light leading-relaxed">
                <VoiceglotText translationKey="studio.pillars.voiceover.text" defaultText="Spreek je voice-overs in? Maak meer impact in diverse spreekstijlen: van audioboeken en documentaires tot audiodescriptie en tekenfilms." />
              </TextInstrument>
            </ContainerInstrument>

            {/* 3. STORYTELLING */}
            <ContainerInstrument className="p-12 rounded-[20px] bg-va-off-white border border-black/[0.03] shadow-sm hover:shadow-aura transition-all duration-700 group flex flex-col h-full">
              <ContainerInstrument plain className="w-16 h-16 rounded-[10px] bg-primary/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                <BookOpen strokeWidth={1.5} className="text-primary" size={32} />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-3xl font-light tracking-tight mb-6 text-va-black">
                <VoiceglotText translationKey="studio.pillars.storytelling.title" defaultText="3. Storytelling" />
              </HeadingInstrument>
              <TextInstrument className="text-lg text-black/50 font-light leading-relaxed">
                <VoiceglotText translationKey="studio.pillars.storytelling.text" defaultText="Ga aan de slag als podcastmaker, radio- of tv-presentator? Onze professionele coaches tillen jouw skills naar een hoger niveau." />
              </TextInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/*  ONTMOET JE INSTRUCTEURS (Kennismaking) */}
      <SectionInstrument className="py-48 bg-va-off-white/30 relative overflow-hidden">
        <ContainerInstrument className="max-w-[1140px] relative z-10">
          <ContainerInstrument className="text-center max-w-3xl mx-auto mb-32 space-y-6">
            <TextInstrument className="text-[15px] font-light tracking-[0.3em] text-primary/60">
              <VoiceglotText translationKey="studio.instructors.label" defaultText="Wij staan klaar om je te coachen" />
            </TextInstrument>
            <HeadingInstrument level={2} className="text-6xl md:text-7xl font-light tracking-tighter leading-none text-va-black">
              <VoiceglotText translationKey="studio.instructors.title" defaultText="Ontmoet je instructeurs." />
            </HeadingInstrument>
            <TextInstrument className="text-xl text-black/40 font-light leading-relaxed">
              <VoiceglotText translationKey="studio.instructors.intro" defaultText="Bernadette Timmermans en Johfrah Lefebvre bieden workshops aan voor iedereen die zijn spreekvaardigheden naar een hoger niveau wil tillen." />
            </TextInstrument>
          </ContainerInstrument>

          <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32">
            {/* BERNADETTE */}
            <ContainerInstrument className="group space-y-12">
              <ContainerInstrument className="relative aspect-[4/5] rounded-[20px] overflow-hidden shadow-aura-lg grayscale hover:grayscale-0 transition-all duration-1000">
                <Image  
                  src="/assets/visuals/branding/branding-branding-photo-horizontal-2.jpg" 
                  alt="Bernadette Timmermans"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-va-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <ContainerInstrument className="absolute bottom-10 left-10">
                  <TextInstrument className="text-white/60 text-[15px] font-light tracking-widest mb-2 ">
                    <VoiceglotText translationKey="studio.instructor.bernadette.tagline" defaultText="VRT Stemcoach & Auteur" />
                  </TextInstrument>
                  <HeadingInstrument level={3} className="text-4xl font-light text-white tracking-tighter">
                    <VoiceglotText translationKey="studio.instructor.bernadette.name" defaultText="Bernadette Timmermans" noTranslate={true} />
                  </HeadingInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="space-y-6 px-4">
                <TextInstrument className="text-xl text-black/50 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="studio.instructor.bernadette.bio" 
                    defaultText="Bernadette is een gerenommeerde stemcoach met een uitgebreide academische en professionele achtergrond. Ze heeft een bachelor en master in logopedie en audiologie en behaalde een doctoraat in de medische wetenschappen met een scriptie over het effect van stemtraining bij professionele stemgebruikers." 
                  />
                </TextInstrument>
                <TextInstrument className="text-base text-black/40 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="studio.instructor.bernadette.bio_extra" 
                    defaultText="Bernadette geeft sinds 1984 les aan studenten radio aan het RITCS en is docent stem in BATAC Radio. Ze heeft talloze workshops gegeven en werkt als adviseur voor mediahuizen zoals VRT, DPG België en Nederland en ATV. Bernadette is ook auteur van meerdere boeken over stemgebruik, waaronder de bekende uitspraak- en intonatiegids 'Klink Klaar'." 
                  />
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>

            {/* JOHFRAH */}
            <ContainerInstrument className="group space-y-12 md:mt-24">
              <ContainerInstrument className="relative aspect-[4/5] rounded-[20px] overflow-hidden shadow-aura-lg grayscale hover:grayscale-0 transition-all duration-1000">
                <Image  
                  src="/assets/visuals/branding/branding-branding-photo-horizontal-3.jpg" 
                  alt="Johfrah Lefebvre"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-va-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <ContainerInstrument className="absolute bottom-10 left-10">
                  <TextInstrument className="text-white/60 text-[15px] font-light tracking-widest mb-2 ">
                    <VoiceglotText translationKey="studio.instructor.johfrah.tagline" defaultText="Founder & Stemacteur" />
                  </TextInstrument>
                  <HeadingInstrument level={3} className="text-4xl font-light text-white tracking-tighter">
                    <VoiceglotText translationKey="studio.instructor.johfrah.name" defaultText="Johfrah Lefebvre" noTranslate={true} />
                  </HeadingInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="space-y-6 px-4">
                <TextInstrument className="text-xl text-black/50 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="studio.instructor.johfrah.bio" 
                    defaultText="Johfrah is een bedreven Vlaamse voice-over met meer dan tien jaar ervaring in het inspreken van teksten voor webvideo's en commercials. Je kunt zijn stem herkennen van TV-spots voor Trivago, Stepstone of Pick UP! en zelfs als de stem achter de hulplijnen van Tesla en Samsung." 
                  />
                </TextInstrument>
                <TextInstrument className="text-base text-black/40 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="studio.instructor.johfrah.bio_extra" 
                    defaultText="Naast zijn werk als voice-over is Johfrah ook een bekroond regisseur en cameraman, en oprichter van het internationale voice-over agency Voices.be. Hij heeft een YouTube-kanaal waar hij tips geeft aan beginnende voice-overs." 
                  />
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="absolute top-1/2 left-0 w-full h-px bg-black/[0.03] -z-10" />
      </SectionInstrument>

      {/*  KALENDER BENTO */}
      <SectionInstrument className="py-40 bg-white">
        <ContainerInstrument className="max-w-[1140px]">
          <BentoGrid columns={3}>
            <BentoCard span="lg" className="bg-va-off-white rounded-[20px] shadow-aura border border-black/[0.02] overflow-hidden">
              <ContainerInstrument className="p-12">
                <ContainerInstrument className="flex items-center gap-4 mb-8">
                  <ContainerInstrument className="w-12 h-12 rounded-[10px] bg-primary/10 flex items-center justify-center">
                    <Image src="/assets/common/branding/icons/INFO.svg" width={24} height={24} alt="" style={{ opacity: 0.4 }} />
                  </ContainerInstrument>
                  <ContainerInstrument>
                    <HeadingInstrument level={2} className="text-3xl font-light tracking-tighter leading-none text-va-black">
                      <VoiceglotText translationKey="studio.calendar_section.title" defaultText="Kalender" />
                    </HeadingInstrument>
                    <TextInstrument className="text-[15px] font-light tracking-widest text-black/30 mt-2">
                      <VoiceglotText translationKey="studio.calendar_section.subtitle" defaultText="Volgende workshops" />
                    </TextInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-[15px] text-black/40 font-light leading-relaxed mb-12 max-w-md">
                  <VoiceglotText translationKey="studio.calendar_section.intro" defaultText="Hier zie je een handig overzicht van onze volgende workshops." />
                </TextInstrument>
                <WorkshopCalendar workshops={activeWorkshops} />
              </ContainerInstrument>
            </BentoCard>

            {/*  DE GIDS BENTO (Quiz) */}
            <BentoCard span="sm" className="bg-blue-600 p-12 text-white relative overflow-hidden flex flex-col justify-between min-h-[500px] rounded-[20px]">
              <ContainerInstrument className="relative z-10">
                <ContainerInstrument className="w-12 h-12 rounded-[10px] bg-white/20 backdrop-blur-md flex items-center justify-center mb-8">
                  <Image  src="/assets/common/branding/icons/INFO.svg" width={24} height={24} alt="" className="brightness-0 invert" />
                </ContainerInstrument>
                <HeadingInstrument level={2} className="text-5xl font-light tracking-tighter leading-none mb-8 ">
                  <VoiceglotText translationKey="studio.bento.guide.title" defaultText="Welke workshop past bij jou?" />
                  <TextInstrument className="text-white/70 font-light max-w-sm text-[15px] leading-relaxed block mt-4">
                    <VoiceglotText translationKey="studio.bento.guide.text" defaultText="Dankzij deze interactieve video-quiz kom je te weten welke workshop op dit moment het best bij je past." />
                  </TextInstrument>
                </HeadingInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="relative z-10">
                <Link  href="/studio/quiz">
                  <ButtonInstrument className="va-btn-pro !bg-white !text-black flex items-center gap-4 group !rounded-[10px] font-light tracking-widest ">
                    <VoiceglotText translationKey="studio.bento.guide.cta" defaultText="Doe de quiz" />
                    <Image src="/assets/common/branding/icons/FORWARD.svg" width={18} height={18} alt="" className="group-hover:translate-x-2 transition-transform" />
                  </ButtonInstrument>
                </Link>
              </ContainerInstrument>
              <ContainerInstrument className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-[20px] blur-3xl" />
            </BentoCard>
          </BentoGrid>
        </ContainerInstrument>
      </SectionInstrument>

      {/*  REVIEWS BENTO */}
      <SectionInstrument className="py-48 bg-va-off-white border-t border-black/[0.03]">
        <ContainerInstrument className="max-w-[1140px]">
          <BentoCard span="full" className="bg-white rounded-[20px] border border-black/[0.02] p-16 shadow-aura">
            <ContainerInstrument className="max-w-4xl mb-20">
              <HeadingInstrument level={3} className="text-[15px] font-light tracking-widest text-black/30 mb-8">
                <VoiceglotText translationKey="studio.reviews.label" defaultText="Ervaringen van onze deelnemers" />
              </HeadingInstrument>
              <HeadingInstrument level={2} className="text-6xl font-light tracking-tighter leading-none mb-8 text-va-black">
                <VoiceglotText translationKey="studio.reviews_section.title" defaultText="De mix tussen theorie en praktijk." />
              </HeadingInstrument>
              <TextInstrument className="text-xl text-black/40 font-light leading-relaxed">
                <VoiceglotText translationKey="studio.reviews_section.intro" defaultText="De lesgevers, de mix tussen theorie en praktijk, persoonlijke feedback en veel tijd voor oefeningen krijgen extra waardering." />
              </TextInstrument>
            </ContainerInstrument>
            
            <ReviewsInstrument 
              reviews={activeWorkshops.flatMap(w => w.reviews || []).slice(0, 3)}
              title=""
              subtitle=""
              translationKeyPrefix="studio.general.reviews"
            />
          </BentoCard>
        </ContainerInstrument>
      </SectionInstrument>

      {/* SALLY-MANDATE: Signature CTA for Studio Journey */}
      <SectionInstrument className="py-20 bg-va-off-white">
        <ContainerInstrument className="max-w-[1140px]">
          <JourneyCta journey="studio" />
        </ContainerInstrument>
      </SectionInstrument>

      {/*  SUZY'S SCHEMA INJECTION */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://www.voices.be/studio#business",
            "name": "Voices Studio",
            "description": "De fysieke plek voor directe begeleiding in het stemmenambacht.",
            "url": "https://www.voices.be/studio",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Sint-Salvatorstraat 18",
              "addressLocality": "Gent",
              "postalCode": "9000",
              "addressCountry": "BE"
            },
            "parentOrganization": {
              "@type": "Organization",
              "name": "Voices",
              "url": "https://www.voices.be"
            }
          })
        }}
      />

      {/*  LLM CONTEXT (Compliance) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Voices Studio",
            "description": "Het instituut voor het stemmenambacht. Directe begeleiding in de studio.",
            "_llm_context": {
              "persona": "Gids",
              "journey": "studio",
              "intent": "workshop_discovery",
              "capabilities": ["view_workshops", "book_appointment", "take_quiz"],
              "lexicon": ["Workshop", "Workshopgever", "In de studio"],
              "visual_dna": ["Bento Grid", "Liquid DNA", "Spatial Growth"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
