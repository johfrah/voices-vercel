import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Heart, Quote, ShieldCheck, Users, Zap } from "lucide-react";

/**
 * OVER ONS (GOD MODE 2026)
 * 
 * "Het verhaal achter de stemmen."
 */
export default function AboutPage() {
  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <LiquidBackground strokeWidth={1.5} / />
      
      <SectionInstrument className="max-w-7xl mx-auto px-6 relative z-10">
        <ContainerInstrument className="text-center mb-20 space-y-6">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full text-[15px] font-light tracking-widest shadow-sm border border-black/5 ">
            <ShieldCheck strokeWidth={1.5} size={12} className="text-primary" /> 
            <VoiceglotText strokeWidth={1.5} translationKey="about.badge" defaultText="Ons Verhaal" / />
          </ContainerInstrument>
          
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-none"><VoiceglotText strokeWidth={1.5} translationKey="about.title_part1" defaultText="Het Vriendelijkste " / /><TextInstrument as="span" className="text-primary font-extralight"><VoiceglotText strokeWidth={1.5} translationKey="about.title_part2" defaultText="Stemmenbureau" / /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid strokeWidth={1.5} columns={3}>
          {/* Founder Story Card */}
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between min-h-[400px]"
          >
            <ContainerInstrument className="space-y-8">
              <Quote strokeWidth={1.5} size={40} className="text-primary/20" />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight leading-none"><VoiceglotText strokeWidth={1.5} translationKey="about.founder.title" defaultText="Wij geloven in de kracht van een warm geluid." / /><TextInstrument className="text-va-black/60 font-light text-lg leading-relaxed"><VoiceglotText strokeWidth={1.5} 
                  translationKey="about.founder.text" 
                  defaultText="Voices is ontstaan vanuit een passie voor het ambacht. Johfrah Lefebvre, een bedreven Vlaamse voice-over met meer dan tien jaar ervaring en bekroond regisseur, bouwde het platform uit tot een internationaal agency waar menselijke klik en technische perfectie samenkomen. Geen kille technologie, maar stemmen die echt raken." 
                / /></TextInstrument></HeadingInstrument>
            </ContainerInstrument>
          </BentoCard>

          {/* Values Card */}
          <BentoCard 
            span="sm" 
            className="bg-va-black text-white p-12 flex flex-col justify-between rounded-[20px]"
          >
            <ContainerInstrument className="space-y-6">
              <HeadingInstrument level={3} className="text-[15px] font-light tracking-[0.2em] text-white/20 "><VoiceglotText strokeWidth={1.5} translationKey="about.values.label" defaultText="Onze Kernwaarden" / /></HeadingInstrument>
              <ContainerInstrument className="space-y-4">
                {[
                  { icon: Zap, text: "Snelheid", key: "about.value1" },
                  { icon: ShieldCheck, text: "Kwaliteit", key: "about.value2" },
                  { icon: Heart, text: "Vriendelijkheid", key: "about.value3" }
                ].map((v, i) => (
                  <ContainerInstrument key={i} className="flex items-center gap-3">
                    <v.icon size={16} strokeWidth={1.5} className="text-primary" />
                    <TextInstrument className="text-[15px] font-light tracking-widest "><VoiceglotText strokeWidth={1.5} translationKey={v.key} defaultText={v.text} / /></TextInstrument>
                  </ContainerInstrument>
                ))}
              </ContainerInstrument>
            </ContainerInstrument>
          </BentoCard>

          {/* Partner Card */}
          <BentoCard 
            span="full" 
            className="bg-white/50 backdrop-blur-xl border-black/5 shadow-aura p-12 flex flex-col md:flex-row items-center gap-12 rounded-[20px]"
          >
            <ContainerInstrument className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Users size={32} strokeWidth={1.5} className="text-primary" />
            </ContainerInstrument>
            <ContainerInstrument className="space-y-4">
              <HeadingInstrument level={2} className="text-3xl font-light tracking-tight"><VoiceglotText strokeWidth={1.5} translationKey="about.partners.title" defaultText="Jouw branding. Onze stemmen." / /><TextInstrument className="text-va-black/60 font-light text-lg"><VoiceglotText strokeWidth={1.5} 
                  translationKey="about.partners.text" 
                  defaultText="Wij zijn de trotse audio-partner van talloze IT-bedrijven en VoIP-resellers. Via onze whitelabel oplossingen bieden zij hun klanten de hoogste kwaliteit audio, direct geïntegreerd in hun eigen dienstverlening. Wij maken de partner de held: zij verkopen, wij leveren de perfecte stem." 
                / /></TextInstrument></HeadingInstrument>
            </ContainerInstrument>
          </BentoCard>

          {/* Mission Card */}
          <BentoCard 
            span="full" 
            className="bg-va-off-white p-12 flex flex-col md:flex-row items-center gap-12 rounded-[20px]"
          >
            <ContainerInstrument className="w-20 h-20 rounded-full bg-va-black/5 flex items-center justify-center shrink-0">
              <ShieldCheck size={32} strokeWidth={1.5} className="text-va-black/20" />
            </ContainerInstrument>
            <ContainerInstrument className="space-y-4">
              <HeadingInstrument level={2} className="text-3xl font-light tracking-tight"><VoiceglotText strokeWidth={1.5} translationKey="about.mission.title" defaultText="Een stem die echt is en vertrouwen geeft." / /><TextInstrument className="text-va-black/60 font-light text-lg"><VoiceglotText strokeWidth={1.5} 
                  translationKey="about.mission.text" 
                  defaultText="Bij Voices draait alles om de juiste klik. Onder leiding van Johfrah bewaken we de hoogste standaard in audiokwaliteit en stemselectie. Onze stemmen klinken als een goede buur: warm, naturel en uiterst betrouwbaar." 
                / /></TextInstrument></HeadingInstrument>
            </ContainerInstrument>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
