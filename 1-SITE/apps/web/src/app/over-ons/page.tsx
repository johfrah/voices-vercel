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
import { ShieldCheck, Users, Zap, Heart, Quote } from "lucide-react";

/**
 * OVER ONS (GOD MODE 2026)
 * 
 * "Het verhaal achter de stemmen."
 */
export default function AboutPage() {
  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <LiquidBackground />
      
      <SectionInstrument className="max-w-7xl mx-auto px-6 relative z-10">
        <ContainerInstrument className="text-center mb-20 space-y-6">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full text-[15px] font-black tracking-widest shadow-sm border border-black/5">
            <ShieldCheck strokeWidth={1.5} size={12} className="text-primary" /> 
            <VoiceglotText translationKey="about.badge" defaultText="Ons Verhaal" />
          </ContainerInstrument>
          
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            <VoiceglotText translationKey="about.title_part1" defaultText="Het Vriendelijkste " />
            <TextInstrument as="span" className="text-primary font-light">
              <VoiceglotText translationKey="about.title_part2" defaultText="Stemmenbureau" />
            </TextInstrument>
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          {/* Founder Story Card */}
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between min-h-[400px]"
          >
            <ContainerInstrument className="space-y-8">
              <Quote strokeWidth={1.5} size={40} className="text-primary/20" />
              <HeadingInstrument level={2} className="text-4xl font-black tracking-tight leading-none">
                <VoiceglotText translationKey="about.founder.title" defaultText="Wij geloven in de kracht van een warm geluid." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-medium text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="about.founder.text" 
                  defaultText="Voices is ontstaan tijdens de pandemie in 2020. Johfrah Lefebvre en Elke Gansbeke startten niet ondanks, maar juist vanwege de crisis. Met hard werken bouwden ze een zaak op vanuit de passie om stemmen te delen en mensen in beweging te krijgen." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          {/* Values Card */}
          <BentoCard 
            span="sm" 
            className="bg-va-black text-white p-12 flex flex-col justify-between"
          >
            <ContainerInstrument className="space-y-6">
              <HeadingInstrument level={3} className="text-[15px] font-black tracking-[0.2em] text-white/20">
                <VoiceglotText translationKey="about.values.label" defaultText="Onze Kernwaarden" />
              </HeadingInstrument>
              <ContainerInstrument className="space-y-4">
                {[
                  { icon: Zap, text: "Snelheid", key: "about.value1" },
                  { icon: ShieldCheck, text: "Kwaliteit", key: "about.value2" },
                  { icon: Heart, text: "Vriendelijkheid", key: "about.value3" }
                ].map((v, i) => (
                  <ContainerInstrument key={i} className="flex items-center gap-3">
                    <v.icon size={16} className="text-primary" />
                    <TextInstrument className="text-[15px] font-black tracking-widest">
                      <VoiceglotText translationKey={v.key} defaultText={v.text} />
                    </TextInstrument>
                  </ContainerInstrument>
                ))}
              </ContainerInstrument>
            </ContainerInstrument>
          </BentoCard>

          {/* Mission Card */}
          <BentoCard 
            span="full" 
            className="bg-va-off-white p-12 flex flex-col md:flex-row items-center gap-12"
          >
            <ContainerInstrument className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Users size={32} className="text-primary" />
            </ContainerInstrument>
            <ContainerInstrument className="space-y-4">
              <HeadingInstrument level={2} className="text-3xl font-black tracking-tight">
                <VoiceglotText translationKey="about.mission.title" defaultText="Een stem die echt is en vertrouwen geeft." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-medium">
                <VoiceglotText 
                  translationKey="about.mission.text" 
                  defaultText="Bij Voices draait alles om de juiste klik. Geen kille technologie, maar een persoonlijke aanpak en stemmen die klinken als een goede buur: warm, naturel en uiterst betrouwbaar." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
