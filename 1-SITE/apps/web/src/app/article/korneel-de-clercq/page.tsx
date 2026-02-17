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
import { Quote, ArrowLeft, Radio, Youtube, Play } from "lucide-react";
import Link from "next/link";
import { VideoPlayer } from "@/components/academy/VideoPlayer";

/**
 * ARTICLE: KORNEEL-DE-CLERCQ (PHYSICAL FALLBACK)
 * Theme: Stories
 */
export default function KorneelStoryPage() {
  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
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
            <VoiceglotText translationKey="story.korneel.title" defaultText="In de studio bij: Korneel De Clercq" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between"
          >
            <ContainerInstrument className="space-y-8">
              <Radio strokeWidth={1.5} size={40} className="text-primary" />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight leading-none">
                <VoiceglotText translationKey="story.korneel.subtitle" defaultText="De vertrouwde stem van Radio 1." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-medium text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.korneel.text" 
                  defaultText="Korneel De Clercq is een icoon op de Vlaamse radio. We doken zijn studio in om te ontdekken hoe hij zijn jarenlange ervaring als presentator vertaalt naar het vak van voice-over." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-6 flex flex-col justify-center overflow-hidden">
            <VideoPlayer 
              src="/assets/video/studio/korneel-de-clercq.mp4" 
              aspectRatio="portrait"
              className="w-full h-full"
            />
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
