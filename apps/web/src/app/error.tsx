'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ContainerInstrument,
  ButtonInstrument,
  TextInstrument,
  HeadingInstrument,
} from '@/components/ui/LayoutInstruments';
import { VoiceglotText } from '@/components/ui/VoiceglotText';
import { AlertCircle, RefreshCw, Loader2, Wifi, WifiOff } from 'lucide-react';

const TRANSIENT_RESET_BUDGET_KEY = 'voices_transient_reset_budget_v1';
const CHUNK_RETRY_KEY = 'voices_chunk_retry_v2';
const TRANSIENT_RESET_WINDOW_MS = 60000;
const MAX_TRANSIENT_RESETS = 2;
const MAX_CHUNK_RETRIES = 3;
const CHUNK_RETRY_COOLDOWN_MS = 15000;

function isChunkLoadError(error: Error & { digest?: string }) {
  const message = `${error?.message || ''} ${error?.name || ''}`.toLowerCase();
  return (
    message.includes('loading chunk') ||
    message.includes('chunkloaderror') ||
    message.includes('css_chunk_load_failed') ||
    message.includes('dynamically imported module') ||
    error?.name === 'ChunkLoadError'
  );
}

function isTransientConnectionError(error: Error & { digest?: string }) {
  const message = `${error?.message || ''} ${error?.name || ''}`.toLowerCase();
  return (
    message.includes('connection closed') ||
    message.includes('failed to fetch') ||
    message.includes('network error') ||
    message.includes('load failed')
  );
}

function isHydrationError(error: Error & { digest?: string }) {
  const message = error?.message || '';
  return (
    message.includes('Minified React error #419') ||
    message.includes('Minified React error #425') ||
    message.includes('Server Components render') ||
    message.includes('Hydration')
  );
}

function consumeTransientResetBudget() {
  if (typeof window === 'undefined') return false;
  const now = Date.now();
  let state = { window_start: now, count: 0 };
  try {
    const raw = sessionStorage.getItem(TRANSIENT_RESET_BUDGET_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { window_start?: number; count?: number };
      state = {
        window_start: Number(parsed.window_start) || now,
        count: Number(parsed.count) || 0
      };
    }
  } catch {}

  if (now - state.window_start > TRANSIENT_RESET_WINDOW_MS) {
    state = { window_start: now, count: 0 };
  }
  if (state.count >= MAX_TRANSIENT_RESETS) return false;

  state.count += 1;
  sessionStorage.setItem(TRANSIENT_RESET_BUDGET_KEY, JSON.stringify(state));
  return true;
}

function getChunkRetryState(): { count: number; lastAttempt: number } {
  if (typeof window === 'undefined') return { count: 0, lastAttempt: 0 };
  try {
    const raw = sessionStorage.getItem(CHUNK_RETRY_KEY);
    return raw ? JSON.parse(raw) : { count: 0, lastAttempt: 0 };
  } catch {
    return { count: 0, lastAttempt: 0 };
  }
}

function incrementChunkRetry(): number {
  if (typeof window === 'undefined') return 0;
  const state = getChunkRetryState();
  const now = Date.now();
  
  if (now - state.lastAttempt > CHUNK_RETRY_COOLDOWN_MS) {
    state.count = 0;
  }
  
  state.count += 1;
  state.lastAttempt = now;
  
  try {
    sessionStorage.setItem(CHUNK_RETRY_KEY, JSON.stringify(state));
  } catch {}
  
  return state.count;
}

function clearChunkRetryState(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(CHUNK_RETRY_KEY);
  } catch {}
}

async function clearCachesAndReload(): Promise<void> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    } catch {}
  }
  
  const url = new URL(window.location.href);
  url.searchParams.set('_r', Date.now().toString());
  window.location.href = url.toString();
}

/**
 * 🛡️ APP ERROR (NUCLEAR 2026 v2.28.96)
 * Error boundary voor app-level fouten met geavanceerde chunk recovery.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const onlineListenerRegistered = useRef(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    console.error('🚨 App error:', error);
    
    const isChunk = isChunkLoadError(error);
    const isHydration = isHydrationError(error);
    const isTransient = isTransientConnectionError(error);
    
    if (isChunk || isHydration) {
      const currentRetry = incrementChunkRetry();
      setRetryCount(currentRetry);
      
      console.warn(`🔄 [Nuclear] Recoverable error detected (attempt ${currentRetry}/${MAX_CHUNK_RETRIES}):`, 
        isChunk ? 'ChunkLoadError' : 'HydrationError'
      );
      
      if (currentRetry <= MAX_CHUNK_RETRIES) {
        setIsRetrying(true);
        
        const delay = Math.min(1000 * Math.pow(2, currentRetry - 1), 8000);
        
        console.info(`🔄 [Nuclear] Auto-retrying in ${delay}ms...`);
        
        const timer = setTimeout(() => {
          if (currentRetry >= MAX_CHUNK_RETRIES) {
            console.warn('🔄 [Nuclear] Max retries reached, clearing caches and forcing full reload...');
            clearChunkRetryState();
            clearCachesAndReload();
          } else {
            window.location.reload();
          }
        }, delay);
        
        return () => clearTimeout(timer);
      } else {
        console.error('❌ [Nuclear] Recovery failed after max retries');
        clearChunkRetryState();
      }
    }

    if (isTransient) {
      const attemptReset = () => {
        if (consumeTransientResetBudget()) {
          reset();
        }
      };

      if (!navigator.onLine) {
        if (!onlineListenerRegistered.current) {
          const handleOnline = () => {
            onlineListenerRegistered.current = false;
            attemptReset();
          };
          onlineListenerRegistered.current = true;
          window.addEventListener('online', handleOnline, { once: true });
        }
      } else {
        attemptReset();
      }
    }

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
            level: isChunk || isHydration ? 'warn' : 'critical',
            metadata: {
              isChunkError: isChunk,
              isHydrationError: isHydration,
              retryCount,
              userAgent: navigator.userAgent
            }
          })
        });
      } catch (e) {
        console.error('Watchdog notification failed:', e);
      }
    };

    notifyWatchdog();
  }, [error, reset, retryCount]);

  const handleManualRetry = () => {
    clearChunkRetryState();
    reset();
  };

  const handleHardReload = () => {
    clearChunkRetryState();
    clearCachesAndReload();
  };

  const isChunkError = isChunkLoadError(error);

  if (isRetrying) {
    return (
      <ContainerInstrument className="min-h-[60vh] flex flex-col items-center justify-center gap-8 py-20 px-6">
        <ContainerInstrument className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center">
          <Loader2 strokeWidth={1.5} size={40} className="animate-spin" />
        </ContainerInstrument>

        <ContainerInstrument className="text-center space-y-2">
          <HeadingInstrument level={1} className="text-4xl font-light tracking-tighter">
            <VoiceglotText translationKey="error.app.recovering_title" defaultText="Even geduld..." />
          </HeadingInstrument>
          <TextInstrument className="text-va-black/40 font-medium max-w-md mx-auto">
            <VoiceglotText 
              translationKey="error.app.recovering_text" 
              defaultText="We herstellen de verbinding automatisch." 
            />
          </TextInstrument>
          <TextInstrument className="text-va-black/20 text-sm">
            Poging {retryCount} van {MAX_CHUNK_RETRIES}
          </TextInstrument>
        </ContainerInstrument>
      </ContainerInstrument>
    );
  }

  return (
    <ContainerInstrument className="min-h-[60vh] flex flex-col items-center justify-center gap-8 py-20 px-6">
      {isOffline && (
        <ContainerInstrument className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-4 max-w-md flex items-center gap-3">
          <WifiOff className="text-amber-600" size={20} />
          <TextInstrument className="text-amber-800 text-sm">
            <VoiceglotText translationKey="error.app.offline" defaultText="Je bent offline. Controleer je internetverbinding." />
          </TextInstrument>
        </ContainerInstrument>
      )}

      {isChunkError && (
        <ContainerInstrument className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 max-w-md">
          <TextInstrument className="text-blue-800 text-sm">
            <VoiceglotText 
              translationKey="error.app.chunk_info" 
              defaultText="Dit kan gebeuren na een update. Een volledige herlaadbeurt lost dit meestal op." 
            />
          </TextInstrument>
        </ContainerInstrument>
      )}

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

      <ContainerInstrument className="flex flex-col sm:flex-row gap-4">
        <ButtonInstrument onClick={handleManualRetry} className="va-btn-pro !px-12">
          <RefreshCw strokeWidth={1.5} size={18} />
          <VoiceglotText translationKey="error.app.cta" defaultText="Opnieuw Proberen" />
        </ButtonInstrument>
        
        {isChunkError && (
          <ButtonInstrument 
            onClick={handleHardReload} 
            variant="outline"
            className="!px-8 !border-va-black/20 !text-va-black/60 hover:!bg-va-black/5"
          >
            <Wifi strokeWidth={1.5} size={18} />
            <VoiceglotText translationKey="error.app.hard_reload" defaultText="Volledige Herlaadbeurt" />
          </ButtonInstrument>
        )}
      </ContainerInstrument>

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
