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
import { ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * ARTICLE: JOKERSHOP (PHYSICAL FALLBACK)
 * Theme: Stories
 */
export default function JokershopStoryPage() {
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
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
