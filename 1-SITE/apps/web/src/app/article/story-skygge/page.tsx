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
import { Quote, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * ARTICLE: STORY-SKYGGE (PHYSICAL FALLBACK)
 * Theme: Stories
 */
export default function SkyggeArticlePage() {
  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <LiquidBackground />
      
      <SectionInstrument className="max-w-5xl mx-auto px-6 relative z-10">
        <ContainerInstrument className="mb-12">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-[15px] font-light tracking-[0.2em] text-va-black/40 hover:text-primary transition-all mb-8 "
          >
            <ArrowLeft strokeWidth={1.5} size={14} /> 
            <VoiceglotText translationKey="article.back" defaultText="Terug naar de etalage" />
          </Link>
          <TextInstrument className="text-[15px] font-light tracking-[0.2em] text-primary mb-4 ">
            <VoiceglotText translationKey="article.theme.stories" defaultText="Stories" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none mb-6 text-va-black ">
            <VoiceglotText translationKey="story.skygge.title" defaultText="SKYGGE | Professionalisering via audio" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={2}>
          <BentoCard 
            span="full" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-16 !rounded-[20px]"
          >
            <Quote strokeWidth={1.5} size={48} className="text-primary/20 mb-8" />
            <HeadingInstrument level={2} className="text-4xl font-light italic leading-tight mb-8 text-va-black">
              <VoiceglotText 
                translationKey="story.skygge.quote1" 
                defaultText="Dat was een no-brainer. Je kunt privé van zakelijk scheiden en je 100% focussen op de klant. Geen telefoontjes meer om tien uur 's avonds." 
              />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 font-light text-lg leading-relaxed">
              <VoiceglotText 
                translationKey="story.skygge.text" 
                defaultText="An Casters van SKYGGE koos voor een professionele telefooncentrale om de groei van haar bedrijf te ondersteunen. Ontdek hoe audio bijdraagt aan hun merkbeleving." 
              />
            </TextInstrument>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
