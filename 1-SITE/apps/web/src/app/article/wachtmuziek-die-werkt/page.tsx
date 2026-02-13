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
import { Music, Zap, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * ARTICLE: WACHTMUZIEK-DIE-WERKT (PHYSICAL FALLBACK)
 * Theme: Beleving
 */
export default function MusicArticlePage() {
  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <LiquidBackground />
      
      <SectionInstrument className="max-w-6xl mx-auto px-6 relative z-10">
        <ContainerInstrument className="mb-12">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-[15px] font-light tracking-[0.2em] text-va-black/40 hover:text-primary transition-all mb-8 "
          >
            <ArrowLeft strokeWidth={1.5} size={14} /> 
            <VoiceglotText translationKey="article.back" defaultText="Terug naar de etalage" />
          </Link>
          <TextInstrument className="text-[15px] font-light tracking-[0.2em] text-primary mb-4 ">
            <VoiceglotText translationKey="article.theme.experience" defaultText="Beleving" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none mb-6 text-va-black ">
            <VoiceglotText translationKey="music.title" defaultText="Wachtmuziek die werkt" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="full" 
            className="hmagic text-white p-16 flex flex-col md:flex-row items-center gap-12 !rounded-[20px]"
          >
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center shrink-0 animate-pulse">
              <Music size={48} className="text-white" />
            </div>
            <ContainerInstrument className="space-y-6">
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight ">
                <VoiceglotText translationKey="music.psychology.title" defaultText="De psychologie van het wachten" />
              </HeadingInstrument>
              <TextInstrument className="text-white/80 text-lg font-light leading-relaxed">
                <VoiceglotText 
                  translationKey="music.psychology.text" 
                  defaultText="Wachtmuziek is meer dan vulling. Het is een kans om je merkidentiteit te versterken en de beller in de juiste stemming te brengen. Goede muziek verlaagt de irritatie en verhoogt de retentie." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="md" className="bg-white shadow-aura p-12 !rounded-[20px]">
            <Zap strokeWidth={1.5} size={32} className="text-primary mb-6" />
            <HeadingInstrument level={3} className="text-2xl font-light tracking-tight mb-4 text-va-black ">
              <VoiceglotText translationKey="music.quality.title" defaultText="Geoptimaliseerd" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/60 font-light leading-relaxed">
              <VoiceglotText translationKey="music.quality.text" defaultText="Al onze muziek is technisch geoptimaliseerd voor telefonie (300Hz - 3400Hz). Geen vervorming, maar kristalhelder geluid." />
            </TextInstrument>
          </BentoCard>

          <BentoCard span="md" className="bg-va-black text-white p-12 !rounded-[20px]">
            <ShieldCheck strokeWidth={1.5} size={32} className="text-primary mb-6" />
            <HeadingInstrument level={3} className="text-2xl font-light tracking-tight mb-4 ">
              <VoiceglotText translationKey="music.rights.title" defaultText="Rechtenvrij" />
            </HeadingInstrument>
            <TextInstrument className="text-white/60 font-light leading-relaxed">
              <VoiceglotText translationKey="music.rights.text" defaultText="Geen gedoe met Sabam of auteursrechten. Onze volledige bibliotheek is 100% rechtenvrij voor gebruik in jouw telefooncentrale." />
            </TextInstrument>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
