'use client';

import { useEffect } from 'react';
import {
  ContainerInstrument,
  ButtonInstrument,
  TextInstrument,
  HeadingInstrument,
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 *  APP ERROR (NUCLEAR 2026)
 * Error boundary voor app-level fouten.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
    
    //  CHRIS-PROTOCOL: Self-Healing for Chunk Errors (Deployment Skew)
    // Als een chunk niet geladen kan worden, is er waarschijnlijk een nieuwe versie gepusht.
    // We herladen de pagina geforceerd om de nieuwste assets op te halen.
    if (error.message?.includes('Loading chunk') && error.message?.includes('failed')) {
      console.warn('[Nuclear] Chunk error detected. Triggering self-healing reload...');
      
      // Voorkom oneindige reload loops
      const lastReload = sessionStorage.getItem('voices_last_chunk_reload');
      const now = Date.now();
      
      if (!lastReload || (now - parseInt(lastReload)) > 30000) {
        sessionStorage.setItem('voices_last_chunk_reload', now.toString());
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return;
      }
    }

    //  WATCHDOG NOTIFICATION
    const notifyWatchdog = async () => {
      try {
        await fetch('/api/admin/system/watchdog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: error.message,
            stack: error.stack,
            component: 'AppErrorBoundary',
            url: window.location.href,
            level: 'critical'
          })
        });
      } catch (e) {
        console.error('Watchdog notification failed:', e);
      }
    };

    notifyWatchdog();
  }, [error]);

  return (
    <ContainerInstrument className="min-h-[60vh] flex flex-col items-center justify-center gap-8 py-20 px-6">
      {/*  Diagnostic Error Layer (Visible for debugging) */}
      <ContainerInstrument className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4 max-w-2xl overflow-auto animate-in fade-in duration-700">
        <TextInstrument className="text-red-800 font-mono text-[15px] font-bold mb-1">
          <VoiceglotText translationKey="auto.error.diagnostic_info_.a840d6" defaultText="Diagnostic Info:" />
        </TextInstrument>
        <TextInstrument className="text-red-800 font-mono text-[15px]">{error.message || 'Unknown error'}</TextInstrument>
        {error.cause && <TextInstrument className="text-red-600 font-mono text-[15px] mt-2 border-t border-red-100 pt-2">Cause: {String(error.cause)}</TextInstrument>}
        <TextInstrument className="text-red-400 font-mono text-[15px] mt-2">Digest: {error.digest || 'no-digest'}</TextInstrument>
      </ContainerInstrument>
      <ContainerInstrument className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center">
        <AlertCircle strokeWidth={1.5} size={40} />
      </ContainerInstrument>

      <ContainerInstrument className="text-center space-y-2">
        <HeadingInstrument level={1} className="text-4xl font-light tracking-tighter">
          <VoiceglotText translationKey="error.app.title" defaultText="Oeps, even geduld" />
        </HeadingInstrument>
        <TextInstrument className="text-va-black/40 font-medium max-w-md mx-auto">
          <VoiceglotText 
            translationKey="error.app.text" 
            defaultText="De pagina kon niet volledig worden geladen. We proberen de verbinding te herstellen." 
          />
        </TextInstrument>
      </ContainerInstrument>

      <ButtonInstrument onClick={reset} className="va-btn-pro !px-12">
        <RefreshCw strokeWidth={1.5} size={18} />
        <VoiceglotText translationKey="error.app.cta" defaultText="Opnieuw Proberen" />
      </ButtonInstrument>

      {/*  LLM CONTEXT (Compliance) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ErrorPage",
            "name": "App Error",
            "_llm_context": {
              "persona": "Gids",
              "journey": "common",
              "intent": "error_recovery",
              "capabilities": ["reset_state"],
              "lexicon": ["Fout", "Herstel", "Oeps"],
              "visual_dna": ["Minimal", "Liquid DNA"]
            }
          })
        }}
      />
    </ContainerInstrument>
  );
}
