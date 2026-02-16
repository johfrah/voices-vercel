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
import { Play, Star, ArrowRight, Mic } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/**
 * BELEVING: DEMOS (PHYSICAL PAGE)
 * 
 * "Hoor het verschil. Onze top-stemmen in actie."
 */
export default function DemoBentoPage() {
  const topVoices = [
    {
      id: 'johfrah',
      name: 'Johfrah',
      description: 'De Vertrouwde Stem. Ideaal voor een warm welkom en zakelijke autoriteit.',
      photo: 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/media/actors/johfrah.jpg',
      score: 10
    },
    {
      id: 'mona',
      name: 'Mona',
      description: 'De Frisse Netstem. Herkenbaar, enthousiast en perfect voor een moderne uitstraling.',
      photo: 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/media/actors/mona.jpg',
      score: 80
    },
    {
      id: 'christina',
      name: 'Christina',
      description: 'De Menselijke Connectie. Brengt emotie en draagkracht in elk verhaal.',
      photo: 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/media/actors/christina.jpg',
      score: 5
    },
    {
      id: 'brecht',
      name: 'Brecht',
      description: 'De Stijlvolle Professional. Geeft je bedrijf direct extra klasse.',
      photo: 'https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/media/actors/brecht.jpg',
      score: 50
    }
  ];

  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <LiquidBackground />
      
      <SectionInstrument className="max-w-7xl mx-auto px-6 relative z-10">
        <ContainerInstrument className="mb-16">
          <TextInstrument className="text-[15px] font-black tracking-[0.2em] text-primary mb-4">
            <VoiceglotText translationKey="demo.category" defaultText="Beleving" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl md:text-8xl font-light tracking-tighter leading-none mb-6">
            <VoiceglotText translationKey="demo.title" defaultText="Hoor de Kwaliteit." />
          </HeadingInstrument>
          <TextInstrument className="text-xl text-va-black/40 font-medium max-w-2xl">
            <VoiceglotText 
              translationKey="demo.intro" 
              defaultText="Een stem is meer dan geluid alleen. Het is de eerste indruk van je bedrijf. Beluister onze top-stemmen en vind de match die bij je resultaat past." 
            />
          </TextInstrument>
        </ContainerInstrument>

        <BentoGrid columns={4}>
          {topVoices.map((voice, i) => (
            <BentoCard 
              key={voice.id}
              span="sm" 
              className="bg-white shadow-aura group overflow-hidden border border-black/5"
            >
              <ContainerInstrument className="aspect-[4/5] relative">
                <ContainerInstrument className="absolute inset-0 bg-va-off-white animate-pulse" />
                <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-va-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <ContainerInstrument className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500">
                  <ContainerInstrument className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                    <Play strokeWidth={1.5} size={18} fill="currentColor" className="ml-1" />
                  </ContainerInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="p-6">
                <ContainerInstrument className="flex justify-between items-start mb-2">
                  <HeadingInstrument level={3} className="font-light tracking-tight text-lg">
                    {voice.name}
                  </HeadingInstrument>
                  <ContainerInstrument className="flex items-center gap-1 text-[15px] font-bold text-primary">
                    <Star strokeWidth={1.5} size={10} fill="currentColor" /> {voice.score}
                  </ContainerInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-[15px] text-va-black/60 leading-relaxed mb-4 font-light">
                  {voice.description}
                </TextInstrument>
                <Link href={`/voice/${voice.id}`} className="flex items-center gap-2 text-[15px] font-black tracking-widest text-primary hover:gap-4 transition-all">
                  <VoiceglotText translationKey="common.view_profile" defaultText="Bekijk Profiel" /> <ArrowRight strokeWidth={1.5} size={12} />
                </Link>
              </ContainerInstrument>
            </BentoCard>
          ))}

          <BentoCard 
            span="lg" 
            className="hmagic text-white p-12 flex flex-col justify-between"
          >
            <ContainerInstrument>
              <Mic strokeWidth={1.5} size={40} className="mb-6 opacity-20" />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight mb-4">
                <VoiceglotText translationKey="demo.cta.title" defaultText="Niet gevonden wat je zocht?" />
              </HeadingInstrument>
              <TextInstrument className="text-white/80 text-lg leading-relaxed font-light">
                <VoiceglotText 
                  translationKey="demo.cta.text" 
                  defaultText="We hebben meer dan 500 professionele stemmen in onze database. Laat ons je helpen de perfecte match te vinden." 
                />
              </TextInstrument>
            </ContainerInstrument>
            <Link href="/agency" className="va-btn-pro !bg-white !text-va-black w-full text-center">
              <VoiceglotText translationKey="demo.cta.button" defaultText="Bekijk alle Stemmen" />
            </Link>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
