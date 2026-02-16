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
import { Ticket, ArrowLeft, ShieldCheck, Layout } from "lucide-react";
import Link from "next/link";
import { StudioVideoPlayer } from "@/components/ui/StudioVideoPlayer";

const SUBTITLE_DATA = [
  {
    "start": 0.0,
    "end": 3.48,
    "text": "Zonder voices was onze telefooncentrale een rommeltje."
  },
  {
    "start": 3.6,
    "end": 4.88,
    "text": "Dat willen we opgelost hebben."
  },
  {
    "start": 5.0,
    "end": 10.0,
    "text": "De afgelopen jaren hebben diverse collega's diverse bandjes ingesproken, zoals wij dat noemden."
  },
  {
    "start": 10.12,
    "end": 13.92,
    "text": "Dus dat begon met een welkom bij TicketTeam, wat ooit door mijn vriendinnetje is ingesproken."
  },
  {
    "start": 14.04,
    "end": 17.52,
    "text": "Daarna kwam de volgende collega, die toch iets meer wilde vertellen."
  },
  {
    "start": 17.64,
    "end": 20.12,
    "text": "Natuurlijk met een iets ander stemgeluid en ander volume."
  },
  {
    "start": 20.24,
    "end": 23.52,
    "text": "Dus daardoor moest ik mijn microfoon altijd harder zetten als ik zelf naar het kantoor belde."
  },
  {
    "start": 23.64,
    "end": 25.48,
    "text": "Vervolgens kwam er een keertje een landelijke storing."
  },
  {
    "start": 25.6,
    "end": 27.56,
    "text": "Daar wilden we ook graag een apart bandje voor hebben."
  },
  {
    "start": 27.56,
    "end": 32.88,
    "text": "Om dat rommeltje op de telefooncentrale op te lossen, wilden wij gewoon een eenduidig stemgeluid hebben."
  },
  {
    "start": 33.0,
    "end": 38.2,
    "text": "Wat rust, wat professionaliteit en alles uitstralen wat wij als organisatie ook graag uit willen stralen."
  },
  {
    "start": 38.32,
    "end": 42.32,
    "text": "Kies absoluut voor voices.nl. Ze hebben een mooie scala aan stemmen."
  },
  {
    "start": 42.44,
    "end": 45.4,
    "text": "Voor iedereen wat wils in verschillende dialecten."
  },
  {
    "start": 45.52,
    "end": 48.24,
    "text": "Erg fijn voor de Nederlandse markt duidelijke Nederlanders."
  },
  {
    "start": 48.36,
    "end": 50.88,
    "text": "Voor de Vlamen duidelijke Vlaamse."
  },
  {
    "start": 51.0,
    "end": 53.36,
    "text": "Ze schakelen snel en zijn scherp geprijsd."
  },
  {
    "start": 53.48,
    "end": 56.16,
    "text": "Ook niet heel onbelangrijk voor onze Hollanders."
  },
  {
    "start": 57.56,
    "end": 59.76,
    "text": "TV Gelderland 2021"
  }
];

export default function TicketTeamStoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Ticket Team Testimonial - Voices.be",
    "description": "Professionalisering van het telefonisch onthaal bij Ticket Team.",
    "thumbnailUrl": "/assets/img/testimonials/ticketteam-thumb.jpg",
    "uploadDate": "2026-02-10",
    "contentUrl": "/assets/content/blog/videos/ticketteam.mp4",
    "embedUrl": "https://voices.be/article/ticketteam"
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
            <VoiceglotText translationKey="story.ticketteam.title" defaultText="Ticket Team | Strak onthaal" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between !rounded-[20px]"
          >
            <ContainerInstrument className="space-y-8">
              <Ticket size={40} className="text-primary" strokeWidth={1.5} />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight leading-none text-va-black ">
                <VoiceglotText translationKey="story.ticketteam.subtitle" defaultText="Van een rommeltje naar een visitekaartje." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.ticketteam.text" 
                  defaultText="Ticket Team wilde af van het 'rommeltje' aan verschillende stemmen en volumes. Door te kiezen voor één uniforme, professionele stem van Voices.be, hebben ze nu een visitekaartje dat rust en vertrouwen uitstraalt." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-6 flex flex-col justify-center overflow-hidden !rounded-[20px]">
            <StudioVideoPlayer 
              url="/assets/content/blog/videos/ticketteam.mp4" 
              aspect="portrait"
              className="w-full h-full"
              subtitleData={SUBTITLE_DATA}
            />
          </BentoCard>

          <BentoCard span="full" className="bg-white/40 backdrop-blur-sm p-12 !rounded-[20px] border border-white/20">
            <ContainerInstrument className="grid md:grid-cols-2 gap-12">
              <ContainerInstrument className="space-y-6">
                <ContainerInstrument className="flex items-center gap-4 text-primary">
                  <Layout size={24} strokeWidth={1.5} />
                  <HeadingInstrument level={3} className="text-xl font-light tracking-widest ">
                    <VoiceglotText translationKey="story.ticketteam.uniformity_label" defaultText="Uniformiteit" />
                  </HeadingInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="story.ticketteam.uniformity_text" 
                    defaultText="Voorheen moesten klanten schakelen in belvolume door de verschillende zelf-opgenomen stemmen. Nu is er één eenduidige aanpak die zorgt voor een professionele en rustige klantbeleving." 
                  />
                </TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="space-y-6">
                <ContainerInstrument className="flex items-center gap-4 text-primary">
                  <ShieldCheck size={24} strokeWidth={1.5} />
                  <HeadingInstrument level={3} className="text-xl font-light tracking-widest ">
                    <VoiceglotText translationKey="story.ticketteam.human_label" defaultText="Menselijk & Persoonlijk" />
                  </HeadingInstrument>
                </ContainerInstrument>
                <TextInstrument className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="story.ticketteam.human_text" 
                    defaultText="Ondanks de automatisatie komt het onthaal heel menselijk over. Ticket Team behandelt elke klant gelijk en helpt ze sneller verder, zonder in te boeten op de persoonlijke touch." 
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
