"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PageWrapperInstrument, 
  SectionInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { Home, ArrowLeft, Heart, Sparkles, Loader2, Compass } from 'lucide-react';
import Link from 'next/link';
import { JourneyCta } from '@/components/ui/JourneyCta';
import { useSonicDNA } from '@/lib/engines/sonic-dna';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

//  NUCLEAR LOADING MANDATE
const LiquidBackground = dynamic(() => import('@/components/ui/LiquidBackground').then(mod => mod.LiquidBackground), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-va-off-white" />
});

/**
 *  404: SMART RECOVERY PAGE
 * 
 * Doel: Een vriendelijke opvang voor kapotte links, 
 * terwijl de Self-Healing Service op de achtergrond Johfrah verwittigt.
 */
export default function NotFound() {
  const router = useRouter();
  const { playClick } = useSonicDNA();
  const [healingStatus, setHealingStatus] = useState<'searching' | 'voicy-offered' | 'ghost-generated' | null>(null);
  const [ghostContent, setGhostContent] = useState<string | null>(null);

  useEffect(() => {
    //  SELF-HEALING: Log de 404 silent op de achtergrond
    const path = window.location.pathname;
    const referrer = document.referrer;
    setHealingStatus('searching');
    
    fetch('/api/watchdog/404', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, referrer })
    })
    .then(res => res.json())
    .then(data => {
      //  AUTOMATIC REDIRECT: Als er een match is gevonden, stuur direct door
      if (data.type === 'redirect' && data.destination) {
        router.push(data.destination);
      } else if (data.type === 'ghost' && data.content) {
        setGhostContent(data.content);
        setHealingStatus('ghost-generated');
      } else {
        setHealingStatus('voicy-offered');
        //  VOICY INTERVENTION: Alleen als er GEEN automatische redirect is
        const timer = setTimeout(() => {
          const event = new CustomEvent('voicy:suggestion', {
            detail: {
              title: <VoiceglotText translationKey="404.voicy.suggestion.title" defaultText="Hulp nodig?" />,
              content: <VoiceglotText translationKey="404.voicy.suggestion.content" defaultText="Het lijkt erop dat je op een dood spoor bent beland. Zal ik Johfrah een seintje geven voor je? Je kunt hier direct een bericht achterlaten." />,
              tab: 'mail'
            }
          });
          window.dispatchEvent(event);
        }, 800);
        return () => clearTimeout(timer);
      }
    })
    .catch(err => {
      console.error('Watchdog failed:', err);
      setHealingStatus(null);
    });
  }, [router]);

  return (
    <>
      <Suspense fallback={null}>
        <LiquidBackground strokeWidth={1.5} />
      </Suspense>
      <PageWrapperInstrument className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
        <ContainerInstrument className="max-w-4xl w-full text-center space-y-12 py-20">
          {healingStatus === 'ghost-generated' && ghostContent ? (
            <ContainerInstrument className="text-left bg-white/80 backdrop-blur-xl p-12 rounded-[40px] shadow-aura-lg border border-black/5 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <ContainerInstrument className="flex items-center gap-2 mb-8 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-black tracking-widest w-fit">
                <Sparkles strokeWidth={1.5} size={12} /><VoiceglotText  translationKey="auto.not_found.voicy_ghost_content_.432daf" defaultText="Voicy Ghost Content (Live Generated)" />
              </ContainerInstrument>
              <ContainerInstrument className="prose prose-va max-w-none">
                <div dangerouslySetInnerHTML={{ __html: ghostContent ? ghostContent.replace(/\n/g, '<br/>') : '' }} />
              </ContainerInstrument>
              <Link  
                href="/agency" 
                className="va-btn-pro mt-12 inline-flex items-center gap-3"
                onClick={() => playClick('soft')}
              >
                <VoiceglotText  translationKey="auto.not_found.bekijk_onze_stemmen.a6c827" defaultText="Bekijk onze stemmen" />
              </Link>
            </ContainerInstrument>
          ) : (
            <div className="space-y-12">
              <div className="space-y-4">
                <HeadingInstrument level={1} className="text-7xl md:text-9xl font-extralight tracking-tighter leading-none text-va-black">
                  <VoiceglotText  translationKey="404.title" defaultText="Spoorloos." />
                </HeadingInstrument>
                <TextInstrument className="text-va-black/40 font-light text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed px-4">
                  <VoiceglotText  
                    translationKey="404.subtitle" 
                    defaultText="Deze bestemming is even onbereikbaar. Geen zorgen, onze gidsen wijzen je de weg naar de juiste stem." 
                  />
                </TextInstrument>
              </div>

              <div className="flex flex-col items-center gap-4">
                {healingStatus === 'voicy-offered' && (
                  <ContainerInstrument className="inline-flex items-center gap-2 px-5 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-bold tracking-widest animate-in fade-in zoom-in duration-500">
                    <Heart strokeWidth={1.5} size={14} className="fill-primary/20" /> 
                    <VoiceglotText  translationKey="404.voicy_help" defaultText="Samen naar de juiste bestemming" />
                  </ContainerInstrument>
                )}

                {healingStatus === 'searching' && (
                  <ContainerInstrument className="inline-flex items-center gap-2 px-5 py-2 bg-va-black/5 rounded-full text-va-black/40 text-[15px] font-bold tracking-widest">
                    <Loader2 strokeWidth={1.5} size={14} className="animate-spin" />
                    <VoiceglotText  translationKey="auto.not_found.voicy_zoekt_naar_een.0fce72" defaultText="Op zoek naar een nieuwe bestemming..." />
                  </ContainerInstrument>
                )}
              </div>

              <ContainerInstrument className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12">
                <Link  
                  href="/" 
                  className="va-btn-pro w-full sm:w-auto px-10 py-5 text-lg group"
                  onClick={() => playClick('soft')}
                >
                  <Home strokeWidth={1.5} size={20} className="group-hover:scale-110 transition-transform" />
                  <VoiceglotText  translationKey="404.cta.home" defaultText="Naar de hoofdpagina" />
                </Link>
                <button 
                  onClick={() => {
                    playClick('soft');
                    window.history.back();
                  }}
                  className="va-btn-secondary w-full sm:w-auto px-10 py-5 text-lg group"
                >
                  <ArrowLeft strokeWidth={1.5} size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <VoiceglotText  translationKey="404.cta.back" defaultText="Ga terug" />
                </button>
              </ContainerInstrument>
            </div>
          )}

          {/* SALLY-MANDATE: Signature CTA for Recovery */}
          <div className="pt-24 opacity-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-forwards">
            <JourneyCta journey="general" />
          </div>
        </ContainerInstrument>

        {/*  LLM CONTEXT (Compliance) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ErrorPage",
              "name": "Page Not Found",
              "description": "Spoorloos pagina - 404 herstel journey",
              "_llm_context": {
                "persona": "Gids",
                "journey": "recovery",
                "intent": "not_found_recovery",
                "capabilities": ["self_healing", "start_chat", "redirect_home"],
                "lexicon": ["404", "Spoorloos", "Herstel", "Gids"],
                "visual_dna": ["Minimal", "Aura Shadow", "Liquid DNA", "Raleway Extralight"]
              }
            })
          }}
        />
      </PageWrapperInstrument>
    </>
  );
}
