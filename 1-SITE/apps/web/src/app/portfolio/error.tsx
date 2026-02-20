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
 *  JOURNEY ERROR BOUNDARY (NUCLEAR 2026)
 * Voorkomt dat een fout in één journey (bijv. /agency) de hele site (ademing, portfolio) platlegt.
 */
export default function JourneyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Journey error:', error);
    
    //  WATCHDOG NOTIFICATION
    const notifyWatchdog = async () => {
      try {
        await fetch('/api/watchdog/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `[Journey Error] ${error.message}`,
            cause: String(error.cause || ''),
            digest: error.digest,
            url: window.location.href,
            journey: window.location.pathname.split('/')[1] || 'root'
          })
        });
      } catch (e) {
        console.error('Watchdog notification failed:', e);
      }
    };

    notifyWatchdog();
  }, [error]);

  return (
    <ContainerInstrument className="min-h-[40vh] flex flex-col items-center justify-center gap-6 py-12 px-6 bg-va-off-white/50 rounded-[40px] border border-black/5 my-12">
      <ContainerInstrument className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
        <AlertCircle strokeWidth={1.5} size={32} />
      </ContainerInstrument>

      <ContainerInstrument className="text-center space-y-2">
        <HeadingInstrument level={2} className="text-2xl font-light tracking-tighter">
          <VoiceglotText translationKey="error.journey.title" defaultText="Deze sectie is even niet bereikbaar" />
        </HeadingInstrument>
        <TextInstrument className="text-va-black/40 font-medium max-w-md mx-auto text-[15px]">
          <VoiceglotText 
            translationKey="error.journey.text" 
            defaultText="Er ging iets mis bij het laden van deze journey. De rest van de site werkt nog gewoon." 
          />
        </TextInstrument>
      </ContainerInstrument>

      <ButtonInstrument onClick={reset} className="va-btn-pro !px-8 !py-3 text-[15px]">
        <RefreshCw strokeWidth={1.5} size={16} />
        <VoiceglotText translationKey="error.journey.cta" defaultText="Probeer deze sectie opnieuw" />
      </ButtonInstrument>
    </ContainerInstrument>
  );
}
