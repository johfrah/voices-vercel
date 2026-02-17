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
import { Quote, ArrowLeft, Recycle } from "lucide-react";
import Link from "next/link";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fost Plus: Helderheid in recyclage | Voices.be Stories',
  description: 'Ontdek hoe Fost Plus audio inzet voor een duurzame boodschap en een helder onthaal aan de telefoon.',
  openGraph: {
    title: 'Fost Plus: Helderheid in recyclage',
    description: 'Klantverhaal over de kracht van een professionele stem bij Fost Plus.',
    images: ['/assets/content/blog/videos/review-fostplus.mp4'], // Note: should ideally be a poster image
  }
};

/**
 * ARTICLE: FOST-PLUS (PHYSICAL FALLBACK)
 * Theme: Stories
 */
export default function FostPlusStoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Fost Plus Testimonial - Voices.be",
    "description": "Hoe audio bijdraagt aan een duurzame boodschap bij Fost Plus.",
    "thumbnailUrl": "/assets/img/testimonials/fostplus-thumb.jpg",
    "uploadDate": "2026-02-10",
    "contentUrl": "/assets/content/blog/videos/review-fostplus.mp4",
    "embedUrl": "https://voices.be/article/fost-plus"
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
            className="inline-flex items-center gap-2 text-[15px] font-black tracking-widest text-va-black/40 hover:text-primary transition-all mb-8"
          >
            <ArrowLeft strokeWidth={1.5} size={14} /> 
            <VoiceglotText translationKey="article.back" defaultText="Terug naar de etalage" />
          </Link>
          <TextInstrument className="text-[15px] font-black tracking-[0.2em] text-primary mb-4">
            <VoiceglotText translationKey="article.theme.stories" defaultText="Stories" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none mb-6">
            <VoiceglotText translationKey="story.fostplus.title" defaultText="Fost Plus: Helderheid in recyclage" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between"
          >
            <ContainerInstrument className="space-y-8">
              <Recycle strokeWidth={1.5} size={40} className="text-primary" />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight leading-none">
                <VoiceglotText translationKey="story.fostplus.subtitle" defaultText="Hoe audio bijdraagt aan een duurzame boodschap." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-medium text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.fostplus.text" 
                  defaultText="Fost Plus staat voor een complexe missie: recyclage begrijpelijk maken voor iedereen. Een heldere, betrouwbare stem aan de telefoon is daarbij het eerste contactpunt voor hun partners en burgers." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-6 flex flex-col justify-center overflow-hidden">
            <VideoPlayer 
              src="/assets/content/blog/videos/review-fostplus.mp4" 
              aspectRatio="portrait"
              className="w-full h-full"
              subtitles={[
                { src: '/assets/content/blog/videos/review-fostplus-nl.vtt', label: 'Nederlands', srcLang: 'nl' },
                { src: '/assets/content/blog/videos/review-fostplus-fr.vtt', label: 'Franais', srcLang: 'fr' },
                { src: '/assets/content/blog/videos/review-fostplus-en.vtt', label: 'English', srcLang: 'en' }
              ]}
            />
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
