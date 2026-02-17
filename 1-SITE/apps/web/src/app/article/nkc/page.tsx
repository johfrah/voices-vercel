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
import { Radio, ArrowLeft, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { StudioVideoPlayer } from "@/components/ui/StudioVideoPlayer";

const SUBTITLE_DATA = [
  {
    "start": 0.0,
    "end": 4.28,
    "text": "Ik zit al heel lang in het vak op dit moment en ik heb al heel veel stemmen gehoord, maar"
  },
  {
    "start": 4.28,
    "end": 9.56,
    "text": "jullie scala aan stemmen is zo uitgebreid dat jullie eigenlijk, vind ik, de toppers zijn"
  },
  {
    "start": 9.56,
    "end": 10.56,
    "text": "op dit gebied."
  },
  {
    "start": 10.56,
    "end": 16.08,
    "text": "We hebben ongeveer 30-40 duizend telefoontjes die binnenkomen per jaar en dan is het echt"
  },
  {
    "start": 16.08,
    "end": 21.84,
    "text": "heel belangrijk dat onze leden de juiste keuze kunnen maken zodat onze medewerkers ook de"
  },
  {
    "start": 21.84,
    "end": 26.52,
    "text": "juiste persoon ook zijn voor datgene waar die persoon voor belt."
  },
  {
    "start": 26.52,
    "end": 33.56,
    "text": "We hadden eerst iemand vanuit de organisatie, er was ruis op de gesprekken, de boodschappen"
  },
  {
    "start": 33.56,
    "end": 39.68,
    "text": "waren niet echt professioneel en mensen hadden er soms moeite mee om het goed te verstaan."
  },
  {
    "start": 39.68,
    "end": 43.24,
    "text": "We hebben te maken met een doelgroep die wat ouder is, dus daar moeten we rekening mee"
  },
  {
    "start": 43.24,
    "end": 44.24,
    "text": "houden."
  },
  {
    "start": 44.24,
    "end": 47.72,
    "text": "Vandaar dat we een bepaalde stem uit jullie assortiment hebben genomen."
  },
  {
    "start": 47.72,
    "end": 54.36,
    "text": "Wat ik nou wel mee wil geven is dat jullie zijn ook heel snel in het leveren van datgene"
  },
  {
    "start": 54.36,
    "end": 55.36,
    "text": "wat we nodig hebben."
  },
  {
    "start": 55.44,
    "end": 59.6,
    "text": "Je levert de tekst aan en binnen 1  2 dagen hebben we de tekst en dan kunnen we het meteen"
  },
  {
    "start": 59.6,
    "end": 60.6,
    "text": "implementeren."
  },
  {
    "start": 60.6,
    "end": 63.32,
    "text": "Dus dat is het voordeel dat het allemaal ook online gebeurt."
  }
];

export default function NkcStoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "NKC Testimonial - Voices.be",
    "description": "De rol van audio in de moderne klantendienst van NKC.",
    "thumbnailUrl": "/assets/img/testimonials/nkc-thumb.jpg",
    "uploadDate": "2026-02-10",
    "contentUrl": "/assets/content/blog/videos/nkc.mp4",
    "embedUrl": "https://voices.be/article/nkc"
  };

  return (
    <PageWrapperInstrument className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
            <VoiceglotText translationKey="story.nkc.title" defaultText="NKC | Evolutie in audio" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between !rounded-[20px]"
          >
            <ContainerInstrument className="space-y-8">
              <Radio size={40} className="text-primary" strokeWidth={1.5} />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight leading-none text-va-black ">
                <VoiceglotText translationKey="story.nkc.subtitle" defaultText="Technologie en warmte in de klantendienst." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.nkc.text" 
                  defaultText="Met 35.000 telefoontjes per jaar is een glashelder keuzemenu voor NKC onontbeerlijk. Door te kiezen voor een rustige, professionele stem die perfect matcht met hun doelgroep, is hun klantendienst naar een hoger niveau getild." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-6 flex flex-col justify-center overflow-hidden !rounded-[20px]">
            <StudioVideoPlayer 
              url="/assets/content/blog/videos/nkc.mp4" 
              aspect="portrait"
              className="w-full h-full"
              subtitleData={SUBTITLE_DATA}
            />
          </BentoCard>

          <BentoCard span="full" className="bg-white/40 backdrop-blur-sm p-12 !rounded-[20px] border border-white/20">
            <ContainerInstrument className="grid md:grid-cols-2 gap-12">
              <ContainerInstrument className="space-y-6">
                <ContainerInstrument className="flex items-center gap-4 text-primary">
                  <Users size={24} strokeWidth={1.5} />
                  <HeadingInstrument level={3} className="text-xl font-light tracking-widest ">
                    <VoiceglotText translationKey="story.nkc.audience_label" defaultText="De Doelgroep" />
                  </HeadingInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="story.nkc.audience_text" 
                    defaultText="Voor NKC was het cruciaal om een stem te vinden die past bij hun wat oudere doelgroep: rustig, duidelijk, maar toch enthousiast. Bij Voices.be vonden ze de perfecte match uit een enorme waaier aan stemmen." 
                  />
                </TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="space-y-6">
                <ContainerInstrument className="flex items-center gap-4 text-primary">
                  <TrendingUp size={24} strokeWidth={1.5} />
                  <HeadingInstrument level={3} className="text-xl font-light tracking-widest ">
                    <VoiceglotText translationKey="story.nkc.efficiency_label" defaultText="Efficintie" />
                  </HeadingInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="story.nkc.efficiency_text" 
                    defaultText="Sinds de inhaalbeweging qua professionalisering werkt NKC efficinter en wordt iedereen meteen correct doorverbonden. De leden reageren razend enthousiast op het nieuwe, professionele onthaal." 
                  />
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
