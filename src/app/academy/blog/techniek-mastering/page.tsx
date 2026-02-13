import React from 'react';
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
import { Zap, ShieldCheck, ArrowLeft, Headphones } from "lucide-react";
import Link from "next/link";

/**
 * ACADEMY ARTICLE: MASTERING (PHYSICAL)
 */
export default function AcademyMasteringPage() {
  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <LiquidBackground />
      
      <SectionInstrument className="max-w-6xl mx-auto px-6 relative z-10">
        <ContainerInstrument className="mb-12">
          <Link 
            href="/academy/blog" 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-va-black/40 hover:text-primary transition-all mb-8"
          >
            <ArrowLeft size={14} /> 
            <VoiceglotText translationKey="academy.back" defaultText="Terug naar de kennisbank" />
          </Link>
          <TextInstrument className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">
            <VoiceglotText translationKey="article.theme.technique" defaultText="Techniek" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-black uppercase tracking-tighter leading-none mb-6">
            <VoiceglotText translationKey="mastering.title" defaultText="De Geheimen van Mastering" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="full" 
            className="hmagic text-white p-16 flex flex-col md:flex-row items-center gap-12"
          >
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Headphones size={48} className="text-white" />
            </div>
            <ContainerInstrument className="space-y-6">
              <HeadingInstrument level={2} className="text-4xl font-black uppercase tracking-tight">
                <VoiceglotText translationKey="mastering.intro.title" defaultText="Waarom de ene stem straalt en de andere verzuipt." />
              </HeadingInstrument>
              <TextInstrument className="text-white/80 text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="mastering.intro.text" 
                  defaultText="In de Academy leren we je dat een goede opname pas het begin is. Mastering is de kunst van het polijsten: het weghalen van ruis en het toevoegen van die broadcast-glans." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="md" className="bg-white shadow-aura p-12">
            <Zap size={32} className="text-primary mb-6" />
            <HeadingInstrument level={3} className="text-2xl font-black uppercase tracking-tight mb-4">
              <VoiceglotText translationKey="mastering.cleaning.title" defaultText="De Schoonmaak" />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/60 leading-relaxed">
              <VoiceglotText translationKey="mastering.cleaning.text" defaultText="Leer hoe je smakjes, ademhalingen en omgevingsgeluid verwijdert zonder de natuurlijkheid van de stem te verliezen." />
            </TextInstrument>
          </BentoCard>

          <BentoCard span="md" className="bg-va-black text-white p-12">
            <ShieldCheck size={32} className="text-primary mb-6" />
            <HeadingInstrument level={3} className="text-2xl font-black uppercase tracking-tight mb-4">
              <VoiceglotText translationKey="mastering.loudness.title" defaultText="Loudness Wetten" />
            </HeadingInstrument>
            <TextInstrument className="text-white/60 leading-relaxed">
              <VoiceglotText translationKey="mastering.loudness.text" defaultText="Wat is het verschil tussen mastering voor Spotify, TV of een telefooncentrale? We duiken in de LUFS en pieken." />
            </TextInstrument>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
