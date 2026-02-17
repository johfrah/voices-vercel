import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { VideoPlayer } from "@/components/academy/VideoPlayer";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { Metadata } from 'next';
import Link from "next/link";
import React from 'react';

export const metadata: Metadata = {
  title: 'CREO: Het belang van een eerste indruk | Voices.be Stories',
  description: 'Hoe onderwijsinstelling CREO zorgt voor een professioneel telefonisch onthaal dat matcht met hun kwalitatieve opleidingen.',
  openGraph: {
    title: 'CREO | Voices.be Stories',
    description: 'Klantverhaal over professioneel onthaal bij CREO.',
    images: ['/assets/content/blog/videos/peter-van-creo.mp4'],
  }
};

/**
 * ARTICLE: STORY-CREO (PHYSICAL FALLBACK)
 * Theme: Stories
 */
export default function CreoStoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "CREO Testimonial - Voices.be",
    "description": "Peter Verbrugghe over het belang van een professionele eerste indruk bij CREO.",
    "thumbnailUrl": "/assets/img/testimonials/creo-thumb.jpg",
    "uploadDate": "2026-02-10",
    "contentUrl": "/assets/content/blog/videos/peter-van-creo.mp4",
    "embedUrl": "https://voices.be/article/story-creo"
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
            className="inline-flex items-center gap-2 text-[15px] font-light tracking-[0.2em] text-va-black/40 hover:text-primary transition-all mb-8 "
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> 
            <VoiceglotText translationKey="article.back" defaultText="Terug naar de etalage" />
          </Link>
          <TextInstrument className="text-[15px] font-light tracking-[0.2em] text-primary mb-4 ">
            <VoiceglotText translationKey="article.theme.stories" defaultText="Stories" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none mb-6 text-va-black ">
            <VoiceglotText translationKey="story.creo.title" defaultText="CREO | De eerste indruk" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between !rounded-[20px]"
          >
            <ContainerInstrument className="space-y-8">
              <GraduationCap size={40} className="text-primary" strokeWidth={1.5} />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight leading-none text-va-black ">
                <VoiceglotText translationKey="story.creo.subtitle" defaultText="Het telefonisch onthaal is super belangrijk." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.creo.text" 
                  defaultText="Peter Verbrugghe van CREO legt uit waarom een professionele stem essentieel is voor een onderwijsinstelling: 'Het is zoals wanneer je iemand voor de eerste keer ziet. Die eerste indruk telt.'" 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-6 flex flex-col justify-center overflow-hidden !rounded-[20px]">
            <VideoPlayer 
              src="/assets/content/blog/videos/peter-van-creo.mp4" 
              aspectRatio="portrait"
              className="w-full h-full"
              subtitles={[
                { src: '/assets/content/blog/videos/peter-van-creo-nl.vtt', label: 'Nederlands', srcLang: 'nl' },
                { src: '/assets/content/blog/videos/peter-van-creo-fr.vtt', label: 'Franais', srcLang: 'fr' },
                { src: '/assets/content/blog/videos/peter-van-creo-en.vtt', label: 'English', srcLang: 'en' }
              ]}
            />
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
