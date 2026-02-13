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
import { Mic2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { VideoPlayer } from "@/components/ui/VideoPlayer";

/**
 * ARTICLE: ILARI-HOEVENAARS (PHYSICAL FALLBACK)
 * Theme: Stories
 */
export default function IlariStoryPage() {
  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
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
            <VoiceglotText translationKey="story.ilari.title" defaultText="In de studio bij: Ilari Hoevenaars" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between !rounded-[20px]"
          >
            <ContainerInstrument className="space-y-8">
              <Mic2 size={40} className="text-primary" strokeWidth={1.5} />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight leading-none text-va-black uppercase">
                <VoiceglotText translationKey="story.ilari.subtitle" defaultText="De stem van WAZE en Hornbach over zijn ambacht." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.ilari.text" 
                  defaultText="Ilari Hoevenaars is een van de meest gevraagde stemmen van Nederland. We namen een kijkje in zijn studio en vroegen hem naar zijn geheim voor een perfecte take." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-6 flex flex-col justify-center overflow-hidden !rounded-[20px]">
            <VideoPlayer 
              src="/assets/video/studio/ilari.mp4" 
              aspectRatio="portrait"
              className="w-full h-full"
            />
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
