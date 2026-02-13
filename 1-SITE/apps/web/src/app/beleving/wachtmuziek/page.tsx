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
import { Music, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";

/**
 * BELEVING: WACHTMUZIEK (PHYSICAL PAGE)
 * 
 * "Muziek die de hartslag van je wachtrij bepaalt."
 */
export default function MusicExperiencePage() {
  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <LiquidBackground />
      
      <SectionInstrument className="max-w-6xl mx-auto px-6 relative z-10">
        <ContainerInstrument className="mb-16">
          <TextInstrument className="text-[15px] font-black tracking-[0.2em] text-primary mb-4"><VoiceglotText translationKey="music.category" defaultText="Beleving" /></TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-black tracking-tighter leading-none mb-6"><VoiceglotText translationKey="music.title" defaultText="Wachtmuziek die werkt" /><TextInstrument className="text-xl text-va-black/40 font-medium max-w-2xl"><VoiceglotText 
              translationKey="music.intro" 
              defaultText="Muziek is de hartslag van je wachtrij. Kies de juiste sfeer en verlaag de ervaren wachttijd." 
            /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="full" 
            className="hmagic text-white p-16 flex flex-col md:flex-row items-center gap-12"
          >
            <ContainerInstrument className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center shrink-0 animate-pulse">
              <Music size={48} className="text-white" />
            </ContainerInstrument>
            <ContainerInstrument className="space-y-6">
              <HeadingInstrument level={2} className="text-4xl font-black tracking-tight"><VoiceglotText translationKey="music.psychology.title" defaultText="De psychologie van het wachten" /><TextInstrument className="text-white/80 text-lg leading-relaxed font-light"><VoiceglotText 
                  translationKey="music.psychology.text" 
                  defaultText="Wachtmuziek is meer dan vulling. Het is een kans om je merkidentiteit te versterken en de beller in de juiste stemming te brengen. Goede muziek verlaagt de irritatie en verhoogt de retentie." 
                /></TextInstrument></HeadingInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard 
            span="md" 
            className="bg-white shadow-aura p-12"
          >
            <Zap strokeWidth={1.5} size={32} className="text-primary mb-6" />
            <HeadingInstrument level={3} className="text-2xl font-black tracking-tight mb-4"><VoiceglotText translationKey="music.quality.title" defaultText="Geoptimaliseerd" /><TextInstrument className="text-va-black/60 leading-relaxed font-light"><VoiceglotText 
                translationKey="music.quality.text" 
                defaultText="Al onze muziek is technisch geoptimaliseerd voor telefonie (300Hz - 3400Hz). Geen vervorming, maar kristalhelder geluid." 
              /></TextInstrument></HeadingInstrument>
          </BentoCard>

          <BentoCard 
            span="md" 
            className="bg-va-black text-white p-12"
          >
            <ShieldCheck strokeWidth={1.5} size={32} className="text-primary mb-6" />
            <HeadingInstrument level={3} className="text-2xl font-black tracking-tight mb-4"><VoiceglotText translationKey="music.rights.title" defaultText="Rechtenvrij" /><TextInstrument className="text-white/60 leading-relaxed font-light"><VoiceglotText 
                translationKey="music.rights.text" 
                defaultText="Geen gedoe met Sabam of auteursrechten. Onze volledige bibliotheek is 100% rechtenvrij voor gebruik in jouw telefooncentrale." 
              /></TextInstrument></HeadingInstrument>
          </BentoCard>

          <BentoCard 
            span="md" 
            className="bg-va-off-white p-12 flex flex-col justify-between"
          >
            <ContainerInstrument>
              <HeadingInstrument level={3} className="text-2xl font-black tracking-tight mb-4"><VoiceglotText translationKey="music.cta.title" defaultText="Kies je sfeer" /><TextInstrument className="text-va-black/40 mb-8 font-light"><VoiceglotText translationKey="music.cta.text" defaultText="Van rustgevende piano tot energieke beats." /></TextInstrument></HeadingInstrument>
            </ContainerInstrument>
            <Link href="/agency" className="va-btn-pro w-full text-center"><VoiceglotText translationKey="music.cta.button" defaultText="Beluister de Bibliotheek" /></Link>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
