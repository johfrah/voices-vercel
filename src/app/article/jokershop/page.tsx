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
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Metadata } from 'next';
import Link from "next/link";
import React from 'react';

export const metadata: Metadata = {
  title: 'Jokershop: Fun & Kwaliteit aan de telefoon | Voices.be Stories',
  description: 'Waarom ook een feestwinkel kiest voor een professionele telefooncentrale. Ontdek de audio-branding van Jokershop.',
  openGraph: {
    title: 'Jokershop | Voices.be Stories',
    description: 'Klantverhaal over de fun-factor en professionaliteit bij Jokershop.',
    images: ['/assets/content/blog/videos/review-jokershopbe.mp4'],
  }
};

/**
 * ARTICLE: JOKERSHOP (PHYSICAL FALLBACK)
 * Theme: Stories
 */
export default function JokershopStoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Jokershop Testimonial - Voices.be",
    "description": "Hoe audio bijdraagt aan de beleving bij Jokershop.",
    "thumbnailUrl": "/assets/img/testimonials/jokershop-thumb.jpg",
    "uploadDate": "2026-02-10",
    "contentUrl": "/assets/content/blog/videos/review-jokershopbe.mp4",
    "embedUrl": "https://voices.be/article/jokershop"
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
            <VoiceglotText translationKey="story.jokershop.title" defaultText="Jokershop | Fun & Kwaliteit" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between !rounded-[20px]"
          >
            <ContainerInstrument className="space-y-8">
              <ShoppingBag size={40} className="text-primary" strokeWidth={1.5} />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight leading-none text-va-black uppercase">
                <VoiceglotText translationKey="story.jokershop.subtitle" defaultText="Een professionele uitstraling voor een feestwinkel." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.jokershop.text" 
                  defaultText="Waarom ook een feestwinkel kiest voor een professionele telefooncentrale. Ontdek hoe audio bijdraagt aan de fun-factor van Jokershop." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-6 flex flex-col justify-center overflow-hidden !rounded-[20px]">
            <VideoPlayer 
              src="/assets/content/blog/videos/review-jokershopbe.mp4" 
              aspectRatio="portrait"
              className="w-full h-full"
            />
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
