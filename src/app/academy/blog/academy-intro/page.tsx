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
import { GraduationCap, ArrowLeft, BookOpen, Zap, Users } from "lucide-react";
import Link from "next/link";

/**
 * ACADEMY ARTICLE: INTRO (PHYSICAL)
 */
export default function AcademyIntroPage() {
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
            <VoiceglotText translationKey="article.theme.academy" defaultText="Academy" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-black uppercase tracking-tighter leading-none mb-6">
            <VoiceglotText translationKey="academy.title" defaultText="Voices Academy | Jouw digitale groeipad" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard span="xl" className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12">
            <BookOpen size={32} className="text-primary mb-6" />
            <HeadingInstrument level={2} className="text-3xl font-black uppercase tracking-tight mb-6">
              <VoiceglotText translationKey="academy.intro.title" defaultText="Leer op je eigen tempo." />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/60 text-lg leading-relaxed">
              <VoiceglotText 
                translationKey="academy.intro.text" 
                defaultText="De Voices Academy is onze online leeromgeving. Hier vind je alles wat je nodig hebt om je als stemacteur te ontwikkelen, van de absolute basis tot geavanceerde technieken." 
              />
            </TextInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-12">
            <Zap size={24} className="text-primary mb-6" />
            <HeadingInstrument level={3} className="text-xl font-black uppercase tracking-tight mb-4">
              <VoiceglotText translationKey="academy.features.title" defaultText="Wat leer je?" />
            </HeadingInstrument>
            <ul className="space-y-4 text-white/60 text-sm font-medium">
              <li>• Stemtechniek & Ademhaling</li>
              <li>• Audio-editing & Mastering</li>
              <li>• Business skills voor stemmen</li>
            </ul>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
