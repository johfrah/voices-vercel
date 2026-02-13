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
import { Radio, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NKC: De evolutie van de klantendienst | Voices.be Stories',
  description: 'Hoe NKC technologische vooruitgang en een warme aanpak combineert in hun audio-branding.',
  openGraph: {
    title: 'NKC | Voices.be Stories',
    description: 'Klantverhaal over innovatie en klantgerichtheid bij NKC.',
    images: ['/assets/content/blog/videos/nkc.mp4'],
  }
};

/**
 * ARTICLE: NKC (PHYSICAL FALLBACK)
 * Theme: Stories
 */
export default function NkcStoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "NKC Testimonial - Voices.be",
    "description": "De rol van audio in de moderne klantendienst van NKC.",
    "thumbnailUrl": "/assets/img/testimonials/nkc-thumb.jpg",
    "uploadDate": "2026-02-10",
    "contentUrl": "/assets/content/blog/videos/nkc.mp4",
    "embedUrl": "https://voices.be/article/nkc"
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
            className="inline-flex items-center gap-2 text-[10px] font-light tracking-[0.2em] text-va-black/40 hover:text-primary transition-all mb-8 uppercase"
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> 
            <VoiceglotText translationKey="article.back" defaultText="Terug naar de etalage" />
          </Link>
          <TextInstrument className="text-[10px] font-light tracking-[0.2em] text-primary mb-4 uppercase">
            <VoiceglotText translationKey="article.theme.stories" defaultText="Stories" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none mb-6 text-va-black uppercase">
            <VoiceglotText translationKey="story.nkc.title" defaultText="NKC | Evolutie in audio" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between !rounded-[20px]"
          >
            <ContainerInstrument className="space-y-8">
              <Radio size={40} className="text-primary" strokeWidth={1.5} />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight leading-none text-va-black uppercase">
                <VoiceglotText translationKey="story.nkc.subtitle" defaultText="Technologie en warmte in de klantendienst." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.nkc.text" 
                  defaultText="Hoe NKC hun audio-branding moderniseerde zonder de menselijke touch te verliezen. Een verhaal over innovatie en klantgerichtheid." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-6 flex flex-col justify-center overflow-hidden !rounded-[20px]">
            <VideoPlayer 
              src="/assets/content/blog/videos/nkc.mp4" 
              aspectRatio="portrait"
              className="w-full h-full"
              subtitles={[
                { src: '/assets/content/blog/videos/nkc-nl.vtt', label: 'Nederlands', srcLang: 'nl' },
                { src: '/assets/content/blog/videos/nkc-fr.vtt', label: 'Français', srcLang: 'fr' },
                { src: '/assets/content/blog/videos/nkc-en.vtt', label: 'English', srcLang: 'en' }
              ]}
            />
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
