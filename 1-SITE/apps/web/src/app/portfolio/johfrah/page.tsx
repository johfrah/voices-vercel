import { HostCardLink } from "@/components/portfolio/HostCardLink";
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
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { PricingCalculator } from "@/components/ui/PricingCalculator";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { getActor } from "@/lib/api-server";
import { ArrowRight, Award, Mic } from "lucide-react";
import { Metadata } from "next";
import Image from 'next/image';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: "Johfrah | De Stem achter het Verhaal",
  description: "Warme Vlaamse voice-over & regisseur.",
};

export default function JohfrahPortfolioPage() {
  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white selection:bg-primary selection:text-white">
      <Suspense strokeWidth={1.5} fallback={<LoadingScreenInstrument / />}>
        <JohfrahContent strokeWidth={1.5} / />
      </Suspense>
    </PageWrapperInstrument>
  );
}

async function JohfrahContent() {
  let artistData;
  try {
    artistData = await getActor("Johfrah");
  } catch (e) {
    console.error("Failed to fetch Johfrah data, using fallback", e);
  }

  const data = {
    name: artistData?.display_name || "Johfrah Lefebvre",
    title: "Vlaamse Voice-over & Regisseur",
    image: artistData?.photo_url || "/assets/common/branding/johfrah/johfrah-hero.jpg",
    extended_bio: (artistData as any)?.bio || "Mijn stem is mijn instrument om jouw verhaal te vertellen. Warm, naturel en met een rust die blijft hangen. Of het nu gaat om een documentaire die diepgang vraagt of een commercial die moet binnenkomen: ik zoek altijd naar de menselijke klik.",
    host_content: {
      title: "Host & Reporter",
      intro: "Ik breng verhalen tot leven, recht voor de camera of midden in de actie.",
      experience: "Als regisseur zie ik het grotere plaatje. Dat helpt me om als host de juiste snaar te raken: spontaan, oprecht en altijd met focus op de inhoud.",
      award: "Regisseur."
    },
    reporter_videos: {
      unizo: "fma3fyhhz",
      zorg_leuven: "frraoowha"
    },
    rates: [
      { label: "Online Media", price: artistData?.starting_price || 250, desc: "Social media, YouTube, Web" },
      { label: "E-learning", price: 350, desc: "Per 1000 woorden" },
      { label: "Commercial", price: 450, desc: "Regionaal / Nationaal" }
    ]
  };

  return (
    <>
      <LiquidBackground strokeWidth={1.5} / />
      
      {/* 🎭 JOHFRAH-STIJL HERO (7/5 SPLIT, BOXED) */}
      <SectionInstrument className="relative pt-40 pb-32 overflow-hidden">
        <ContainerInstrument className="max-w-5xl mx-auto px-6">
          <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <ContainerInstrument className="lg:col-span-7 space-y-10">
              <ContainerInstrument className="inline-flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-[20px] shadow-sm border border-black/[0.03]">
                <TextInstrument className="w-2 h-2 rounded-full bg-primary animate-pulse font-light" />
                <TextInstrument className="text-[15px] font-black tracking-widest text-black/40">
                  <VoiceglotText strokeWidth={1.5} translationKey="portfolio.badge" defaultText="The Voice behind the Story" / />
                </TextInstrument>
              </ContainerInstrument>
              
              <HeadingInstrument level={1} className="text-6xl md:text-8xl font-extralight leading-[0.9] tracking-tighter text-va-black">
                Johfrah <br />
                <TextInstrument className="text-primary/40 font-light"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.lefebvre.6eaa14" defaultText="Lefebvre" / /></TextInstrument>
              </HeadingInstrument>
              
              <TextInstrument className="text-2xl font-light text-va-black/40 leading-tight tracking-tight max-w-xl"><VoiceglotText strokeWidth={1.5} translationKey="portfolio.johfrah.title" defaultText={data.title} / /></TextInstrument>

              <ContainerInstrument className="max-w-lg text-[15px] text-va-black/60 leading-relaxed font-light"><VoiceglotText strokeWidth={1.5} translationKey="portfolio.johfrah.bio" defaultText={data.extended_bio} / /></ContainerInstrument>

              <ContainerInstrument className="flex flex-wrap items-center gap-8 pt-4">
                <ButtonInstrument as="a" href="#demos" className="va-btn-pro !rounded-[10px] px-10 py-5"><VoiceglotText strokeWidth={1.5} translationKey="portfolio.johfrah.cta.demos" defaultText="Beluister Demo's" / /></ButtonInstrument>
                <ButtonInstrument as="a" href="#contact" className="text-[15px] font-black tracking-[0.2em] text-va-black/30 hover:text-primary transition-all duration-500 flex items-center gap-3 group bg-transparent p-0">
                  <VoiceglotText strokeWidth={1.5} translationKey="portfolio.johfrah.cta.contact" defaultText="Laten we praten" / />
                  <ArrowRight strokeWidth={1.5} size={14} className="group-hover:translate-x-2 transition-transform" />
                </ButtonInstrument>
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="lg:col-span-5 relative group">
              <ContainerInstrument className="aspect-[4/5] rounded-[20px] overflow-hidden shadow-aura-lg relative transition-all duration-700 va-bezier">
                <Image  
                  src={data.image} 
                  alt={data.name}
                  fill
                  className="object-cover transition-transform duration-[2000ms] group-hover:scale-105 va-bezier"
                  priority
                / />
                <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-va-black/10 to-transparent opacity-30" />
              </ContainerInstrument>
              
              {/* Floating Award Badge - Removed per user request */}
              {/* <ContainerInstrument className="absolute -bottom-6 -left-6 bg-white p-6 rounded-[20px] shadow-aura flex items-center gap-4 max-w-[200px] animate-float border border-black/[0.03]">
                <Award strokeWidth={1.5} className="text-primary shrink-0" size={32} / />
                <TextInstrument className="text-[15px] font-black leading-tight tracking-wider text-va-black/60"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.emmy_award_winnaar.af6af1" defaultText="Emmy Award Winnaar" / /></TextInstrument>
              </ContainerInstrument> */}
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* 🧩 BENTO GRID (Boxed & Soft) */}
      <SectionInstrument className="max-w-5xl mx-auto px-6 py-20">
        <BentoGrid strokeWidth={1.5} columns={3}>
          <HostCardLink strokeWidth={1.5} span="lg" className="hblue text-white p-12 relative overflow-hidden group cursor-pointer rounded-[20px] shadow-aura-lg min-h-[500px] flex flex-col justify-between border border-white/10">
            <ContainerInstrument className="relative z-10 space-y-6">
              <ContainerInstrument className="w-14 h-14 rounded-[12px] bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Award strokeWidth={1.5} size={28} className="text-white/60" / />
              </ContainerInstrument>
              <HeadingInstrument level={2} className="text-4xl font-light tracking-tighter leading-none "><VoiceglotText strokeWidth={1.5} translationKey="portfolio.johfrah.host.title" defaultText="Host & Reporter" / /><TextInstrument className="text-lg text-white/70 font-light leading-relaxed max-w-sm"><VoiceglotText strokeWidth={1.5} translationKey="portfolio.johfrah.host.intro" defaultText={data.host_content.intro} / /></TextInstrument></HeadingInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="relative z-10">
              <TextInstrument className="text-[15px] font-light text-white/50 leading-relaxed mb-8 border-l-2 border-white/10 pl-6"><VoiceglotText strokeWidth={1.5} translationKey="portfolio.johfrah.host.experience" defaultText={data.host_content.experience} / /></TextInstrument>
              <ButtonInstrument className="va-btn-pro !bg-white !text-va-black !rounded-[10px] px-8"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.bekijk_host_werk.55f433" defaultText="Bekijk Host Werk" / /></ButtonInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-[100px]" />
          </HostCardLink>

          <ContainerInstrument className="md:col-span-1 space-y-8">
            {Object.entries(data.reporter_videos).map(([key, videoId]) => (
              <ContainerInstrument key={key} className="aspect-[9/16] rounded-[20px] overflow-hidden relative group shadow-aura border border-black/5">
                <iframe
                  src={`https://www.videoask.com/${videoId}`}
                  className="w-full h-full border-0"
                  allow="camera; microphone; autoplay; encrypted-media;"
                  title={`VideoAsk ${key}`}
                />
              </ContainerInstrument>
            ))}
          </ContainerInstrument>

          <BentoCard id="rates" span="md" className="bg-white p-10 rounded-[20px] shadow-aura flex flex-col justify-between border border-black/[0.03]">
            <div>
              <HeadingInstrument level={3} className="text-2xl font-light tracking-tighter text-va-black mb-10"><VoiceglotText strokeWidth={1.5} translationKey="portfolio.johfrah.rates.title" defaultText="Investering" / /></HeadingInstrument>
              <ContainerInstrument className="space-y-8">
                {data.rates.map((rate, i) => (
                  <ContainerInstrument key={i} className="group">
                    <ContainerInstrument className="flex justify-between items-end mb-2">
                      <TextInstrument as="span" className="font-bold text-[15px] tracking-[0.2em] text-va-black/20 group-hover:text-primary transition-colors"><VoiceglotText strokeWidth={1.5} translationKey={`portfolio.johfrah.rates.${i}.label`} defaultText={rate.label} / /></TextInstrument>
                      <TextInstrument as="span" className="text-2xl font-light tracking-tighter text-va-black">€{rate.price}</TextInstrument>
                    </ContainerInstrument>
                    <TextInstrument className="text-va-black/40 text-[15px] font-medium leading-relaxed"><VoiceglotText strokeWidth={1.5} translationKey={`portfolio.johfrah.rates.${i}.desc`} defaultText={rate.desc} / /></TextInstrument>
                  </ContainerInstrument>
                ))}
              </ContainerInstrument>
            </ContainerInstrument>
            
            <ContainerInstrument className="pt-10 border-t border-black/[0.03] mt-10">
              <TextInstrument className="text-[15px] font-black tracking-widest text-va-black/20 mb-2"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.studio_setup.89f58a" defaultText="Studio Setup" / /></TextInstrument>
              <TextInstrument className="text-[15px] text-va-black/40 font-light"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.neumann_tlm_103___ap.41b21a" defaultText="Neumann TLM 103 • Apollo Interface • SourceConnect" / /></TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          <ContainerInstrument className="md:col-span-3 pt-8">
            <PricingCalculator strokeWidth={1.5} / />
          </ContainerInstrument>

          {/* 🎙️ DEMOS SECTIE (Overzichtelijk) */}
          <BentoCard id="demos" span="full" className="bg-white p-16 rounded-[20px] shadow-aura border border-black/[0.02]">
            <ContainerInstrument className="max-w-2xl mb-16">
              <HeadingInstrument level={2} className="text-5xl md:text-6xl font-light tracking-tighter leading-none mb-8 text-va-black">
                De <TextInstrument className="text-primary/60 italic font-light">stem</TextInstrument> <br /><VoiceglotText strokeWidth={1.5} translationKey="auto.page.die_jouw_verhaal_dra.2fec19" defaultText="die jouw verhaal draagt." / /></HeadingInstrument>
              <TextInstrument className="text-[15px] text-va-black/40 font-light leading-relaxed"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.luister_naar_mijn_we.bb04a7" defaultText="Luister naar mijn werk. Van intieme verhalen tot krachtige commercials. Altijd met de juiste nuance." / /></TextInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artistData?.demos?.map((demo: { category: string; title: string }, i: number) => (
                <ContainerInstrument 
                  key={i}
                  className="group p-8 rounded-[20px] bg-va-off-white border border-black/[0.03] hover:border-primary/20 hover:bg-white hover:shadow-aura transition-all duration-700 va-bezier flex flex-col justify-between min-h-[200px] cursor-pointer"
                >
                  <div>
                    <ContainerInstrument className="w-12 h-12 rounded-[10px] bg-white flex items-center justify-center text-va-black/20 group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-sm mb-6">
                      <Mic strokeWidth={1.5} size={20} / />
                    </ContainerInstrument>
                    <TextInstrument className="font-bold tracking-widest text-[15px] text-va-black/30 group-hover:text-primary transition-colors mb-2"><VoiceglotText strokeWidth={1.5} translationKey={`portfolio.johfrah.demo.${i}.category`} defaultText={demo.category} / /></TextInstrument>
                    <HeadingInstrument level={3} className="text-lg font-light tracking-tight text-va-black"><VoiceglotText strokeWidth={1.5} translationKey={`portfolio.johfrah.demo.${i}.title`} defaultText={demo.title} / /></HeadingInstrument>
                  </ContainerInstrument>
                  
                  <ContainerInstrument className="flex justify-end">
                    <ContainerInstrument className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-4 group-hover:translate-x-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </ContainerInstrument>
                  </ContainerInstrument>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>

      {/* 🏆 LIGHT SIGNATURE CTA */}
      <SectionInstrument id="contact" className="py-32 bg-white relative overflow-hidden border-t border-black/[0.03]">
        <ContainerInstrument className="absolute inset-0 opacity-5 pointer-events-none hmagic" />
        <ContainerInstrument className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <HeadingInstrument level={2} className="text-5xl md:text-7xl font-extralight text-va-black tracking-tighter leading-none mb-12">
            Klaar voor <br />
            <TextInstrument className="text-primary/60 italic font-light"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.jouw_verhaal_.c8adec" defaultText="jouw verhaal?" / /></TextInstrument>
          </HeadingInstrument>
          <ContainerInstrument className="flex flex-col md:flex-row items-center justify-center gap-10">
            <a href="mailto:hallo@johfrah.be">
              <ButtonInstrument className="va-btn-pro !rounded-[10px] px-16 py-6 text-lg shadow-aura-lg hover:scale-105 transition-transform"><VoiceglotText strokeWidth={1.5} translationKey="auto.page.start_een_project.0e6a12" defaultText="Start een project" / /></ButtonInstrument></a>
            <a href="tel:+32475123456" className="text-va-black/30 hover:text-primary transition-colors font-light tracking-[0.2em] text-[15px] "><VoiceglotText strokeWidth={1.5} translationKey="auto.page.bel_direct___32_475_.628911" defaultText="BEL DIRECT: +32 475 12 34 56" / /></a>
          </ContainerInstrument>
        </ContainerInstrument>
      </SectionInstrument>

      {/* 🧠 LLM CONTEXT (Compliance) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Johfrah Portfolio",
            "description": "De stem achter het verhaal. Warme Vlaamse voice-over & regisseur.",
            "_llm_context": {
              "persona": "Johfrah",
              "journey": "portfolio",
              "intent": "showcase",
              "visual_dna": ["Boxed Focus", "Warm Colors", "Soft Rounding", "Liquid DNA"]
            }
          })
        }}
      />
    </>
  );
}
