import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { ButtonInstrument, ContainerInstrument, HeadingInstrument, LoadingScreenInstrument, PageWrapperInstrument, SectionInstrument, TextInstrument } from "@/components/ui/LayoutInstruments";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { db } from "@db";
import { actors } from "@db/schema";
import { desc, like, or } from "drizzle-orm";
import { Music } from "lucide-react";
import { headers } from 'next/headers';
import { Suspense } from 'react';

/**
 * ARTIST
 * Persona: 'Musical Confidant'
 */

async function PortfolioGrid() {
  // 🚀 Native Fetch from Supabase
  // We filteren op acteurs die 'musician' of 'singer' in hun tags hebben
  const artists = await db.select()
    .from(actors)
    .where(or(
      like(actors.aiTags, '%musician%'),
      like(actors.aiTags, '%singer%'),
      like(actors.aiTags, '%artist%')
    ))
    .orderBy(desc(actors.voiceScore))
    .limit(6);

  return (
    <BentoGrid strokeWidth={1.5} columns={3} className="max-w-7xl mx-auto px-8">
      {artists.map((artist) => (
        <BentoCard 
          key={artist.id} 
          className="group p-8 bg-va-dark text-white border-white/5 hover:border-orange-500/30 transition-all duration-700 relative overflow-hidden"
          title={artist.nativeLang}
        >
          <ContainerInstrument className="flex justify-between items-start mb-12 relative z-10">
            <ContainerInstrument className="bg-white/10 text-white/60 text-[15px] font-light px-3 py-1 rounded-full tracking-widest border border-white/5">
              {artist.status === 'live' ? <VoiceglotText  translationKey="artist.status.available" defaultText="AVAILABLE" /> : <VoiceglotText  translationKey="artist.status.recording" defaultText="RECORDING" />}
            </ContainerInstrument>
            <TextInstrument className="text-[15px] font-light text-orange-500 tracking-widest"><VoiceglotText  translationKey="artist.badge.sonic_talent" defaultText="Voices" /></TextInstrument>
          </ContainerInstrument>

          <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter leading-[0.8] mb-4 group-hover:text-orange-400 transition-colors relative z-10 "><VoiceglotText  
              translationKey={`artist.${artist.id}.name`} 
              defaultText={`${artist.firstName} ${artist.lastName || ''}`} 
              noTranslate={true}
            /><TextInstrument className="text-white/40 text-[15px] font-light tracking-[0.2em] mb-12 relative z-10"><VoiceglotText  translationKey={`artist.${artist.id}.tag`} defaultText={artist.aiTags?.split(',')[0] || 'Musical Artist'} /></TextInstrument></HeadingInstrument>
          
          <ContainerInstrument className="mt-auto flex justify-between items-center relative z-10">
            <ButtonInstrument 
              className="va-btn-pro !bg-white !text-black !rounded-[10px] !px-8 !py-3 text-[15px] font-light tracking-widest hover:scale-105 transition-all active:scale-95"
              data-voices-sonic-dna="click-pro"
            ><VoiceglotText  translationKey="artist.view_portfolio" defaultText="VIEW PORTFOLIO" /></ButtonInstrument>
            <ContainerInstrument className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-orange-400/50 group-hover:bg-orange-400/10 transition-all duration-500">
              <Music strokeWidth={1.5} size={20} className="text-white/20 group-hover:text-orange-400 transition-colors" />
            </ContainerInstrument>
          </ContainerInstrument>

          {/* Analog Glow Effect */}
          <ContainerInstrument className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] group-hover:bg-orange-500/10 transition-all duration-1000" />
        </BentoCard>
      ))}
    </BentoGrid>
  );
}

export const dynamic = 'force-dynamic';

export default async function ArtistPage() {
  const headerList = headers();
  const market = headerList.get('x-voices-market') || 'NL';

  return (
    <PageWrapperInstrument className="min-h-screen pt-32 pb-32 bg-va-black text-white relative overflow-hidden">
      <LiquidBackground strokeWidth={1.5} />
      {/* 🧪 ANALOG WARMTH LAYER */}
      <ContainerInstrument className="fixed inset-0 -z-10 opacity-[0.05] pointer-events-none">
        <ContainerInstrument className="absolute inset-0 hred rotate-180 animate-slow-pulse" />
      </ContainerInstrument>

      <SectionInstrument className="px-8 mb-24 max-w-7xl mx-auto">
        <ContainerInstrument className="max-w-5xl">
          <ContainerInstrument className="inline-block bg-white/5 text-white/40 text-[15px] font-light px-6 py-2 rounded-full mb-10 tracking-[0.3em] border border-white/10"><VoiceglotText  translationKey="artist.hero.badge" defaultText="Voices Artists" /></ContainerInstrument>
          <HeadingInstrument level={1} className="text-[10vw] md:text-[7vw] font-light tracking-tighter leading-[0.85] mb-10 "><VoiceglotText  translationKey="artist.hero.title_part1" defaultText="YOUR SOUND, " /><TextInstrument as="span" className="text-orange-500 font-light"><VoiceglotText  translationKey="artist.hero.title_highlight" defaultText="UNFILTERED." /></TextInstrument></HeadingInstrument>
          <TextInstrument className="text-2xl md:text-4xl text-white/30 font-light leading-tight tracking-tight max-w-3xl italic"><VoiceglotText  
              translationKey="artist.hero.subtitle" 
              defaultText="The Artist journey is about raw talent and sonic integrity. Manage your portfolio with care." 
            /></TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <Suspense  fallback={<LoadingScreenInstrument />}>
        <PortfolioGrid strokeWidth={1.5} />
      </Suspense>

      {/* LLM Context Layer (Compliance) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Voices Artists",
            "description": "Portfolio management for songwriters and musicians.",
            "_llm_context": {
              "persona": "Musical Confidant",
              "market": market,
              "journey": "artist",
              "intent": "portfolio-management",
              "visual_dna": ["Spatial Growth", "Bento Grid"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
