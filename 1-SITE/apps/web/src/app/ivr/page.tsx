import { BentoCard, BentoGrid } from '@/components/ui/BentoGrid';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument,
  HeadingInstrument,
  TextInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { ArrowRight, Mic, Music, Phone, Settings } from 'lucide-react';
import Link from 'next/link';

export default function IVRPage() {
  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white pb-24">
      <SectionInstrument className="max-w-7xl mx-auto px-6 pt-20">
        <ContainerInstrument className="mb-16 space-y-4">
          <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-black tracking-widest border border-primary/20">
            <Phone strokeWidth={1.5} size={12} fill="currentColor" /> 
            <VoiceglotText translationKey="ivr.badge" defaultText="Telefonie" />
          </ContainerInstrument>
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">
            <VoiceglotText translationKey="ivr.title_part1" defaultText="Stemmen voor " /> <br />
            <TextInstrument as="span" className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 font-light">
              <VoiceglotText translationKey="ivr.title_part2" defaultText="IVR Systemen." />
            </TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium max-w-2xl text-lg">
            <VoiceglotText translationKey="ivr.subtitle" defaultText="Configureer uw zakelijke telefonie met professionele stemmen en op maat gemaakte keuzemenu's." />
          </TextInstrument>
        </ContainerInstrument>

        <BentoGrid>
          <BentoCard span="lg" className="bg-va-black text-white p-12 flex flex-col justify-between group">
            <ContainerInstrument>
              <ContainerInstrument className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-primary/20">
                <Settings size={28} />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-3xl font-black tracking-tight mb-4">
                <VoiceglotText translationKey="ivr.configurator.title" defaultText="IVR Configurator" />
              </HeadingInstrument>
              <TextInstrument className="text-white/40 font-medium max-w-xs">
                <VoiceglotText translationKey="ivr.configurator.text" defaultText="Bouw uw eigen keuzemenu in enkele minuten met onze visuele editor." />
              </TextInstrument>
            </ContainerInstrument>
            <Link href="/johfrai" className="flex items-center gap-2 text-primary font-black tracking-widest text-[15px] mt-8 group-hover:gap-4 transition-all">
              <VoiceglotText translationKey="ivr.configurator.cta" defaultText="Start Configuratie" /> <ArrowRight strokeWidth={1.5} size={14} />
            </Link>
          </BentoCard>

          <BentoCard span="sm" className="bg-white shadow-aura p-12 flex flex-col justify-between group">
            <ContainerInstrument>
              <ContainerInstrument className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-8">
                <Mic size={28} />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-2xl font-black tracking-tight mb-2">
                <VoiceglotText translationKey="ivr.voices.title" defaultText="Stemmen" />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/40 text-[15px] font-medium leading-relaxed">
                <VoiceglotText translationKey="ivr.voices.text" defaultText="Kies uit honderden professionele stemacteurs." />
              </TextInstrument>
            </ContainerInstrument>
            <Link href="/agency" className="flex items-center gap-2 text-blue-500 font-black tracking-widest text-[15px] mt-8 group-hover:gap-4 transition-all">
              <VoiceglotText translationKey="ivr.voices.cta" defaultText="Bekijk Stemmen" /> <ArrowRight strokeWidth={1.5} size={14} />
            </Link>
          </BentoCard>

          <BentoCard span="sm" className="hred text-white p-12 flex flex-col justify-between group">
            <ContainerInstrument>
              <ContainerInstrument className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-8">
                <Music size={28} />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-2xl font-black tracking-tight mb-2">
                <VoiceglotText translationKey="ivr.music.title" defaultText="Wachtmuziek" />
              </HeadingInstrument>
              <TextInstrument className="text-white/60 text-[15px] font-medium leading-relaxed">
                <VoiceglotText translationKey="ivr.music.text" defaultText="Een uitgebreide bibliotheek met rechtenvrije muziek." />
              </TextInstrument>
            </ContainerInstrument>
            <Link href="/agency/music" className="flex items-center gap-2 text-white font-black tracking-widest text-[15px] mt-8 group-hover:gap-4 transition-all">
              <VoiceglotText translationKey="ivr.music.cta" defaultText="Beluister Muziek" /> <ArrowRight strokeWidth={1.5} size={14} />
            </Link>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}