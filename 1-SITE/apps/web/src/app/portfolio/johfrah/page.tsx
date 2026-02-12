import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { HostCardLink } from "@/components/portfolio/HostCardLink";
import { PricingCalculator } from "@/components/ui/PricingCalculator";
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  LoadingScreenInstrument,
  HeadingInstrument,
  TextInstrument,
  ButtonInstrument
} from "@/components/ui/LayoutInstruments";
import { VoiceglotText } from "@/components/ui/VoiceglotText";
import { Award, Mic } from "lucide-react";
import { Metadata } from "next";
import Image from 'next/image';
import { Suspense } from 'react';
import { getActor } from "@/lib/api-server";

// ... existing sonic DNA helper ...

export const metadata: Metadata = {
  title: "Johfrah | Warme Vlaamse Voice-over",
  description: "Regisseur en voice-over talent voor documentaires, commercials en host content.",
};

export default function JohfrahPortfolioPage() {
  return (
    <PageWrapperInstrument>
      <Suspense fallback={<LoadingScreenInstrument />}>
        <JohfrahContent />
      </Suspense>
    </PageWrapperInstrument>
  );
}

async function JohfrahContent() {
  // 🚀 Intelligence Layer: Haal echte data op uit de database
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
    extended_bio: artistData?.bio || "Ik ben Johfrah Lefebvre, een Vlaamse voice-over uit België. Mijn stem klinkt diep, warm, naturel en vertrouwd. Perfect voor docu’s en meditatie-apps. Ik kan e-learning teksten heel helder en begrijpbaar inspreken. Maar mijn stem kan ook energiek en dynamisch klinken. Perfect voor commercials die eruit moeten springen.",
    host_content: {
      title: "Vlaamse presentator & tv-reporter",
      intro: "Ik ben Johfrah Lefebvre. Ik breng uw verhaal op een authentieke en boeiende manier tot leven.",
      experience: "Als reporter ben ik er een beetje vanzelf ingerold. Mijn ervaring als televisieregisseur, cameraman, editor en voice-over helpt mij om uw boodschap op een warme, spontane en authentieke manier over te brengen.",
      award: "International Emmy Award winnaar als regisseur."
    },
    reporter_videos: {
      unizo: "fma3fyhhz",
      zorg_leuven: "frraoowha"
    },
    // 💰 Dynamische tarieven uit de database
    rates: [
      { label: "Online Media", price: artistData?.starting_price || 250, desc: "Social media, YouTube, Web" },
      { label: "E-learning", price: 350, desc: "Per 1000 woorden" },
      { label: "Commercial", price: 450, desc: "Regionaal / Nationaal" }
    ],
    studio_specs: {
      mic: "Neumann TLM 103",
      interface: "Universal Audio Apollo",
      remote: "SourceConnect, CleanFeed"
    }
  };

  return (
    <PageWrapperInstrument className="min-h-screen bg-va-off-white">
      <SectionInstrument className="relative overflow-hidden">
        <ContainerInstrument className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          <ContainerInstrument className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ContainerInstrument className="relative group">
              <ContainerInstrument className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-[0_40px_40px_-20px_rgba(0,0,0,0.06)] relative">
                <Image 
                  src={data.image} 
                  alt={data.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <ContainerInstrument className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </ContainerInstrument>
            </ContainerInstrument>

            <ContainerInstrument className="space-y-8">
              <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[10px] font-black uppercase tracking-widest">
                <Mic size={12} fill="currentColor" /> 
                <VoiceglotText translationKey="portfolio.badge" defaultText="Portfolio" />
              </ContainerInstrument>
              
              <HeadingInstrument level={1} className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter">
                <VoiceglotText translationKey="portfolio.johfrah.name" defaultText={data.name} />
              </HeadingInstrument>
              
              <TextInstrument className="text-2xl font-medium text-va-black/60">
                <VoiceglotText translationKey="portfolio.johfrah.title" defaultText={data.title} />
              </TextInstrument>

              <ContainerInstrument className="prose prose-va max-w-none text-va-black/70 leading-relaxed">
                <VoiceglotText translationKey="portfolio.johfrah.bio" defaultText={data.extended_bio} />
              </ContainerInstrument>

            <ContainerInstrument className="flex flex-wrap items-center gap-6 pt-4">
              <ButtonInstrument as="a" href="#demos" className="va-btn-pro">
                <VoiceglotText translationKey="portfolio.johfrah.cta.demos" defaultText="Beluister Demo's" />
              </ButtonInstrument>
              <ButtonInstrument as="a" href="/contact" className="px-10 py-5 rounded-[24px] font-bold uppercase tracking-widest text-[13px] border-2 border-black/5 hover:border-primary transition-all">
                <VoiceglotText translationKey="portfolio.johfrah.cta.contact" defaultText="Contact" />
              </ButtonInstrument>
            </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </ContainerInstrument>
        <ContainerInstrument className="absolute top-0 left-0 w-full h-full -z-10 hmagic opacity-5" />
      </SectionInstrument>

      <SectionInstrument className="max-w-7xl mx-auto px-6 py-20">
        <BentoGrid>
          <HostCardLink span="xl" className="hblue text-white p-12 relative overflow-hidden group cursor-pointer">
            <ContainerInstrument className="relative z-10 space-y-6">
              <ContainerInstrument className="flex items-center gap-3">
                <Award size={24} fill="currentColor" />
                <HeadingInstrument level={2} className="text-4xl font-black uppercase tracking-tighter">
                  <VoiceglotText translationKey="portfolio.johfrah.host.title" defaultText="Host Content" />
                </HeadingInstrument>
              </ContainerInstrument>
              <ContainerInstrument className="space-y-4 text-white/90">
                <HeadingInstrument level={3} className="text-2xl font-black">
                  <VoiceglotText translationKey="portfolio.johfrah.host.subtitle" defaultText={data.host_content.title} />
                </HeadingInstrument>
                <TextInstrument className="leading-relaxed">
                  <VoiceglotText translationKey="portfolio.johfrah.host.intro" defaultText={data.host_content.intro} />
                </TextInstrument>
                <TextInstrument className="leading-relaxed">
                  <VoiceglotText translationKey="portfolio.johfrah.host.experience" defaultText={data.host_content.experience} />
                </TextInstrument>
                <ContainerInstrument className="pt-4 border-t border-white/20">
                  <TextInstrument className="font-bold">
                    <VoiceglotText translationKey="portfolio.johfrah.host.award" defaultText={data.host_content.award} />
                  </TextInstrument>
                </ContainerInstrument>
              </ContainerInstrument>
            </ContainerInstrument>
            <ContainerInstrument className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-[100px]" />
          </HostCardLink>

          {Object.entries(data.reporter_videos).map(([key, videoId]) => (
            <BentoCard key={key} span="lg" className="aspect-video p-0 overflow-hidden relative group">
              <iframe
                src={`https://www.videoask.com/${videoId}`}
                className="w-full h-full border-0"
                allow="camera; microphone; autoplay; encrypted-media;"
                title={`VideoAsk ${key}`}
              />
            </BentoCard>
          ))}

          <BentoCard span="md" className="bg-va-black text-white p-8">
            <HeadingInstrument level={3} className="text-2xl font-black uppercase tracking-tighter mb-6">
              <VoiceglotText translationKey="portfolio.johfrah.rates.title" defaultText="Tarieven" />
            </HeadingInstrument>
            <ContainerInstrument className="space-y-4">
              {data.rates.map((rate, i) => (
                <ContainerInstrument key={i} className="border-t border-white/10 pt-4">
                  <ContainerInstrument className="flex justify-between items-start mb-2">
                    <TextInstrument as="span" className="font-bold uppercase text-[11px] tracking-widest">
                      <VoiceglotText translationKey={`portfolio.johfrah.rates.${i}.label`} defaultText={rate.label} />
                    </TextInstrument>
                    <TextInstrument as="span" className="text-xl font-black">€{rate.price}</TextInstrument>
                  </ContainerInstrument>
                  <TextInstrument className="text-white/60 text-[10px] uppercase tracking-wider">
                    <VoiceglotText translationKey={`portfolio.johfrah.rates.${i}.desc`} defaultText={rate.desc} />
                  </TextInstrument>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          </BentoCard>

          <BentoCard span="sm" className="bg-white/50 backdrop-blur-sm">
            <HeadingInstrument level={3} className="text-lg font-black uppercase tracking-tighter mb-4">
              <VoiceglotText translationKey="portfolio.johfrah.studio.title" defaultText="Studio" />
            </HeadingInstrument>
            <ContainerInstrument className="space-y-2 text-[11px] uppercase tracking-wider text-va-black/60">
              <TextInstrument>
                <VoiceglotText translationKey="portfolio.johfrah.studio.mic" defaultText={`Mic: ${data.studio_specs.mic}`} />
              </TextInstrument>
              <TextInstrument>
                <VoiceglotText translationKey="portfolio.johfrah.studio.interface" defaultText={`Interface: ${data.studio_specs.interface}`} />
              </TextInstrument>
              <TextInstrument>
                <VoiceglotText translationKey="portfolio.johfrah.studio.remote" defaultText={`Remote: ${data.studio_specs.remote}`} />
              </TextInstrument>
            </ContainerInstrument>
          </BentoCard>

          {/* Pricing Calculator Integration */}
          <PricingCalculator />

          {/* 🎙️ DEMOS SECTIE */}
          <BentoCard id="demos" span="xl" className="bg-white p-12 shadow-aura">
            <HeadingInstrument level={2} className="text-3xl font-black uppercase tracking-tight mb-12">
              <VoiceglotText translationKey="portfolio.johfrah.demos.title" defaultText="Stem" />
              <TextInstrument as="span" className="text-primary">
                <VoiceglotText translationKey="portfolio.johfrah.demos.subtitle" defaultText=" Demo's" />
              </TextInstrument>
            </HeadingInstrument>

            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {artistData?.demos?.map((demo: any, i: number) => (
                <ContainerInstrument 
                  key={i}
                  className="group p-6 rounded-[24px] bg-va-off-white border border-black/5 hover:border-primary/20 transition-all flex items-center justify-between cursor-pointer"
                >
                  <ContainerInstrument className="flex items-center gap-4">
                    <ContainerInstrument className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-va-black group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <Mic size={20} />
                    </ContainerInstrument>
                    <ContainerInstrument>
                      <HeadingInstrument level={4} className="font-black uppercase tracking-tight text-sm">
                        <VoiceglotText translationKey={`portfolio.johfrah.demo.${i}.title`} defaultText={demo.title} />
                      </HeadingInstrument>
                      <TextInstrument className="text-[10px] font-black text-va-black/20 uppercase tracking-widest">
                        <VoiceglotText translationKey={`portfolio.johfrah.demo.${i}.category`} defaultText={demo.category} />
                      </TextInstrument>
                    </ContainerInstrument>
                  </ContainerInstrument>
                  <ContainerInstrument className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  </ContainerInstrument>
                </ContainerInstrument>
              ))}
            </ContainerInstrument>
          </BentoCard>
        </BentoGrid>
      </SectionInstrument>
    </PageWrapperInstrument>
  );
}