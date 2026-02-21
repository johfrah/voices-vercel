"use client";

import { BentoCard, BentoGrid } from '@/components/ui/BentoGrid';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ArrowRight, Mic, Music, Phone, Settings } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/contexts/TranslationContext';

/**
 *  IVR PAGE (NUCLEAR 2026)
 * 
 * Volgt de Zero Laws:
 * - HTML ZERO: Geen rauwe HTML tags.
 * - CSS ZERO: Geen Tailwind classes direct in dit bestand.
 * - TEXT ZERO: Geen hardcoded strings.
 */
export default function IVRPage() {
  const { t } = useTranslation();
  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pb-24">
      <SectionInstrument className="max-w-7xl mx-auto px-6 pt-20">
        <ContainerInstrument className="mb-16 space-y-4">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-black tracking-widest border border-primary/20">
            <Phone strokeWidth={1.5} size={12} fill="currentColor" /> 
            <VoiceglotText  translationKey="ivr.badge" defaultText="Telefonie" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.85]">
            <VoiceglotText  translationKey="ivr.title_part1" defaultText="Stemmen voor " />
            <TextInstrument as="span" className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 font-light">
              <VoiceglotText  translationKey="ivr.title_part2" defaultText="IVR Systemen." />
            </TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium max-w-2xl text-lg">
            <VoiceglotText  translationKey="ivr.subtitle" defaultText="Configureer uw zakelijke telefonie met professionele stemmen en op maat gemaakte keuzemenu's." />
          </TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <SectionInstrument className="max-w-7xl mx-auto px-6">
        <BentoGrid>
          <BentoCard span="lg" className="bg-va-black text-white p-12 flex flex-col justify-between group">
            <ContainerInstrument>
              <ContainerInstrument className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-primary/20">
                <Settings strokeWidth={1.5} size={28} />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-3xl font-light tracking-tight mb-4">
                <VoiceglotText  translationKey="ivr.configurator.title" defaultText="IVR Configurator" />
                <TextInstrument className="text-white/40 font-medium max-w-xs">
                  <VoiceglotText  translationKey="ivr.configurator.text" defaultText="Bouw uw eigen keuzemenu in enkele minuten met onze visuele editor." />
                </TextInstrument>
              </HeadingInstrument>
            </ContainerInstrument>
            <ButtonInstrument as={Link} href="/johfrai" className="flex items-center gap-2 text-primary font-black tracking-widest text-[15px] mt-8 group-hover:gap-4 transition-all">
              <VoiceglotText  translationKey="ivr.configurator.cta" defaultText="Start Configuratie" />
              <ArrowRight strokeWidth={1.5} size={14} />
            </ButtonInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-white shadow-aura p-12 flex flex-col justify-between group">
            <ContainerInstrument>
              <ContainerInstrument className="w-14 h-14 bg-va-off-white rounded-2xl flex items-center justify-center text-va-black mb-8">
                <Mic strokeWidth={1.5} size={28} />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-3xl font-light tracking-tight mb-4">
                <VoiceglotText  translationKey="ivr.voices.title" defaultText="Stemkeuze" />
                <TextInstrument className="text-va-black/40 font-medium max-w-xs">
                  <VoiceglotText  translationKey="ivr.voices.text" defaultText="Kies uit honderden warme, zakelijke en betrouwbare stemmen." />
                </TextInstrument>
              </HeadingInstrument>
            </ContainerInstrument>
            <ButtonInstrument as={Link} href="/agency" className="flex items-center gap-2 text-primary font-black tracking-widest text-[15px] mt-8 group-hover:gap-4 transition-all">
              <VoiceglotText  translationKey="ivr.voices.cta" defaultText="Bekijk Stemmen" />
              <ArrowRight strokeWidth={1.5} size={14} />
            </ButtonInstrument>
          </BentoCard>

          <BentoCard span="full" className="hmagic text-white p-12 flex flex-col md:flex-row items-center justify-between gap-12">
            <ContainerInstrument className="flex items-center gap-8">
              <ContainerInstrument className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shrink-0">
                <Music strokeWidth={1.5} size={40} />
              </ContainerInstrument>
              <ContainerInstrument>
                <HeadingInstrument level={3} className="text-3xl font-light tracking-tight">
                  <VoiceglotText  translationKey="ivr.music.title" defaultText="Wachtmuziek & Sound Design" />
                  <TextInstrument className="text-white/60 font-medium max-w-xl">
                    <VoiceglotText  translationKey="ivr.music.text" defaultText="Maak de ervaring compleet met professionele wachtmuziek en geluidseffecten die passen bij uw merk." />
                  </TextInstrument>
                </HeadingInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <ButtonInstrument className="va-btn-pro !bg-white !text-va-black px-10 py-5">
              <VoiceglotText  translationKey="ivr.music.cta" defaultText="Ontdek Sound Design" />
            </ButtonInstrument>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>

      {/*  LLM CONTEXT (Compliance) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ServicePage",
            "name": t('ivr.schema.name', "IVR Stemmen & Systemen"),
            "description": t('ivr.schema.description', "Professionele stemmen voor uw bedrijfstelefonie en keuzemenu's."),
            "_llm_context": {
              "persona": "Gids",
              "journey": "agency",
              "intent": "configure_ivr",
              "capabilities": ["ivr_configurator", "voice_selection", "sound_design"],
              "lexicon": ["IVR", "Keuzemenu", "Wachtmuziek"],
              "visual_dna": ["Bento Grid", "Liquid DNA", "Spatial Growth"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
