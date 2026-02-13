'use client';

import { useEffect } from 'react';
import { 
  RootLayoutInstrument, 
  PageWrapperInstrument, 
  ContainerInstrument, 
  HeadingInstrument, 
  TextInstrument, 
  ButtonInstrument 
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * 🛡️ GLOBAL ERROR (NUCLEAR 2026)
 * Laatste verdediging: vangt fouten in root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error (root layout):', error);
  }, [error]);

  return (
    <html lang="nl">
      <body className="bg-va-off-white antialiased">
        <ContainerInstrument className="min-h-screen flex items-center justify-center p-6">
          <ContainerInstrument className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-aura border border-black/5 text-center space-y-8">
            <ContainerInstrument className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
              <AlertCircle size={40} />
            </ContainerInstrument>
            
            <div className="space-y-2">
              <HeadingInstrument level={1} className="text-3xl font-black tracking-tighter">
                <VoiceglotText translationKey="error.global.title" defaultText="Systeem Fout" />
              </HeadingInstrument>
              <TextInstrument className="text-va-black/40 font-medium leading-relaxed">
                <VoiceglotText 
                  translationKey="error.global.text" 
                  defaultText="Er ging iets mis bij het laden van de Freedom Machine. Onze excuses voor het ongemak." 
                />
              </TextInstrument>
            </div>

            <ButtonInstrument 
              onClick={reset}
              className="va-btn-pro w-full !py-6"
            >
              <RefreshCw size={18} />
              <VoiceglotText translationKey="error.global.cta" defaultText="Pagina Herstellen" />
            </ButtonInstrument>
          </ContainerInstrument>
        </ContainerInstrument>

        {/* 🧠 LLM CONTEXT (Compliance) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ErrorPage",
              "name": "System Error",
              "_llm_context": {
                "persona": "Architect",
                "journey": "common",
                "intent": "system_recovery",
                "capabilities": ["reset_page"],
                "lexicon": ["Fout", "Herstel", "Systeem"],
                "visual_dna": ["Minimal", "Aura Shadow"]
              }
            })
          }}
        />
      </body>
    </html>
  );
}
