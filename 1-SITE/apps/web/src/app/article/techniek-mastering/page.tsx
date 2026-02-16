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
import { Zap, ShieldCheck, ArrowLeft, Headphones } from "lucide-react";
import Link from "next/link";

/**
 * ARTICLE: TECHNIEK-MASTERING (PHYSICAL FALLBACK)
 * Theme: Beleving
 */
export default function MasteringArticlePage() {
  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <LiquidBackground />
      
      <SectionInstrument className="max-w-6xl mx-auto px-6 relative z-10">
        <ContainerInstrument className="mb-12">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-[15px] font-light tracking-[0.2em] text-va-black/40 hover:text-primary transition-all mb-8 "
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> 
            <VoiceglotText translationKey="article.back" defaultText="Terug naar de etalage" />
          </Link>
          <TextInstrument className="text-[15px] font-light tracking-[0.2em] text-primary mb-4 ">
            <VoiceglotText translationKey="article.theme.experience" defaultText="Beleving" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none mb-6 text-va-black ">
            <VoiceglotText translationKey="mastering.title" defaultText="Loudness & Mastering | Waarom onze audio straalt" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="full" 
            className="hmagic text-white p-16 flex flex-col md:flex-row items-center gap-12 !rounded-[20px]"
          >
            <ContainerInstrument className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Headphones size={48} className="text-white" strokeWidth={1.5} />
            </ContainerInstrument>
            <ContainerInstrument className="space-y-6">
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight ">
                <VoiceglotText translationKey="mastering.intro.title" defaultText="Geen rauwe opnames, maar afgewerkte producten." />
              </HeadingInstrument>
              <TextInstrument className="text-white/80 text-lg font-light leading-relaxed">
                <VoiceglotText 
                  translationKey="mastering.intro.text" 
                  defaultText="Bij Voices.be leveren we geen 'ruwe' audio. Elke stemopname gaat door onze mastering-engine voor die warme, volle broadcast-kwaliteit." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="md" className="bg-white shadow-aura p-12 !rounded-[20px]">
            <Zap size={32} className="text-primary mb-6" strokeWidth={1.5} />
            <HeadingInstrument level={3} className="text-2xl font-light tracking-tight mb-4 text-va-black ">
              <VoiceglotText translationKey="mastering.cleaning.title" defaultText="Audio Cleaning" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/60 font-light leading-relaxed">
              <VoiceglotText translationKey="mastering.cleaning.text" defaultText="We verwijderen storende bijgeluiden zoals smakjes of ademhalingen die de verstaanbaarheid in de weg zitten." />
            </TextInstrument>
          </BentoCard>

          <BentoCard span="md" className="bg-va-black text-white p-12 !rounded-[20px]">
            <ShieldCheck size={32} className="text-primary mb-6" strokeWidth={1.5} />
            <HeadingInstrument level={3} className="text-2xl font-light tracking-tight mb-4 ">
              <VoiceglotText translationKey="mastering.loudness.title" defaultText="Loudness" />
            </HeadingInstrument>
            <TextInstrument className="text-white/60 font-light leading-relaxed">
              <VoiceglotText translationKey="mastering.loudness.text" defaultText="We zorgen dat het volume precies goed is: niet te zacht, maar ook niet overstuurd. Direct klaar voor elk platform." />
            </TextInstrument>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
