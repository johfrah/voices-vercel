import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { ArrowLeft, Quote } from "lucide-react";
import { Metadata } from 'next';
import Link from "next/link";
import React from 'react';

export const metadata: Metadata = {
  title: 'SKYGGE: Professionalisering via audio | Voices.be Stories',
  description: 'Hoe mede-zaakvoerder An Casters met een professionele telefooncentrale zorgt voor een onvergetelijke eerste indruk.',
  openGraph: {
    title: 'SKYGGE | Voices.be Stories',
    description: 'Klantverhaal over de impact van professionele audio bij SKYGGE.',
    images: ['/assets/content/blog/videos/voor-ons-was-dit-een-no-brainer.mp4'],
  }
};

/**
 * ARTICLE: STORY-SKYGGE (PHYSICAL FALLBACK)
 * Theme: Stories
 */
export default function SkyggeArticlePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "SKYGGE Testimonial - Voices.be",
    "description": "An Casters over de voordelen van een professionele telefooncentrale.",
    "thumbnailUrl": "/assets/img/testimonials/skygge-thumb.jpg",
    "uploadDate": "2026-02-10",
    "contentUrl": "/assets/content/blog/videos/voor-ons-was-dit-een-no-brainer.mp4",
    "embedUrl": "https://voices.be/article/story-skygge"
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
            <VoiceglotText translationKey="story.skygge.title" defaultText="SKYGGE | Professionalisering via audio" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between !rounded-[20px]"
          >
            <ContainerInstrument className="space-y-8">
              <Quote size={40} className="text-primary" strokeWidth={1.5} />
              <HeadingInstrument level={2} className="text-4xl font-light italic leading-tight text-va-black">
                <VoiceglotText 
                  translationKey="story.skygge.quote1" 
                  defaultText="Dat was een no-brainer. Je kunt privé van zakelijk scheiden en je 100% focussen op de klant." 
                />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.skygge.text" 
                  defaultText="An Casters van SKYGGE koos voor een professionele telefooncentrale om de groei van haar bedrijf te ondersteunen. Ontdek hoe audio bijdraagt aan hun merkbeleving." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-6 flex flex-col justify-center overflow-hidden !rounded-[20px]">
            <VideoPlayer 
              src="/assets/content/blog/videos/voor-ons-was-dit-een-no-brainer.mp4" 
              aspectRatio="portrait"
              className="w-full h-full"
              subtitles={[
                { src: '/assets/content/blog/videos/voor-ons-was-dit-een-no-brainer-nl.vtt', label: 'Nederlands', srcLang: 'nl' },
                { src: '/assets/content/blog/videos/voor-ons-was-dit-een-no-brainer-fr.vtt', label: 'Français', srcLang: 'fr' },
                { src: '/assets/content/blog/videos/voor-ons-was-dit-een-no-brainer-en.vtt', label: 'English', srcLang: 'en' }
              ]}
            />
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
