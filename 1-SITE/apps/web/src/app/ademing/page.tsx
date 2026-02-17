import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import {
    ButtonInstrument,
    ContainerInstrument,
    HeadingInstrument,
    LoadingScreenInstrument,
    PageWrapperInstrument,
    SectionInstrument,
    TextInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotImage } from "@/components/ui/VoiceglotImage";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { db } from "@db";
import { ademingTracks } from "@db/schema";
import { eq } from "drizzle-orm";
import { Play } from "lucide-react";
import { headers } from 'next/headers';
import { Suspense } from 'react';

/**
 * ADEMING
 * Persona: 'Zachte Gids'
 */

async function TrackGrid() {
  //  Native Fetch from Supabase
  const tracks = await db.select().from(ademingTracks).where(eq(ademingTracks.isPublic, true)).limit(6);

  return (
    <BentoGrid strokeWidth={1.5} columns={3} className="max-w-7xl mx-auto px-8">
      {tracks.map((track) => (
        <BentoCard 
          key={track.id} 
          className="group p-10 bg-white/50 backdrop-blur-xl border-white/20 hover:shadow-magic transition-all duration-1000"
          title={track.vibe || 'Meditatie'}
        >
          <ContainerInstrument className="flex justify-between items-start mb-12">
            <ContainerInstrument className="bg-black/5 text-black/40 text-[15px] font-black px-3 py-1 rounded-full tracking-widest">
              {track.duration ? `${Math.floor(track.duration / 60)} min` : '10 min'}
            </ContainerInstrument>
          </ContainerInstrument>

          <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter leading-[0.8] mb-12 text-black/80"><VoiceglotText  
              translationKey={`ademing.track.${track.id}.title`} 
              defaultText={track.title} 
              noTranslate={true}
            /></HeadingInstrument>
          
          <ContainerInstrument className="mt-auto flex justify-center">
            <ButtonInstrument 
              className="w-16 h-16 rounded-full bg-va-black text-white flex items-center justify-center hover:scale-110 hover:bg-primary transition-all duration-500 shadow-lg active:scale-95"
              data-voices-sonic-dna="click-pro"
            >
              <Play strokeWidth={1.5} size={24} fill="currentColor" />
            </ButtonInstrument>
          </ContainerInstrument>
        </BentoCard>
      ))}
    </BentoGrid>
  );
}

export const dynamic = 'force-dynamic';

export default async function AdemingPage() {
  const headerList = headers();
  const market = headerList.get('x-voices-market') || 'NL';

  return (
    <PageWrapperInstrument className="min-h-screen pt-32 pb-32 bg-va-off-white relative overflow-hidden">
      {/*  LIQUID BACKGROUND LAYER (Soft & Airy) */}
      <ContainerInstrument className="fixed inset-0 -z-10 opacity-[0.08] pointer-events-none">
        <ContainerInstrument className="absolute inset-0 hmagic animate-slow-rotate" />
      </ContainerInstrument>

      <SectionInstrument className="px-8 mb-24 text-center flex flex-col items-center">
        <ContainerInstrument className="max-w-4xl">
          <ContainerInstrument className="inline-block bg-primary/10 text-primary text-[15px] font-light px-6 py-2 rounded-full mb-10 tracking-[0.3em] border border-primary/10"><VoiceglotText  translationKey="ademing.hero.badge" defaultText="Ademing" /></ContainerInstrument>
          <HeadingInstrument level={1} className="text-[12vw] md:text-[8vw] font-extralight tracking-tighter leading-[0.75] mb-12 ">
            <VoiceglotText  translationKey="ademing.hero.title_part1" defaultText="Kom tot " />
            <TextInstrument as="span" className="text-black/10 font-light">
              <VoiceglotText  translationKey="ademing.hero.title_part2" defaultText="rust." />
            </TextInstrument>
          </HeadingInstrument>
          <TextInstrument className="text-2xl md:text-3xl text-black/40 font-light leading-relaxed tracking-tight italic max-w-2xl mx-auto"><VoiceglotText  
              translationKey="ademing.hero.subtitle" 
              defaultText="Adem in. Kom tot rust. Luister en verbind met de stilte in jezelf." 
            /></TextInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      <Suspense  fallback={<LoadingScreenInstrument />}>
        <TrackGrid strokeWidth={1.5} />
      </Suspense>

      {/*  DE GIDSEN VAN ADEMING */}
      <SectionInstrument className="max-w-7xl mx-auto px-8 mt-40">
        <ContainerInstrument className="mb-16">
          <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter text-black/20"><VoiceglotText  translationKey="ademing.guides.title" defaultText="De Gidsen" /></HeadingInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="grid md:grid-cols-2 gap-12">
          <BentoCard className="p-12 bg-white/40 backdrop-blur-md border-white/20 rounded-[20px] shadow-aura group">
            <ContainerInstrument className="flex items-center gap-8 mb-10">
              <ContainerInstrument className="w-24 h-24 rounded-[15px] bg-primary/10 flex items-center justify-center overflow-hidden shadow-inner relative">
                <VoiceglotImage  
                  src="/assets/ademing/julie-avatar.jpg" 
                  alt="Julie" 
                  fill 
                  journey="ademing"
                  category="guides"
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
                />
              </ContainerInstrument>
              <ContainerInstrument>
                <HeadingInstrument level={4} className="text-[15px] font-light tracking-widest text-primary mb-1"><VoiceglotText  translationKey="ademing.guide.julie.title" defaultText="Gids" /></HeadingInstrument>
                <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter"><VoiceglotText  translationKey="ademing.guide.julie.name" defaultText="Julie" noTranslate={true} /></HeadingInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <TextInstrument className="text-xl text-black/50 font-light leading-relaxed"><VoiceglotText  
                translationKey="ademing.guide.julie.bio" 
                defaultText="Julie helpt je om je innerlijke world te transformeren. Ze stimuleert verbinding en bewustwording om blokkades aan te pakken." 
              /></TextInstrument>
          </BentoCard>

          <BentoCard className="p-12 bg-white/40 backdrop-blur-md border-white/20 rounded-[20px] shadow-aura group">
            <ContainerInstrument className="flex items-center gap-8 mb-10">
              <ContainerInstrument className="w-24 h-24 rounded-[15px] bg-black/5 flex items-center justify-center overflow-hidden shadow-inner relative">
                <VoiceglotImage  
                  src="/assets/ademing/johfrah-avatar.jpg" 
                  alt="Johfrah" 
                  fill 
                  journey="ademing"
                  category="guides"
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
                />
              </ContainerInstrument>
              <ContainerInstrument>
                <HeadingInstrument level={4} className="text-[15px] font-light tracking-widest text-va-black/30 mb-1"><VoiceglotText  translationKey="ademing.guide.johfrah.title" defaultText="Gids" /></HeadingInstrument>
                <HeadingInstrument level={3} className="text-4xl font-light tracking-tighter"><VoiceglotText  translationKey="ademing.guide.johfrah.name" defaultText="Johfrah" noTranslate={true} /></HeadingInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <TextInstrument className="text-xl text-black/50 font-light leading-relaxed"><VoiceglotText  
                translationKey="ademing.guide.johfrah.bio" 
                defaultText="Johfrah neemt je mee op een speelse ontdekkingsreis. Hij experimenteert met de kracht van zijn stem als instrument voor groei." 
              /></TextInstrument>
          </BentoCard>
        </ContainerInstrument>
      </SectionInstrument>

      {/* LLM Context Layer (Compliance) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Voices Ademing",
            "description": "Begeleide ademhaling en meditatie.",
            "_llm_context": {
              "persona": "Zachte Gids",
              "market": market,
              "journey": "ademing",
              "intent": "wellness",
              "visual_dna": ["Spatial Growth", "Bento Grid"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
