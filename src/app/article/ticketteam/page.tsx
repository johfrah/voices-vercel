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
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ticket Team: Professionalisering van het rommeltje | Voices.be Stories',
  description: 'Van chaos naar een gestroomlijnd onthaal. Ontdek hoe Ticket Team hun audio-branding aanpakte met een uniforme, professionele stem.',
  openGraph: {
    title: 'Ticket Team | Voices.be Stories',
    description: 'Hoe Ticket Team hun telefonische bereikbaarheid professionaliseerde.',
    images: ['/assets/content/blog/videos/ticketteam.mp4'],
  }
};

/**
 * ARTICLE: TICKETTEAM (PHYSICAL FALLBACK)
 * Theme: Stories
 */
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
            className="inline-flex items-center gap-2 text-[15px] font-light tracking-[0.2em] text-va-black/40 hover:text-primary transition-all mb-8 uppercase"
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> 
            <VoiceglotText translationKey="article.back" defaultText="Terug naar de etalage" />
          </Link>
          <TextInstrument className="text-[15px] font-light tracking-[0.2em] text-primary mb-4 uppercase">
            <VoiceglotText translationKey="article.theme.stories" defaultText="Stories" />
          </TextInstrument>
          <HeadingInstrument level={1} className="text-6xl font-light tracking-tighter leading-none mb-6 text-va-black uppercase">
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
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tight leading-none text-va-black uppercase">
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
            <VideoPlayer 
              src="/assets/content/blog/videos/ticketteam.mp4" 
              aspectRatio="portrait"
              className="w-full h-full"
              subtitles={[
                { src: '/assets/content/blog/videos/ticketteam-nl.vtt', label: 'Nederlands', srcLang: 'nl' },
                { src: '/assets/content/blog/videos/ticketteam-fr.vtt', label: 'Français', srcLang: 'fr' },
                { src: '/assets/content/blog/videos/ticketteam-en.vtt', label: 'English', srcLang: 'en' }
              ]}
            />
          </BentoCard>

          <BentoCard span="full" className="bg-white/40 backdrop-blur-sm p-12 !rounded-[20px] border border-white/20">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-primary">
                  <Layout size={24} strokeWidth={1.5} />
                  <HeadingInstrument level={3} className="text-xl font-light tracking-widest uppercase">
                    <VoiceglotText translationKey="story.ticketteam.uniformity_label" defaultText="Uniformiteit" />
                  </HeadingInstrument>
                </div>
                <TextInstrument className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="story.ticketteam.uniformity_text" 
                    defaultText="Voorheen moesten klanten schakelen in belvolume door de verschillende zelf-opgenomen stemmen. Nu is er één eenduidige aanpak die zorgt voor een professionele en rustige klantbeleving." 
                  />
                </TextInstrument>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-primary">
                  <ShieldCheck size={24} strokeWidth={1.5} />
                  <HeadingInstrument level={3} className="text-xl font-light tracking-widest uppercase">
                    <VoiceglotText translationKey="story.ticketteam.human_label" defaultText="Menselijk & Persoonlijk" />
                  </HeadingInstrument>
                </div>
                <TextInstrument className="text-va-black/60 font-light leading-relaxed">
                  <VoiceglotText 
                    translationKey="story.ticketteam.human_text" 
                    defaultText="Ondanks de automatisatie komt het onthaal heel menselijk over. Ticket Team behandelt elke klant gelijk en helpt ze sneller verder, zonder in te boeten op de persoonlijke touch." 
                  />
                </TextInstrument>
              </div>
            </div>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}
