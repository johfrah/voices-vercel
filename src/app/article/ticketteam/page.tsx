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
import { Ticket, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ticket Team: Professionalisering van het rommeltje | Voices.be Stories',
  description: 'Van chaos naar een gestroomlijnd onthaal. Ontdek hoe Ticket Team hun audio-branding aanpakte.',
  openGraph: {
    title: 'Ticket Team | Voices.be Stories',
    description: 'Hoe Ticket Team hun telefonische bereikbaarheid professionaliseerde.',
    images: ['/assets/content/blog/videos/ticketteam.mp4'],
  }
};

/**
 * ARTICLE: TICKETTEAM (PHYSICAL FALLBACK)
 * Theme: Stories
 */
export default function TicketTeamStoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Ticket Team Testimonial - Voices.be",
    "description": "Professionalisering van het telefonisch onthaal bij Ticket Team.",
    "thumbnailUrl": "/assets/img/testimonials/ticketteam-thumb.jpg",
    "uploadDate": "2026-02-10",
    "contentUrl": "/assets/content/blog/videos/ticketteam.mp4",
    "embedUrl": "https://voices.be/article/ticketteam"
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
            <VoiceglotText translationKey="story.ticketteam.title" defaultText="Ticket Team | Strak onthaal" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between !rounded-[20px]"
          >
            <ContainerInstrument className="space-y-8">
              <Ticket size={40} className="text-primary" strokeWidth={1.5} />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight leading-none text-va-black uppercase">
                <VoiceglotText translationKey="story.ticketteam.subtitle" defaultText="Van een rommeltje naar een professioneel visitekaartje." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.ticketteam.text" 
                  defaultText="Ticket Team wilde hun telefonische bereikbaarheid naar een hoger niveau tillen. Ontdek hoe een professionele voice-over het verschil maakte voor hun klantenservice." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-6 flex flex-col justify-center overflow-hidden !rounded-[20px]">
            <VideoPlayer 
              src="/assets/content/blog/videos/ticketteam.mp4" 
              aspectRatio="portrait"
              className="w-full h-full"
              subtitles={[
                { src: '/assets/content/blog/videos/ticketteam-nl.vtt', label: 'Nederlands', srcLang: 'nl' },
                { src: '/assets/content/blog/videos/ticketteam-fr.vtt', label: 'Français', srcLang: 'fr' },
                { src: '/assets/content/blog/videos/ticketteam-en.vtt', label: 'English', srcLang: 'en' }
              ]}
            />
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
