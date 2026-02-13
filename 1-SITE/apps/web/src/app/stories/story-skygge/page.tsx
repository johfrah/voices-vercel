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
import { Quote, ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * STORY: SKYGGE (PHYSICAL PAGE)
 * 
 * "Hoe professionaliteit het verschil maakt."
 */
export default function SkyggeStoryPage() {
  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <LiquidBackground strokeWidth={1.5} />
      
      <SectionInstrument className="max-w-5xl mx-auto px-6 relative z-10">
        <ContainerInstrument className="mb-16">
          <TextInstrument className="text-[15px] font-black tracking-[0.2em] text-primary mb-4"><VoiceglotText  translationKey="story.category" defaultText="Klantverhaal" /></TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none mb-6"><VoiceglotText  translationKey="story.skygge.title" defaultText="SKYGGE | Professionalisering via audio" /><TextInstrument className="text-xl text-va-black/40 font-medium max-w-2xl"><VoiceglotText  
              translationKey="story.skygge.intro" 
              defaultText="Hoe mede-zaakvoerder An Casters met een professionele telefooncentrale zorgt voor een onvergetelijke eerste indruk." 
            /></TextInstrument></HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid strokeWidth={1.5} columns={2}>
          <BentoCard 
            span="full" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-16"
          >
            <Quote strokeWidth={1.5} size={48} className="text-primary/20 mb-8" />
            <HeadingInstrument level={2} className="text-4xl font-light italic leading-tight mb-8">
              <VoiceglotText  
                translationKey="story.skygge.quote1" 
                defaultText="Dat was een no-brainer. Je kunt privé van zakelijk scheiden en je 100% focussen op de klant. Geen telefoontjes meer om tien uur 's avonds." 
              />
              <TextInstrument className="text-va-black/40 font-light tracking-widest text-[15px]">
                <VoiceglotText  translationKey="auto.page.__an_casters__mede_z.974595" defaultText="— An Casters, Mede-zaakvoerder SKYGGE" />
              </TextInstrument>
            </HeadingInstrument>
          </BentoCard>

          <BentoCard 
            span="md" 
            className="bg-va-black text-white p-12"
          >
            <HeadingInstrument level={3} className="text-2xl font-light tracking-tight mb-6"><VoiceglotText  translationKey="story.skygge.challenge.title" defaultText="De Uitdaging" /><TextInstrument className="text-white/60 leading-relaxed font-light"><VoiceglotText  
                translationKey="story.skygge.challenge.text" 
                defaultText="Als groeiend bedrijf wil je bereikbaar zijn, maar ook je grenzen bewaken. Een professionele uitstraling aan de telefoon is daarbij essentieel." 
              /></TextInstrument></HeadingInstrument>
          </BentoCard>

          <BentoCard 
            span="md" 
            className="bg-va-off-white p-12"
          >
            <HeadingInstrument level={3} className="text-2xl font-light tracking-tight mb-6"><VoiceglotText  translationKey="story.skygge.solution.title" defaultText="De Oplossing" /><TextInstrument className="text-va-black/60 leading-relaxed font-light"><VoiceglotText  
                translationKey="story.skygge.solution.text" 
                defaultText="Door te kiezen voor een professionele stem van Voices.be, klinkt SKYGGE nu vanaf de eerste seconde betrouwbaar en deskundig." 
              /></TextInstrument></HeadingInstrument>
          </BentoCard>

          <BentoCard 
            span="full" 
            className="bg-primary text-white p-12 flex items-center justify-between"
          >
            <ContainerInstrument>
              <HeadingInstrument level={3} className="text-3xl font-light tracking-tight mb-2"><VoiceglotText  translationKey="story.skygge.cta.title" defaultText="Ook zo'n eerste indruk maken?" /><TextInstrument className="opacity-80 font-light"><VoiceglotText  translationKey="story.skygge.cta.text" defaultText="Ontdek hoe wij jouw bedrijf kunnen laten klinken." /></TextInstrument></HeadingInstrument>
            </ContainerInstrument>
            <Link  href="/agency" className="va-btn-pro !bg-white !text-va-black"><VoiceglotText  translationKey="story.skygge.cta.button" defaultText="Bekijk de Stemmen" /></Link>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
