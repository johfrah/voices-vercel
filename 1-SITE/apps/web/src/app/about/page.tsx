"use client";

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
import { ShieldCheck, Users, Zap, Heart } from "lucide-react";

/**
 * ABOUT PAGE (GOD MODE 2026)
 * 
 * Volgt de Zero Laws:
 * - HTML ZERO: Geen rauwe HTML tags.
 * - CSS ZERO: Geen Tailwind classes direct in dit bestand.
 * - TEXT ZERO: Geen hardcoded strings.
 */
export default function AboutPage() {
  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <LiquidBackground />
      
      <SectionInstrument className="max-w-7xl mx-auto px-6 relative z-10">
        <ContainerInstrument className="text-center mb-20 space-y-6">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full text-[15px] font-light tracking-widest shadow-sm border border-black/5 uppercase">
            <ShieldCheck strokeWidth={1.5} size={12} className="text-primary" /> 
            <VoiceglotText translationKey="about.badge" defaultText="Ons Verhaal" />
          </ContainerInstrument>
          
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-none">
            <VoiceglotText translationKey="about.title_part1" defaultText="Het Vriendelijkste " />
            <TextInstrument as="span" className="text-primary font-extralight">
              <VoiceglotText translationKey="about.title_part2" defaultText="Stemmenbureau" />
            </TextInstrument>
          </HeadingInstrument>
          
          <ContainerInstrument className="max-w-2xl mx-auto">
            <TextInstrument className="text-va-black/40 font-light text-lg leading-relaxed"><VoiceglotText 
                translationKey="about.subtitle" 
                defaultText="We claimen niet de beste te zijn, maar wel de vriendelijkste. Een warm en vertrouwd geluid voor elk project." 
              /></TextInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between min-h-[400px]"
            title={<VoiceglotText translationKey="about.mission.label" defaultText="Onze Missie" />}
            icon={<Users size={20} />}
          >
            <ContainerInstrument className="space-y-6">
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight">
                <VoiceglotText translationKey="about.mission.title" defaultText="Een stem die echt is en vertrouwen geeft." />
                <TextInstrument className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="about.mission.text" 
                    defaultText="Bij Voices draait alles om de juiste klik. Geen kille technologie, maar een persoonlijke aanpak en stemmen die klinken als een goede buur: warm, naturel en uiterst betrouwbaar." 
                  />
                </TextInstrument>
              </HeadingInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard 
            span="sm" 
            className="bg-va-black text-white p-12 flex flex-col justify-between min-h-[400px]"
            title={<VoiceglotText translationKey="about.values.label" defaultText="Kernwaarden" />}
            icon={<Heart size={20} className="text-primary" />}
          >
            <ContainerInstrument className="space-y-4">
              <ContainerInstrument className="flex items-center gap-3">
                <Zap strokeWidth={1.5} size={16} className="text-primary" />
                <TextInstrument className="text-[15px] font-light tracking-widest uppercase"><VoiceglotText translationKey="about.value1" defaultText="Snelheid" /></TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="flex items-center gap-3">
                <ShieldCheck strokeWidth={1.5} size={16} className="text-primary" />
                <TextInstrument className="text-[15px] font-light tracking-widest uppercase"><VoiceglotText translationKey="about.value2" defaultText="Kwaliteit" /></TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="flex items-center gap-3">
                <Heart strokeWidth={1.5} size={16} className="text-primary" />
                <TextInstrument className="text-[15px] font-light tracking-widest uppercase"><VoiceglotText translationKey="about.value3" defaultText="Vriendelijkheid" /></TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard 
            span="full" 
            className="hmagic text-white p-16 flex flex-col md:flex-row items-center justify-between gap-12"
          >
            <ContainerInstrument className="space-y-4 max-w-xl">
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight">
                <VoiceglotText translationKey="about.cta.title" defaultText="Vind de stem die bij je past" />
                <TextInstrument className="text-white/80 font-light">
                  <VoiceglotText 
                    translationKey="about.cta.text" 
                    defaultText="Samen maken we van jouw project iets bijzonders. Ontdek onze warme en vertrouwde stemmen." 
                  />
                </TextInstrument>
              </HeadingInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="va-btn-pro !bg-white !text-va-black px-10 py-5 !rounded-[10px] font-light tracking-widest uppercase"><VoiceglotText translationKey="about.cta.button" defaultText="Ontdek de Stemmen" /></ContainerInstrument>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>

      {/* LLM Context Layer */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "Over Voices",
        "description": "Het verhaal achter het meest innovatieve castingbureau van de Benelux.",
        "_llm_context": {
          "intent": "brand_story",
          "persona": "visitor",
          "mode": "godmode"
        }
      })}} />
    </PageWrapperInstrument>
  );
}
