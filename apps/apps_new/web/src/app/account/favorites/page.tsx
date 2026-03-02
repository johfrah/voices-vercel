"use client";

import { useVoicesState } from '@/contexts/VoicesStateContext';
import { 
  ContainerInstrument, 
  HeadingInstrument, 
  PageWrapperInstrument, 
  SectionInstrument, 
  TextInstrument,
  ButtonInstrument,
  LoadingScreenInstrument
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { VoiceCard } from '@/components/ui/VoiceCard';
import { ArrowLeft, Heart } from 'lucide-react';
import { VoicesLink as Link } from '@/components/ui/VoicesLink';
import { useEffect, useState, Suspense } from 'react';
import dynamic from "next/dynamic";

//  NUCLEAR LOADING MANDATE
const LiquidBackground = dynamic(() => import("@/components/ui/LiquidBackground").then(mod => mod.LiquidBackground), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-va-off-white" />
});

export default function FavoritesPage() {
  const { state } = useVoicesState();
  const [mounted, setMounted] = useState(false);
  const favoriteActors = state.selected_actors || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <LoadingScreenInstrument />;

  return (
    <>
      <Suspense fallback={null}>
        <LiquidBackground />
      </Suspense>
      
      <PageWrapperInstrument className="bg-va-off-white min-h-screen overflow-hidden">
        <SectionInstrument className="pt-64 pb-12 relative z-10 max-w-6xl mx-auto px-6 text-center">
          <header className="max-w-4xl mx-auto">
            <HeadingInstrument level={1} className="text-[8vw] lg:text-[120px] font-extralight tracking-tighter mb-10 leading-[0.85] text-va-black">
              <VoiceglotText translationKey="account.favorites.title" defaultText="Jouw Selectie" />
            </HeadingInstrument>
            
            <TextInstrument className="text-2xl lg:text-3xl text-va-black/40 font-light tracking-tight max-w-2xl mx-auto leading-tight">
              <VoiceglotText translationKey="account.favorites.subtitle" defaultText="Een overzicht van alle stemmen die je hebt bewaard." />
            </TextInstrument>
            
            <ContainerInstrument className="w-24 h-1 bg-black/5 rounded-full mx-auto mt-12" />
          </header>
        </SectionInstrument>

        <SectionInstrument className="py-16 relative z-10 max-w-7xl mx-auto px-6">
          {favoriteActors.length > 0 ? (
            <ContainerInstrument className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoriteActors.map((actor: any) => (
                <VoiceCard key={actor.id} voice={actor} />
              ))}
            </ContainerInstrument>
          ) : (
            <ContainerInstrument className="text-center py-32 bg-white/80 backdrop-blur-xl rounded-[20px] border border-white/20 shadow-aura max-w-4xl mx-auto">
              <ContainerInstrument className="w-20 h-20 bg-va-off-white rounded-full flex items-center justify-center text-va-black/10 mx-auto mb-10">
                <Heart strokeWidth={1.5} size={40} />
              </ContainerInstrument>
              <HeadingInstrument level={3} className="text-3xl font-light mb-6 tracking-tight text-va-black">
                <VoiceglotText translationKey="account.favorites.empty_title" defaultText="Nog geen favorieten" />
              </HeadingInstrument>
              <TextInstrument className="text-lg text-va-black/50 font-light leading-relaxed tracking-tight mb-12 max-w-md mx-auto">
                <VoiceglotText translationKey="account.favorites.empty_text" defaultText="Je hebt nog geen stemmen aan je selectie toegevoegd. Ontdek onze stemmen en klik op het hartje." />
              </TextInstrument>
              <ButtonInstrument as={Link} href="/agency" className="va-btn-pro !px-12 !py-6 !text-base !tracking-widest uppercase">
                <VoiceglotText translationKey="account.favorites.discover_cta" defaultText="Ontdek stemmen" />
              </ButtonInstrument>
            </ContainerInstrument>
          )}
        </SectionInstrument>

        {/* SIGNATURE CTA - THE FINALE */}
        <footer className="py-32 relative z-10 max-w-6xl mx-auto px-6">
          <ContainerInstrument className="bg-va-black text-white p-24 lg:p-32 rounded-[20px] shadow-aura-lg relative overflow-hidden group text-center">
            <ContainerInstrument className="relative z-10">
              <TextInstrument className="text-[15px] font-medium tracking-[0.4em] text-primary/60 mb-12 block uppercase">
                <VoiceglotText translationKey="cta.next_step" defaultText="volgende stap" />
              </TextInstrument>
              <HeadingInstrument level={2} className="text-[8vw] lg:text-8xl font-light tracking-tighter mb-20 leading-[0.9] text-white">
                <VoiceglotText translationKey="cta.ready_title" defaultText="Klaar om jouw stem te vinden?" />
              </HeadingInstrument>
              <ContainerInstrument className="flex flex-col sm:flex-row items-center justify-center gap-12">
                <Link href="/agency" className="bg-va-off-white text-va-black px-24 py-12 rounded-[10px] font-medium text-base tracking-widest hover:scale-105 transition-all duration-700 shadow-2xl hover:bg-white uppercase">
                  <VoiceglotText translationKey="cta.find_voice" defaultText="vind jouw stem" />
                </Link>
                <Link href="/contact" className="text-white/30 hover:text-white font-medium text-base tracking-widest flex items-center gap-6 group/link transition-all duration-700 uppercase">
                  <VoiceglotText translationKey="cta.ask_question" defaultText="stel een vraag" />
                  <ArrowLeft className="rotate-180 group-hover/link:translate-x-4 transition-transform duration-700" strokeWidth={1.5} size={28} />
                </Link>
              </ContainerInstrument>
            </ContainerInstrument>
          </ContainerInstrument>
        </footer>
      </PageWrapperInstrument>
    </>
  );
}
