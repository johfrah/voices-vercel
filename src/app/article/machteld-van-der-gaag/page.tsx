import React from 'react';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument,
  HeadingInstrument,
  TextInstrument,
  ButtonInstrument
} from "@/components/ui/LayoutInstruments";
import { BentoGrid, BentoCard } from "@/components/ui/BentoGrid";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { Quote, ArrowLeft, Home, Youtube, Play } from "lucide-react";
import Link from "next/link";
import { VideoPlayer } from "@/components/ui/VideoPlayer";

/**
 * ARTICLE: MACHTELD-VAN-DER-GAAG (PHYSICAL FALLBACK)
 * Theme: Stories
 */
export default function MachteldStoryPage() {
  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
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
            <VoiceglotText translationKey="story.machteld.title" defaultText="In de studio bij: Machteld van der Gaag" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between"
          >
            <ContainerInstrument className="space-y-8">
              <Home size={40} className="text-primary" />
              <HeadingInstrument level={2} className="text-4xl font-black uppercase tracking-tight leading-none">
                <VoiceglotText translationKey="story.machteld.subtitle" defaultText="Drietalig talent in haar nieuwe Home-Sweet-Home studio." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-medium text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.machteld.text" 
                  defaultText="Machteld Van Der Gaag is één van de meest-gevraagde drietalige voice-over stemmen van Nederland. We kregen de primeur om haar gloednieuwe studio uit te proberen." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-6 flex flex-col justify-center overflow-hidden">
            <VideoPlayer 
              src="/assets/video/studio/machteld-van-der-gaag.mp4" 
              aspectRatio="portrait"
              className="w-full h-full"
            />
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
