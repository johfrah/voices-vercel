import React from 'react';
import { BentoGrid, BentoCard } from "@/components/ui/BentoGrid";
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument,
  HeadingInstrument,
  TextInstrument,
  ButtonInstrument
} from "@/components/ui/LayoutInstruments";
import { Mic, Square, Save, RotateCcw, MessageSquare } from "lucide-react";
import { VoiceglotText } from "@/components/ui/VoiceglotText";

/**
 * ACADEMY RECORDER
 * 
 * Doel: Interactieve inspreekoefeningen met real-time feedback.
 * ToV: Praktische Mentor.
 */

export default function AcademyRecorderPage() {
  return (
    <PageWrapperInstrument className="max-w-7xl mx-auto px-6 py-20">
      <SectionInstrument className="mb-16 space-y-4">
        <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
          <VoiceglotText translationKey="academy.recorder.badge" defaultText="Academy | Les 4: Intonatie & Impact" />
        </ContainerInstrument>
        <HeadingInstrument level={1} className="text-5xl font-black uppercase tracking-tighter">
          <VoiceglotText translationKey="academy.recorder.title" defaultText="De Teleprompter" />
        </HeadingInstrument>
        <TextInstrument className="text-va-black/50 font-medium max-w-2xl">
          <VoiceglotText translationKey="academy.recorder.subtitle" defaultText="Spreek het onderstaande script in. Luister daarna terug en let op de natuurlijke curve in je stemgebruik. Je coach geeft je direct feedback na het opslaan." />
        </TextInstrument>
      </SectionInstrument>

      <BentoGrid>
        {/* Script Card */}
        <ContainerInstrument className="md:col-span-2">
          <BentoCard span="full" className="bg-va-black text-white p-12 shadow-aura min-h-[400px] flex flex-col justify-between">
            <ContainerInstrument className="space-y-8">
              <HeadingInstrument level={3} className="text-[10px] font-black uppercase tracking-widest text-white/20">
                <VoiceglotText translationKey="academy.recorder.script_label" defaultText="Uw Script" />
              </HeadingInstrument>
              <ContainerInstrument className="text-3xl font-bold leading-relaxed tracking-tight">
                &quot;<VoiceglotText translationKey="academy.recorder.script_content_part1" defaultText="Welkom bij " /><TextInstrument as="span" className="text-primary">Voices</TextInstrument>. <VoiceglotText translationKey="academy.recorder.script_content_part2" defaultText="Waar we samen zoeken naar de perfecte stem. Vandaag leer je hoe je jouw instrument beheerst." />&quot;
              </ContainerInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="flex items-center gap-4 pt-12 border-t border-white/5">
              <ContainerInstrument className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <TextInstrument as="span" className="text-[10px] font-black uppercase tracking-widest text-white/40">
                <VoiceglotText translationKey="academy.recorder.monitoring" defaultText="Monitoring Actief" />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>
        </ContainerInstrument>

        {/* Controls Card */}
        <ContainerInstrument className="space-y-8">
          <BentoCard span="sm" className="bg-white p-8 shadow-aura border-black/5 flex flex-col items-center justify-center text-center">
            <ContainerInstrument className="w-24 h-24 rounded-full bg-va-off-white flex items-center justify-center mb-8 group hover:bg-primary transition-all cursor-pointer">
              <Mic size={40} className="text-va-black group-hover:text-white transition-all" />
            </ContainerInstrument>
            <HeadingInstrument level={4} className="text-xl font-black uppercase tracking-tight mb-2">
              <VoiceglotText translationKey="academy.recorder.start_opname" defaultText="Start Opname" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/40 text-xs font-medium mb-8">
              <VoiceglotText translationKey="academy.recorder.start_hint" defaultText="Klik om te beginnen met inspreken." />
            </TextInstrument>
            
            <ContainerInstrument className="flex gap-4 w-full">
              <ButtonInstrument className="flex-1 py-4 rounded-xl bg-va-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all">
                <VoiceglotText translationKey="common.stop" defaultText="Stop" />
              </ButtonInstrument>
              <ButtonInstrument className="flex-1 py-4 rounded-xl bg-va-off-white text-va-black text-[10px] font-black uppercase tracking-widest hover:bg-black/5 transition-all">
                <VoiceglotText translationKey="common.reset" defaultText="Reset" />
              </ButtonInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="hmagic text-white p-8 shadow-aura flex flex-col justify-between">
            <ContainerInstrument>
              <MessageSquare className="mb-6" size={32} />
              <HeadingInstrument level={3} className="text-xl font-black uppercase tracking-tight mb-2">
                <VoiceglotText translationKey="academy.recorder.mentor_title" defaultText="Mentor" />
              </HeadingInstrument>
              <TextInstrument className="text-white/80 text-xs font-medium leading-relaxed">
                &quot;<VoiceglotText translationKey="academy.recorder.mentor_feedback" defaultText="Focus op de pauze na 'Voices'. Dat geeft de luisteraar de tijd om de naam te laten landen." />&quot;
              </TextInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="pt-6 border-t border-white/10">
              <TextInstrument as="span" className="text-[10px] font-black uppercase tracking-widest text-white/40">
                <VoiceglotText translationKey="academy.recorder.mentor_footer" defaultText="- Jouw Coach" />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>
        </ContainerInstrument>
      </BentoGrid>
    </PageWrapperInstrument>
  );
}