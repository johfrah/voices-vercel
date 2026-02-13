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
import { Quote, ArrowLeft, Lightbulb, Zap, Clock } from "lucide-react";
import Link from "next/link";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SLV Belgium: Rust door professionalisering | Voices.be Stories',
  description: 'Hoe een marktleider in verlichting koos voor een uniform visitekaartje aan de telefoon met Voices.be.',
  openGraph: {
    title: 'SLV Belgium | Voices.be Stories',
    description: 'Klantverhaal over de kracht van een professionele stem bij SLV Belgium.',
    images: ['/assets/content/blog/videos/review-slv.mp4'],
  }
};

/**
 * ARTICLE: SLV-BELGIUM (PHYSICAL FALLBACK)
 * Theme: Stories
 */
export default function SlvBelgiumArticlePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "SLV Belgium Testimonial - Voices.be",
    "description": "Jan Joostens vertelt waarom SLV Belgium koos voor Voices.be.",
    "thumbnailUrl": "/assets/img/testimonials/slv-thumb.jpg",
    "uploadDate": "2026-02-10",
    "contentUrl": "/assets/content/blog/videos/review-slv.mp4",
    "embedUrl": "https://voices.be/article/slv-belgium"
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
            className="inline-flex items-center gap-2 text-[15px] font-light tracking-[0.2em] text-va-black/40 hover:text-primary transition-all mb-8 uppercase"
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> 
            <VoiceglotText translationKey="article.back" defaultText="Terug naar de etalage" />
          </Link>
          <TextInstrument className="text-[15px] font-light tracking-[0.2em] text-primary mb-4 uppercase">
            <VoiceglotText translationKey="article.theme.stories" defaultText="Stories" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none mb-6 text-va-black uppercase">
            <VoiceglotText translationKey="story.slv.title" defaultText="SLV Belgium | Rust door professionalisering" />
          </HeadingInstrument>
        </ContainerInstrument>

        <BentoGrid columns={3}>
          <BentoCard 
            span="xl" 
            className="bg-white/80 backdrop-blur-xl border-white/20 shadow-aura p-12 flex flex-col justify-between !rounded-[20px]"
          >
            <ContainerInstrument className="space-y-8">
              <Lightbulb size={40} className="text-primary" strokeWidth={1.5} />
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight leading-none text-va-black uppercase">
                <VoiceglotText translationKey="story.slv.subtitle" defaultText="Een uniform visitekaartje voor een marktleider." />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/60 font-light text-lg leading-relaxed">
                <VoiceglotText 
                  translationKey="story.slv.text" 
                  defaultText="SLV Belgium koos voor een consistente audio-branding over al hun afdelingen heen. Dit zorgde niet alleen voor meer rust bij de klant, maar ook voor een professionelere uitstraling die matcht met hun hoogwaardige verlichtingsoplossingen." 
                />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-va-black text-white p-6 flex flex-col justify-center overflow-hidden !rounded-[20px]">
            <VideoPlayer 
              src="/assets/content/blog/videos/review-slv.mp4" 
              aspectRatio="portrait"
              className="w-full h-full"
              subtitles={[
                { src: '/assets/content/blog/videos/review-slv-nl.vtt', label: 'Nederlands', srcLang: 'nl' },
                { src: '/assets/content/blog/videos/review-slv-fr.vtt', label: 'Français', srcLang: 'fr' },
                { src: '/assets/content/blog/videos/review-slv-en.vtt', label: 'English', srcLang: 'en' }
              ]}
            />
          </BentoCard>

          <BentoCard span="full" className="bg-white/40 backdrop-blur-sm p-12 !rounded-[20px] border border-white/20">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-primary">
                  <Clock size={24} strokeWidth={1.5} />
                  <HeadingInstrument level={3} className="text-xl font-light tracking-widest uppercase">
                    <VoiceglotText translationKey="story.slv.challenge_label" defaultText="De Uitdaging" />
                  </HeadingInstrument>
                </div>
                <TextInstrument className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="story.slv.challenge_text" 
                    defaultText="Voorheen spraken medewerkers zelf de berichten in, vaak onder tijdsdruk en met storend achtergrondgeluid (zoals kletterende regen). Dit matchte simpelweg niet met het gewenste B2B-imago van SLV." 
                  />
                </TextInstrument>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-primary">
                  <Zap size={24} strokeWidth={1.5} />
                  <HeadingInstrument level={3} className="text-xl font-light tracking-widest uppercase">
                    <VoiceglotText translationKey="story.slv.result_label" defaultText="Het Resultaat" />
                  </HeadingInstrument>
                </div>
                <TextInstrument className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="story.slv.result_text" 
                    defaultText="Klanten worden nu positief verrast door warme radiostemmen en professionele muziek. Het proces is efficiënt, de uitstraling is top-notch, en SLV kan razendsnel schakelen bij wijzigingen." 
                  />
                </TextInstrument>
              </div>
            </div>
          </BentoCard>

          <BentoCard span="full" className="bg-va-black text-white p-12 !rounded-[20px] flex flex-col md:flex-row items-center gap-8">
            <Quote size={48} className="text-primary/40 shrink-0" strokeWidth={1.5} />
            <div className="space-y-4">
              <TextInstrument className="text-2xl font-light italic leading-tight">
                <VoiceglotText 
                  translationKey="story.slv.quote" 
                  defaultText="Zonder Voices.be was onze business een stuk minder professioneel. Het boost zonder twijfel je bedrijfsimago en bespaart ons heel wat tijd." 
                />
              </TextInstrument>
              <TextInstrument className="text-[12px] font-light tracking-[0.2em] text-white/40 uppercase">
                — Jan Joostens, SLV Belgium
              </TextInstrument>
            </div>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
