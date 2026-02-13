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
            href="/agency" 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-va-black/40 hover:text-primary transition-all mb-8"
          >
            <ArrowLeft size={14} /> 
            <VoiceglotText translationKey="article.back" defaultText="Terug naar overzicht" />
          </Link>
          <TextInstrument className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">
            <VoiceglotText translationKey="article.theme.stories" defaultText="Stories" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-black uppercase tracking-tighter leading-none mb-6">
            <VoiceglotText translationKey="story.skygge.title" defaultText="SKYGGE | Professionalisering via audio" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={2}>
          <BentoCard 
            span="full" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-16"
          >
            <Quote size={48} className="text-primary/20 mb-8" />
            <HeadingInstrument level={2} className="text-4xl font-light italic leading-tight mb-8">
              <VoiceglotText 
                translationKey="story.skygge.quote1" 
                defaultText="Dat was een no-brainer. Je kunt privé van zakelijk scheiden en je 100% focussen op de klant. Geen telefoontjes meer om tien uur 's avonds." 
              />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 font-black uppercase tracking-widest text-xs">
              — An Casters, Mede-zaakvoerder SKYGGE
            </TextInstrument>
          </BentoCard>

          <BentoCard span="md" className="bg-va-black text-white p-12">
            <HeadingInstrument level={3} className="text-2xl font-black uppercase tracking-tight mb-6">
              <VoiceglotText translationKey="story.skygge.challenge.title" defaultText="De Uitdaging" />
            </HeadingInstrument>
            <TextInstrument className="text-white/60 leading-relaxed">
              <VoiceglotText translationKey="story.skygge.challenge.text" defaultText="Als groeiend bedrijf wil je bereikbaar zijn, maar ook je grenzen bewaken. Een professionele uitstraling aan de telefoon is daarbij essentieel." />
            </TextInstrument>
          </BentoCard>

          <BentoCard span="md" className="bg-va-off-white p-12">
            <HeadingInstrument level={3} className="text-2xl font-black uppercase tracking-tight mb-6">
              <VoiceglotText translationKey="story.skygge.solution.title" defaultText="De Oplossing" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/60 leading-relaxed">
              <VoiceglotText translationKey="story.skygge.solution.text" defaultText="Door te kiezen voor een professionele stem van Voices.be, klinkt SKYGGE nu vanaf de eerste seconde betrouwbaar en deskundig." />
            </TextInstrument>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
