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
import { Home, Search, ArrowLeft, Heart, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';

/**
 * 🕵️ 404: SMART RECOVERY PAGE
 * 
 * Doel: Een vriendelijke opvang voor kapotte links, 
 * terwijl de Self-Healing Service op de achtergrond Johfrah verwittigt.
 */
export default function NotFound() {
  const router = useRouter();
  const [healingStatus, setHealingStatus] = useState<'searching' | 'voicy-offered' | 'ghost-generated' | null>(null);
  const [ghostContent, setGhostContent] = useState<string | null>(null);

  useEffect(() => {
    // 🩹 SELF-HEALING: Log de 404 silent op de achtergrond
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
      // 🚀 AUTOMATIC REDIRECT: Als er een match is gevonden, stuur direct door
      if (data.type === 'redirect' && data.destination) {
        router.push(data.destination);
      } else if (data.type === 'ghost' && data.content) {
        setGhostContent(data.content);
        setHealingStatus('ghost-generated');
      } else {
        setHealingStatus('voicy-offered');
        // 🤖 VOICY INTERVENTION: Alleen als er GEEN automatische redirect is
        const timer = setTimeout(() => {
          const event = new CustomEvent('voicy:suggestion', {
            detail: {
              title: 'Oeps, een dood spoor',
              content: 'Het lijkt erop dat je op een dood spoor bent beland. Zal ik Johfrah een seintje geven voor je? Je kunt hier direct een bericht achterlaten.',
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
    <PageWrapperInstrument className="min-h-[80vh] flex items-center justify-center p-6">
      <ContainerInstrument className="max-w-2xl text-center space-y-8">
        {healingStatus === 'ghost-generated' && ghostContent ? (
          <ContainerInstrument className="text-left bg-white p-12 rounded-[40px] shadow-aura border border-black/5 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <ContainerInstrument className="flex items-center gap-2 mb-8 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-black tracking-widest w-fit">
              <Sparkles size={12} /> Voicy Ghost Content (Live Generated)
            </ContainerInstrument>
            <div className="prose prose-va max-w-none">
              <div dangerouslySetInnerHTML={{ __html: ghostContent.replace(/\n/g, '<br/>') }} />
            </div>
            <Link href="/agency" className="va-btn-pro mt-12 inline-block">
              Bekijk onze stemmen
            </Link>
          </ContainerInstrument>
        ) : (
          <>
            <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-primary text-[15px] font-black tracking-widest border border-primary/10">
              <Search size={12} /> <VoiceglotText translationKey="404.badge" defaultText="Error 404" />
            </ContainerInstrument>
            
            <HeadingInstrument level={1} className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
              <VoiceglotText translationKey="404.title" defaultText="Spoorloos." />
            </HeadingInstrument>
            
            <TextInstrument className="text-va-black/40 font-medium text-lg max-w-md mx-auto leading-relaxed">
              <VoiceglotText 
                translationKey="404.subtitle" 
                defaultText="De pagina die je zoekt is verplaatst of bestaat niet meer. Geen zorgen, onze gidsen zijn al op zoek." 
              />
            </TextInstrument>

            {healingStatus === 'voicy-offered' && (
              <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-[15px] font-bold tracking-widest animate-pulse">
                <Heart size={12} /> <VoiceglotText translationKey="404.voicy_help" defaultText="Voicy helpt je verder →" />
              </ContainerInstrument>
            )}

            {healingStatus === 'searching' && (
              <ContainerInstrument className="inline-flex items-center gap-2 px-4 py-2 bg-va-black/5 rounded-full text-va-black/40 text-[15px] font-bold tracking-widest">
                <Loader2 size={12} className="animate-spin" /> Voicy zoekt naar een oplossing...
              </ContainerInstrument>
            )}

            <ContainerInstrument className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href="/" className="va-btn-pro w-full sm:w-auto">
                <Home size={18} />
                <VoiceglotText translationKey="404.cta.home" defaultText="Naar de hoofdpagina" />
              </Link>
              <button 
                onClick={() => window.history.back()}
                className="va-btn-secondary w-full sm:w-auto"
              >
                <ArrowLeft size={16} />
                <VoiceglotText translationKey="404.cta.back" defaultText="Ga terug" />
              </button>
            </ContainerInstrument>
          </>
        )}
      </ContainerInstrument>

      {/* 🧠 LLM CONTEXT (Compliance) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ErrorPage",
            "name": "Page Not Found",
            "_llm_context": {
              "persona": "Gids",
              "journey": "common",
              "intent": "not_found_recovery",
              "capabilities": ["self_healing", "start_chat", "redirect_home"],
              "lexicon": ["404", "Spoorloos", "Herstel"],
              "visual_dna": ["Minimal", "Aura Shadow", "Liquid DNA"]
            }
          })
        }}
      />
    </PageWrapperInstrument>
  );
}
