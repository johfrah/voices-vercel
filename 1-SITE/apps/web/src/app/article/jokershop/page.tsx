import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ContainerInstrument,
    HeadingInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { StudioVideoPlayer } from "@/components/ui/StudioVideoPlayer";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";

const SUBTITLE_DATA = [
  {
    "start": 0.0,
    "end": 3.76,
    "text": "Sinds een aantal maanden maken wij gebruik van de diensten van Voices.be."
  },
  {
    "start": 3.76,
    "end": 8.16,
    "text": "Wij zijn een feestwinkel en wij hebben een vrij uitgebreid keuzemenu"
  },
  {
    "start": 8.16,
    "end": 12.16,
    "text": "omdat we heel veel verschillende types vragen krijgen van onze klanten."
  },
  {
    "start": 12.16,
    "end": 15.6,
    "text": "Voorheen hadden we dat zelf ingesproken, maar we merkten dat dat toch niet"
  },
  {
    "start": 15.6,
    "end": 18.28,
    "text": "de professionele uitstraling gaf die we zochten."
  },
  {
    "start": 18.28,
    "end": 22.8,
    "text": "Sinds we zijn overgestapt naar een professionele stem van Voices.be,"
  },
  {
    "start": 22.8,
    "end": 26.6,
    "text": "krijgen we eigenlijk alleen maar positieve reacties van onze klanten."
  },
  {
    "start": 26.6,
    "end": 30.64,
    "text": "Ze vinden het menu heel duidelijk en het klinkt ook gewoon veel leuker."
  },
  {
    "start": 30.64,
    "end": 34.6,
    "text": "Het past ook veel beter bij ons imago als feestwinkel."
  },
  {
    "start": 34.6,
    "end": 37.8,
    "text": "De samenwerking verloopt ook heel vlot, we krijgen onze opnames"
  },
  {
    "start": 37.8,
    "end": 40.8,
    "text": "altijd heel snel binnen en de kwaliteit is top."
  },
  {
    "start": 40.8,
    "end": 44.4,
    "text": "Ik kan het iedereen aanraden die zijn telefonisch onthaal naar een"
  },
  {
    "start": 44.4,
    "end": 46.4,
    "text": "hoger niveau wil tillen."
  }
];

export default function JokershopStoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Jokershop Testimonial - Voices.be",
    "description": "Hoe audio bijdraagt aan de beleving bij Jokershop.",
    "thumbnailUrl": "/assets/img/testimonials/jokershop-thumb.jpg",
    "uploadDate": "2026-02-10",
    "contentUrl": "/assets/content/blog/videos/review-jokershopbe.mp4",
    "embedUrl": "https://voices.be/article/jokershop"
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
            <VoiceglotText translationKey="story.jokershop.title" defaultText="Jokershop | Fun & Kwaliteit" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between !rounded-[20px]"
          >
            <ContainerInstrument className="space-y-8">
              <ShoppingBag size={40} className="text-primary" strokeWidth={1.5} />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight leading-none text-va-black ">
                <VoiceglotText translationKey="story.jokershop.subtitle" defaultText="Een professionele uitstraling voor een feestwinkel." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.jokershop.text" 
                  defaultText="Waarom ook een feestwinkel kiest voor een professionele telefooncentrale. Ontdek hoe audio bijdraagt aan de fun-factor van Jokershop." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-6 flex flex-col justify-center overflow-hidden !rounded-[20px]">
            <StudioVideoPlayer 
              url="/assets/content/blog/videos/review-jokershopbe.mp4" 
              aspect="portrait"
              className="w-full h-full"
              subtitleData={SUBTITLE_DATA}
            />
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
