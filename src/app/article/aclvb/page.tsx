import React from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument 
} from "@/components/ui/LayoutInstruments";
import { BentoGrid, BentoCard } from "@/components/ui/BentoGrid";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { Quote, ArrowLeft, Users, MessageSquare } from "lucide-react";
import Link from "next/link";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ACLVB: Van 140 stemmen naar één warm onthaal | Voices.be Stories',
  description: 'Ontdek hoe de liberale vakbond tienduizenden bellers een menselijk onthaal geeft door uniformiteit en professionaliteit.',
  openGraph: {
    title: 'ACLVB | Voices.be Stories',
    description: 'Hoe audio bijdraagt aan de menselijke maat bij vakbond ACLVB.',
    images: ['/assets/content/blog/videos/review-aclvb.mp4'],
  }
};

/**
 * ARTICLE: ACLVB (PHYSICAL FALLBACK)
 * Theme: Stories
 */
export default function AclvbStoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "ACLVB Testimonial - Voices.be",
    "description": "Hoe ACLVB audio inzet voor een betere ledenservice.",
    "thumbnailUrl": "/assets/img/testimonials/aclvb-thumb.jpg",
    "uploadDate": "2026-02-10",
    "contentUrl": "/assets/content/blog/videos/review-aclvb.mp4",
    "embedUrl": "https://voices.be/article/aclvb"
  };

  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LiquidBackground />
      
      <SectionInstrument className="max-w-5xl mx-auto px-6 relative z-10">
        <ContainerInstrument className="mb-12">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-[15px] font-light tracking-[0.2em] text-va-black/40 hover:text-primary transition-all mb-8 uppercase"
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> 
            <VoiceglotText translationKey="article.back" defaultText="Terug naar de etalage" />
          </Link>
          <TextInstrument className="text-[15px] font-light tracking-[0.2em] text-primary mb-4 uppercase">
            <VoiceglotText translationKey="article.theme.stories" defaultText="Stories" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none mb-6 text-va-black uppercase">
            <VoiceglotText translationKey="story.aclvb.title" defaultText="ACLVB | De menselijke vakbond" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between !rounded-[20px]"
          >
            <ContainerInstrument className="space-y-8">
              <Users size={40} className="text-primary" strokeWidth={1.5} />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight leading-none text-va-black uppercase">
                <VoiceglotText translationKey="story.aclvb.subtitle" defaultText="Bij ons ben je geen nummer." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.aclvb.text" 
                  defaultText="Voor een vakbond als ACLVB is bereikbaarheid essentieel. Door 140 verschillende, rommelige begroetingen te vervangen door één warme, professionele stem, voelen tienduizenden leden zich meteen gehoord en welkom." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-6 flex flex-col justify-center overflow-hidden !rounded-[20px]">
            <VideoPlayer 
              src="/assets/content/blog/videos/review-aclvb.mp4" 
              aspectRatio="portrait"
              className="w-full h-full"
              subtitles={[
                { src: '/assets/content/blog/videos/review-aclvb-nl.vtt', label: 'Nederlands', srcLang: 'nl' },
                { src: '/assets/content/blog/videos/review-aclvb-fr.vtt', label: 'Français', srcLang: 'fr' },
                { src: '/assets/content/blog/videos/review-aclvb-en.vtt', label: 'English', srcLang: 'en' }
              ]}
            />
          </BentoCard>

          <BentoCard span="full" className="bg-primary/5 border-primary/10 p-12 !rounded-[20px]">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <MessageSquare size={32} className="text-primary" strokeWidth={1.5} />
                <HeadingInstrument level={3} className="text-3xl font-light tracking-tight text-va-black uppercase">
                  <VoiceglotText translationKey="story.aclvb.challenge_title" defaultText="De uitdaging: 140 verschillende stemmen" />
                </HeadingInstrument>
                <TextInstrument className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="story.aclvb.challenge_text" 
                    defaultText="In het verleden had elk kantoor een eigen onthaal. Dat zorgde voor een gebrek aan uniformiteit en een onprofessionele indruk. Door te kiezen voor Voices.be werd de weg naar de juiste contactpersoon eindelijk helder en menselijk." 
                  />
                </TextInstrument>
              </div>
              <div className="bg-white p-8 rounded-[20px] shadow-aura">
                <Quote size={24} className="text-primary/20 mb-4" />
                <TextInstrument className="text-xl font-light italic text-va-black leading-tight">
                  <VoiceglotText 
                    translationKey="story.aclvb.quote" 
                    defaultText="De gebruiksvriendelijke en vlotte aanpak van Voices.be was zeer overtuigend. Onze leden worden nu beter geholpen in een warme omgeving." 
                  />
                </TextInstrument>
                <TextInstrument className="mt-6 text-[12px] font-light tracking-widest text-va-black/40 uppercase">
                  — Tom Van Droogenbroeck, ACLVB
                </TextInstrument>
              </div>
            </div>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
