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
import { Lightbulb, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Audio Branding: Het geheim van Coolblue | Voices.be Inspiratie',
  description: 'Leer van de beste: waarom Coolblue audio-branding inzet voor hun legendarische klantvriendelijkheid.',
  openGraph: {
    title: 'Audio Branding: Het geheim van Coolblue',
    description: 'Inspiratie over de kracht van audio-branding bij Coolblue.',
    images: ['/assets/content/blog/videos/coolblue.mp4'],
  }
};

/**
 * ARTICLE: COOLBLUE-STORY (PHYSICAL FALLBACK)
 * Theme: Inspiratie
 */
export default function CoolblueStoryArticlePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Audio Branding: Het geheim van Coolblue",
    "description": "Waarom audio-branding cruciaal is voor klantvriendelijkheid.",
    "image": "/assets/img/inspiration/coolblue-thumb.jpg",
    "datePublished": "2026-02-10",
    "author": {
      "@type": "Organization",
      "name": "Voices.be"
    }
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
            <VoiceglotText translationKey="article.theme.inspiration" defaultText="Inspiratie" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none mb-6 text-va-black uppercase">
            <VoiceglotText translationKey="story.coolblue.title" defaultText="Audio Branding: Het geheim van Coolblue" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between !rounded-[20px]"
          >
            <ContainerInstrument className="space-y-8">
              <Lightbulb size={40} className="text-primary" strokeWidth={1.5} />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight leading-none text-va-black uppercase">
                <VoiceglotText translationKey="story.coolblue.subtitle" defaultText="Waarom audio-branding cruciaal is voor klantvriendelijkheid." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.coolblue.text" 
                  defaultText="Coolblue begrijpt als geen ander dat elk contactmoment telt. Hun audio-branding is een essentieel voorbeeld van hoe je de 'glimlach' consistent doorvoert, ook aan de telefoon." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-6 flex flex-col justify-center overflow-hidden !rounded-[20px]">
            <VideoPlayer 
              src="/assets/content/blog/videos/coolblue.mp4" 
              aspectRatio="portrait"
              className="w-full h-full"
            />
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
