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
import { Quote, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ACLVB: Een menselijke stem voor de vakbond | Voices.be Stories',
  description: 'Ontdek hoe ACLVB toegankelijkheid en nabijheid creëert via een warme, professionele stem.',
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
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-va-black/40 hover:text-primary transition-all mb-8"
          >
            <ArrowLeft size={14} /> 
            <VoiceglotText translationKey="article.back" defaultText="Terug naar de etalage" />
          </Link>
          <TextInstrument className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">
            <VoiceglotText translationKey="article.theme.stories" defaultText="Stories" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-black uppercase tracking-tighter leading-none mb-6">
            <VoiceglotText translationKey="story.aclvb.title" defaultText="ACLVB: Een menselijke stem voor de vakbond" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between"
          >
            <ContainerInstrument className="space-y-8">
              <Users size={40} className="text-primary" />
              <HeadingInstrument level={2} className="text-4xl font-black uppercase tracking-tight leading-none">
                <VoiceglotText translationKey="story.aclvb.subtitle" defaultText="Toegankelijkheid en nabijheid via audio." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-medium text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.aclvb.text" 
                  defaultText="Voor een vakbond als ACLVB is bereikbaarheid essentieel. Een warme, professionele stem aan de telefoon zorgt ervoor dat leden zich meteen gehoord en welkom voelen, nog voor ze een medewerker spreken." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-6 flex flex-col justify-center overflow-hidden">
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
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
