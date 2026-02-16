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
import { Quote, ArrowLeft, Users, MessageSquare } from "lucide-react";
import Link from "next/link";
import { StudioVideoPlayer } from "@/components/ui/StudioVideoPlayer";

const SUBTITLE_DATA = [
  {
    "start": 0.0,
    "end": 4.64,
    "text": "Zonder voortjes hadden we nu allicht nog altijd 140 verschillende welkomstboodschappen."
  },
  {
    "start": 4.64,
    "end": 8.24,
    "text": "Altijd goed bedoeld door de collega's, maar wel altijd anders."
  },
  {
    "start": 8.24,
    "end": 13.0,
    "text": "Als je binnenkomt aan een telefooncentrale en het lijkt dat je tegen een robot spreekt,"
  },
  {
    "start": 13.0,
    "end": 14.0,
    "text": "dat is niet fijn."
  },
  {
    "start": 14.0,
    "end": 19.36,
    "text": "Veel van de mensen die aan ons bellen hebben een vraag of soms zelfs een probleem op de werkvloer."
  },
  {
    "start": 19.36,
    "end": 23.24,
    "text": "Het is dan ook belangrijk dat geen duizenden, maar tienduizenden en ondertussen al zelfs"
  },
  {
    "start": 23.24,
    "end": 28.44,
    "text": "in de honderdduizenden bellers per jaar, dat die op een aangename manier ontvangen worden."
  },
  {
    "start": 28.44,
    "end": 31.16,
    "text": "Het is de eerste stap soms om al een beetje rustiger te worden."
  },
  {
    "start": 31.16,
    "end": 35.76,
    "text": "En dus hebben wij ook geconstateerd dat het dan ook maar beter is om voor zo'n onthaal"
  },
  {
    "start": 35.76,
    "end": 40.84,
    "text": "van mensen toch maar betere, echt professionele stemmen te gebruiken die iedereen direct op"
  },
  {
    "start": 40.84,
    "end": 44.48,
    "text": "een correcte, duidelijke en vriendelijke manier kunnen ontvangen."
  },
  {
    "start": 44.48,
    "end": 49.04,
    "text": "Hierin hebben we een aantal stemmen beluisterd en we hebben bewust gekozen voor stemmen die"
  },
  {
    "start": 49.04,
    "end": 53.44,
    "text": "professioneel klonken, maar tegelijkertijd ook vriendelijk en onthalend."
  },
  {
    "start": 53.44,
    "end": 57.92,
    "text": "Dat zorgt ervoor dat mensen die naar ons bellen voor een probleem, bijvoorbeeld met de werkloosheid"
  },
  {
    "start": 57.92,
    "end": 62.4,
    "text": "of anderzijds met pakweg en ontslag, dat zij direct al een beetje kunnen downcoolen"
  },
  {
    "start": 62.4,
    "end": 64.72,
    "text": "in een toch niet zo aangename situatie."
  },
  {
    "start": 64.72,
    "end": 67.56,
    "text": "Acht ze zeker niet om te bestellen bij Voices.be."
  },
  {
    "start": 67.56,
    "end": 72.76,
    "text": "De service is heel goed, de service is heel correct, de stemmen zijn perfect."
  },
  {
    "start": 72.76,
    "end": 78.48,
    "text": "Als mensen dus naar jullie bellen en ze komen per definitie terecht op een of ander telefoonsysteem,"
  },
  {
    "start": 78.48,
    "end": 82.16,
    "text": "weten dat het goed is dat ze op een warme manier ontvangen worden, vooral eerst in contact"
  },
  {
    "start": 82.16,
    "end": 84.72,
    "text": "komen met jullie echte medewerkers."
  },
  {
    "start": 84.72,
    "end": 87.52,
    "text": "En zo hebben jullie zeker en vast tevreden klanten aan de lijn."
  }
];

export default function AclvbStoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "ACLVB Testimonial - Voices.be",
    "description": "Hoe ACLVB audio inzet voor een betere ledenservice.",
    "thumbnailUrl": "/assets/img/testimonials/aclvb-thumb.jpg",
    "uploadDate": "2026-02-10",
    "contentUrl": "/assets/content/blog/videos/review-aclvb.mp4",
    "embedUrl": "https://voices.be/article/aclvb"
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
            <VoiceglotText translationKey="story.aclvb.title" defaultText="ACLVB | De menselijke vakbond" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between !rounded-[20px]"
          >
            <ContainerInstrument className="space-y-8">
              <Users size={40} className="text-primary" strokeWidth={1.5} />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight leading-none text-va-black ">
                <VoiceglotText translationKey="story.aclvb.subtitle" defaultText="Bij ons ben je geen nummer." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.aclvb.text" 
                  defaultText="Voor een vakbond als ACLVB is bereikbaarheid essentieel. Door 140 verschillende, rommelige begroetingen te vervangen door één warme, professionele stem, voelen tienduizenden leden zich meteen gehoord en welkom." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-6 flex flex-col justify-center overflow-hidden !rounded-[20px]">
            <StudioVideoPlayer 
              url="/assets/content/blog/videos/review-aclvb.mp4" 
              aspect="portrait"
              className="w-full h-full"
              subtitleData={SUBTITLE_DATA}
            />
          </BentoCard>

          <BentoCard span="full" className="bg-primary/5 border-primary/10 p-12 !rounded-[20px]">
            <ContainerInstrument className="grid md:grid-cols-2 gap-12 items-center">
              <ContainerInstrument className="space-y-6">
                <MessageSquare size={32} className="text-primary" strokeWidth={1.5} />
                <HeadingInstrument level={3} className="text-3xl font-light tracking-tight text-va-black ">
                  <VoiceglotText translationKey="story.aclvb.challenge_title" defaultText="De uitdaging: 140 verschillende stemmen" />
                </HeadingInstrument>
                <TextInstrument className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="story.aclvb.challenge_text" 
                    defaultText="In het verleden had elk kantoor een eigen onthaal. Dat zorgde voor een gebrek aan uniformiteit en een onprofessionele indruk. Door te kiezen voor Voices.be werd de weg naar de juiste contactpersoon eindelijk helder en menselijk." 
                  />
                </TextInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="bg-white p-8 rounded-[20px] shadow-aura">
                <Quote strokeWidth={1.5} size={24} className="text-primary/20 mb-4" />
                <TextInstrument className="text-xl font-light italic text-va-black leading-tight">
                  <VoiceglotText 
                    translationKey="story.aclvb.quote" 
                    defaultText="De gebruiksvriendelijke en vlotte aanpak van Voices.be was zeer overtuigend. Onze leden worden nu beter geholpen in een warme omgeving." 
                  />
                </TextInstrument>
                <TextInstrument className="mt-6 text-[15px] font-light tracking-widest text-va-black/40 ">
                  — Tom Van Droogenbroeck, ACLVB
                </TextInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
