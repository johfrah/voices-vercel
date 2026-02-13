import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { SpotlightDashboard } from "@/components/ui/SpotlightDashboard";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Construction, Mic, Star, Zap } from "lucide-react";
import Link from "next/link";
import { 
  ButtonInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  InputInstrument,
  SectionInstrument, 
  TextInstrument 
} from "./LayoutInstruments";

export default function LiteFrontpage() {
  return (
    <SectionInstrument as="main" className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 relative z-10">
      <SpotlightDashboard strokeWidth={1.5} />

      {/* Hero Section - Lite Version */}
      <ContainerInstrument className="mb-24 md:mb-32 space-y-8 md:space-y-10 animate-fade-in">
        <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] md:text-[15px] font-light tracking-widest border border-primary/10 ">
          <Construction strokeWidth={1.5} size={12} className="animate-pulse" /> 
          <VoiceglotText  translationKey="lite.badge" defaultText="Voices in Aanbouw" />
        </ContainerInstrument>
        <HeadingInstrument level={1} className="text-5xl md:text-[120px] font-light leading-[0.85] tracking-tighter max-w-5xl ">
          <VoiceglotText  translationKey="lite.title.part1" defaultText="De" /> <TextInstrument as="span" className="text-primary font-light"><VoiceglotText  translationKey="lite.title.highlight" defaultText="vriendelijkste" /></TextInstrument> <br/>
          <VoiceglotText  translationKey="lite.title.part2" defaultText="Stemmen-Ervaring." />
        </HeadingInstrument>
        <ContainerInstrument className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12 pt-4">
          <TextInstrument className="text-lg md:text-xl text-va-black/60 max-w-md font-light leading-relaxed">
            <VoiceglotText  
              translationKey="lite.intro" 
              defaultText="We bouwen momenteel aan het meest intelligente stemmen-ecosysteem van 2026. Binnenkort openen we de deuren van ons vernieuwde platform." 
            />
          </TextInstrument>
          <ContainerInstrument className="flex gap-4">
            <ButtonInstrument 
              as={Link}
              href="/agency" 
              className="va-btn-pro !px-8 md:!px-10 !py-4 md:!py-6 text-base font-light tracking-widest "
            >
              <VoiceglotText  translationKey="lite.cta" defaultText="Bekijk Stemmen" />
            </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </ContainerInstrument>

      {/* Bento Grid - Lite Features */}
      <BentoGrid strokeWidth={1.5} className="mb-24 md:mb-32">
        <BentoCard span="xl" className="h-auto md:h-[400px] flex flex-col justify-between group overflow-hidden relative p-8 md:p-12 bg-va-black text-white !rounded-[20px]">
          <ContainerInstrument className="relative z-10">
            <ContainerInstrument className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-[15px] md:rounded-[20px] flex items-center justify-center text-white mb-6 md:mb-8 shadow-lg shadow-primary/20">
              <Mic size={24} md:size={32} strokeWidth={1.5} />
            </ContainerInstrument>
            <HeadingInstrument level={3} className="text-3xl md:text-5xl font-light tracking-tighter mb-4 md:mb-6 leading-none text-primary ">
              <VoiceglotText  translationKey="lite.feature1.title" defaultText="Voices Platform" />
            </HeadingInstrument>
            <TextInstrument className="text-white/50 font-light max-w-sm text-base md:text-lg">
              <VoiceglotText  translationKey="lite.feature1.text" defaultText="Een actieve, geautomatiseerde verkoper die 24/7 voor u klaarstaat." />
            </TextInstrument>
          </ContainerInstrument>
          <ContainerInstrument className="absolute -bottom-40 -right-40 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-primary/10 rounded-full blur-[100px] md:blur-[120px] group-hover:bg-primary/20 transition-all duration-1000" />
        </BentoCard>

        <ContainerInstrument className="grid grid-cols-1 gap-6 md:gap-8">
          <BentoCard span="sm" className="bg-white border border-black/5 p-6 md:p-8 flex flex-col justify-between h-auto md:h-[184px] shadow-sm !rounded-[20px]">
            <ContainerInstrument>
              <Zap strokeWidth={1.5} className="text-primary mb-4" size={24} />
              <HeadingInstrument level={3} className="text-lg md:text-xl font-light tracking-tight mb-2 ">
                <VoiceglotText  translationKey="lite.feature2.title" defaultText="Snelheid" />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/40 text-[15px] md:text-[15px] font-light leading-relaxed">
                <VoiceglotText  translationKey="lite.feature2.text" defaultText="Geleverd binnen 24 uur, direct in uw inbox." />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="hmagic text-white p-6 md:p-8 flex flex-col justify-between h-auto md:h-[184px] !rounded-[20px]">
            <ContainerInstrument>
              <Star strokeWidth={1.5} className="mb-4 text-white" size={24} />
              <HeadingInstrument level={3} className="text-lg md:text-xl font-light tracking-tight mb-2 ">
                <VoiceglotText  translationKey="lite.feature3.title" defaultText="Kwaliteit" />
              </HeadingInstrument>
              <TextInstrument className="text-white/80 text-[15px] md:text-[15px] font-light leading-relaxed">
                <VoiceglotText  translationKey="lite.feature3.text" defaultText="Alleen de beste stemmen, handmatig geselecteerd." />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>
        </ContainerInstrument>
      </BentoGrid>

      {/* Status Bento */}
      <BentoCard span="full" className="bg-va-off-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 border border-black/5 mb-24 md:mb-32 !rounded-[20px]">
        <ContainerInstrument className="space-y-3 md:space-y-4 text-center md:text-left">
          <HeadingInstrument level={2} className="text-3xl md:text-4xl font-light tracking-tighter ">
            <VoiceglotText  translationKey="lite.status.title" defaultText="Blijf op de" /> <TextInstrument as="span" className="text-primary font-light"><VoiceglotText  translationKey="lite.status.highlight" defaultText="hoogte" /></TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-light">
            <VoiceglotText  translationKey="lite.status.text" defaultText="Laat je e-mail achter voor exclusieve toegang tot de launch." />
          </TextInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="flex w-full md:w-auto gap-3 md:gap-4">
          <InputInstrument 
            type="email" 
            placeholder="jouw@email.com" 
            className="flex-1 md:w-80 px-6 md:px-8 py-4 md:py-6 rounded-[10px] bg-white border border-black/5 font-light focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
          <ButtonInstrument className="va-btn-pro !px-6 md:!px-10 font-light tracking-widest ">
            <VoiceglotText  translationKey="lite.status.cta" defaultText="Launch Alert" />
          </ButtonInstrument>
        </ContainerInstrument>
      </BentoCard>

      {/* Footer Lite */}
      <ContainerInstrument className="text-center py-12 md:py-20 border-t border-black/5">
        <TextInstrument className="text-[15px] md:text-[15px] font-light tracking-[0.3em] text-va-black/20 ">
          <VoiceglotText  translationKey="auto.litefrontpage.voices__copy__2026.44a3a4" defaultText="Voices &copy; 2026" />
        </TextInstrument>
      </ContainerInstrument>

      {/* LLM Context Layer */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Voices Lite",
        "description": "Voices is currently under construction",
        "data-voices-context": "Landing",
        "data-voices-intent": "Waiting",
        "_llm_context": {
          "intent": "wait_for_launch",
          "persona": "visitor"
        }
      })}} />
    </SectionInstrument>
  );
}
