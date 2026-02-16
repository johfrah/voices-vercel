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
import { ShoppingBag, ArrowLeft, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jokershop: Investering in een warm onthaal | Voices.be Stories',
  description: 'Roel van Jokershop vertelt hoe een professionele voicemail van Johfrah zorgt voor rust en een warm welkom voor zijn klanten.',
  openGraph: {
    title: 'Jokershop | Voices.be Stories',
    description: 'Het verhaal achter het onthaal van Jokershop.be.',
  }
};

/**
 * ARTICLE: JOKERSHOP INTERVIEW (PHYSICAL FALLBACK)
 * Theme: Stories
 */
export default function JokershopInterviewPage() {
  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <LiquidBackground />
      
      <SectionInstrument className="max-w-5xl mx-auto px-6 relative z-10">
        <ContainerInstrument className="mb-12">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-[15px] font-light tracking-[0.2em] text-va-black/40 hover:text-primary transition-all mb-8 "
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> 
            <VoiceglotText translationKey="article.back" defaultText="Terug naar de etalage" />
          </Link>
          <TextInstrument className="text-[15px] font-light tracking-[0.2em] text-primary mb-4 ">
            <VoiceglotText translationKey="article.theme.stories" defaultText="Stories" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none mb-6 text-va-black ">
            <VoiceglotText translationKey="story.jokershop_interview.title" defaultText="Jokershop | Investering in een warm onthaal" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="full" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between !rounded-[20px]"
          >
            <ContainerInstrument className="space-y-8">
              <ShoppingBag size={40} className="text-primary" strokeWidth={1.5} />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight leading-none text-va-black ">
                <VoiceglotText translationKey="story.jokershop_interview.subtitle" defaultText="Van een kleine start naar een professionele telefooncentrale." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.jokershop_interview.text" 
                  defaultText="Jokershop.be is uitgegroeid tot een grote speler in feestartikelen. Roel vertelt hoe de groei van de webshop zorgde voor een nood aan professionalisering van hun onthaal." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="xl" className="bg-white/40 backdrop-blur-sm p-12 !rounded-[20px] border border-white/20">
            <ContainerInstrument className="space-y-12">
              <ContainerInstrument className="space-y-6">
                <ContainerInstrument className="flex items-center gap-4 text-primary">
                  <Heart size={24} strokeWidth={1.5} />
                  <HeadingInstrument level={3} className="text-xl font-light tracking-widest ">
                    <VoiceglotText translationKey="story.jokershop_interview.warmth_label" defaultText="Een Correct & Warm Onthaal" />
                  </HeadingInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="story.jokershop_interview.warmth_text" 
                    defaultText="'Net als veel ondernemingen zijn we klein begonnen. Maar op een gegeven moment wil je je klanten correct verwelkomen. De stress van het niet altijd zelf kunnen opnemen was een trigger om te investeren in een gepaste voicemail.'" 
                  />
                </TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="space-y-6">
                <ContainerInstrument className="flex items-center gap-4 text-primary">
                  <MessageCircle size={24} strokeWidth={1.5} />
                  <HeadingInstrument level={3} className="text-xl font-light tracking-widest ">
                    <VoiceglotText translationKey="story.jokershop_interview.voice_label" defaultText="De Stem van Johfrah" />
                  </HeadingInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="story.jokershop_interview.voice_text" 
                    defaultText="Roel zocht een warme, professionele stem, vrij van dialect, zodat deze zowel in België als Nederland bruikbaar is. De stem van Johfrah bleek de perfecte match voor het imago van Jokershop." 
                  />
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-12 !rounded-[20px] flex flex-col justify-center">
             <TextInstrument className="text-2xl font-light italic leading-tight mb-6">
                <VoiceglotText 
                  translationKey="story.jokershop_interview.quote" 
                  defaultText="Geregeld word ik door collega-ondernemers aangesproken op mijn voicemail. Ik krijg er regelmatig complimenten over." 
                />
              </TextInstrument>
              <TextInstrument className="text-[15px] font-light tracking-[0.2em] text-white/40 ">
                — Roel, Jokershop.be
              </TextInstrument>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
