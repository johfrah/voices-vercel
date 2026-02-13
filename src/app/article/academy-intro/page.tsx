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
import { BookOpen, Zap, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * ARTICLE: ACADEMY-INTRO (PHYSICAL FALLBACK)
 * Theme: Academy
 */
export default function AcademyIntroArticlePage() {
  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <LiquidBackground />
      
      <SectionInstrument className="max-w-6xl mx-auto px-6 relative z-10">
        <ContainerInstrument className="mb-12">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-[15px] font-light tracking-[0.2em] text-va-black/40 hover:text-primary transition-all mb-8 uppercase"
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> 
            <VoiceglotText translationKey="article.back" defaultText="Terug naar de etalage" />
          </Link>
          <TextInstrument className="text-[15px] font-light tracking-[0.2em] text-primary mb-4 uppercase">
            <VoiceglotText translationKey="article.theme.academy" defaultText="Academy" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none mb-6 text-va-black uppercase">
            <VoiceglotText translationKey="academy.title" defaultText="Voices Academy | Jouw digitale groeipad" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 !rounded-[20px]"
          >
            <BookOpen size={32} className="text-primary mb-6" strokeWidth={1.5} />
            <HeadingInstrument level={2} className="text-3xl font-light tracking-tight mb-6 text-va-black uppercase">
              <VoiceglotText translationKey="academy.intro.title" defaultText="Leer op je eigen tempo." />
            </HeadingInstrument>
            <TextInstrument className="text-va-black/60 text-lg font-light leading-relaxed">
              <VoiceglotText 
                translationKey="academy.intro.text" 
                defaultText="De Voices Academy is onze online leeromgeving. Hier vind je alles wat je nodig hebt om je als stemacteur te ontwikkelen, van de absolute basis tot geavanceerde technieken." 
              />
            </TextInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-12 !rounded-[20px]">
            <Zap size={24} className="text-primary mb-6" strokeWidth={1.5} />
            <HeadingInstrument level={3} className="text-xl font-light tracking-tight mb-4 uppercase">
              <VoiceglotText translationKey="academy.features.title" defaultText="Wat leer je?" />
            </HeadingInstrument>
            <ul className="space-y-4 text-white/60 text-sm font-light">
              <li>• Stemtechniek & Ademhaling</li>
              <li>• Audio-editing & Mastering</li>
              <li>• Business skills voor stemmen</li>
            </ul>
          </BentoCard>

          <BentoCard span="full" className="bg-va-off-white p-12 flex flex-col md:flex-row items-center gap-12 !rounded-[20px] border border-black/[0.03]">
            <Users size={48} className="text-primary/20 shrink-0" strokeWidth={1.5} />
            <ContainerInstrument>
              <HeadingInstrument level={3} className="text-2xl font-light tracking-tight mb-2 text-va-black uppercase">
                <VoiceglotText translationKey="academy.audience.title" defaultText="Voor wie is dit?" />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light">
                <VoiceglotText translationKey="academy.audience.text" defaultText="Of je nu een startende stem bent of een professional die zijn skills wil bijschaven: de Academy biedt een groeipad voor elk niveau." />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
