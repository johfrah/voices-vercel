"use client";

import { useEffect, useRef } from 'react';

/**
 * 🛡️ CHUNK LOAD RETRY (v2.28.96)
 * 
 * Dit component patcht de webpack chunk loading mechanisme om automatisch
 * te retrien bij timeout errors. Dit voorkomt de "ChunkLoadError" die 
 * optreedt bij trage verbindingen of Vercel edge caching issues.
 * 
 * CHRIS-PROTOCOL:
 * - Exponentiële backoff: 1s, 2s, 4s
 * - Maximum 3 retries per chunk
 * - Na alle retries: forceer hard reload om deployment skew te fixen
 * - Logt naar console voor forensisch onderzoek
 */

const CHUNK_RETRY_KEY = 'voices_chunk_retry_state_v1';
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000;

interface ChunkRetryState {
  [chunkId: string]: {
    retries: number;
    lastAttempt: number;
  };
}

function getRetryState(): ChunkRetryState {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(CHUNK_RETRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setRetryState(state: ChunkRetryState): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CHUNK_RETRY_KEY, JSON.stringify(state));
  } catch {}
}

function clearOldRetryStates(): void {
  const state = getRetryState();
  const now = Date.now();
  const CLEANUP_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  
  const cleanedState: ChunkRetryState = {};
  for (const [chunkId, data] of Object.entries(state)) {
    if (now - data.lastAttempt < CLEANUP_THRESHOLD) {
      cleanedState[chunkId] = data;
    }
  }
  setRetryState(cleanedState);
}

export function ChunkLoadRetry(): null {
  const patchedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (patchedRef.current) return;
    patchedRef.current = true;

    clearOldRetryStates();

    // Patch webpack's require.ensure / dynamic import error handling
    const originalOnError = window.onerror;
    
    window.onerror = function(message, source, lineno, colno, error) {
      // Check if this is a chunk load error
      const isChunkError = 
        error?.name === 'ChunkLoadError' ||
        (typeof message === 'string' && (
          message.includes('Loading chunk') ||
          message.includes('ChunkLoadError') ||
          message.includes('Loading CSS chunk')
        ));

      if (isChunkError && error) {
        const chunkMatch = error.message?.match(/chunk (\d+)/i) || 
                          (typeof message === 'string' ? message.match(/chunk (\d+)/i) : null);
        const chunkId = chunkMatch?.[1] || 'unknown';
        
        console.warn(`🔄 [ChunkLoadRetry] Chunk ${chunkId} failed to load, attempting recovery...`);

        const state = getRetryState();
        const chunkState = state[chunkId] || { retries: 0, lastAttempt: 0 };
        
        if (chunkState.retries < MAX_RETRIES) {
          const delay = INITIAL_DELAY * Math.pow(2, chunkState.retries);
          
          chunkState.retries += 1;
          chunkState.lastAttempt = Date.now();
          state[chunkId] = chunkState;
          setRetryState(state);

          console.info(`🔄 [ChunkLoadRetry] Retry ${chunkState.retries}/${MAX_RETRIES} for chunk ${chunkId} in ${delay}ms`);

          setTimeout(() => {
            // Force reload to get fresh chunks
            console.info(`🔄 [ChunkLoadRetry] Reloading page to recover chunk ${chunkId}...`);
            window.location.reload();
          }, delay);

          // Suppress the error from propagating
          return true;
        } else {
          console.error(`❌ [ChunkLoadRetry] Max retries exceeded for chunk ${chunkId}. Clearing cache and performing hard reload...`);
          
          // Clear all retry states and force a full cache-busting reload
          sessionStorage.removeItem(CHUNK_RETRY_KEY);
          sessionStorage.setItem('voices_force_reload', Date.now().toString());
          
          // Aggressive cache clear and force reload
          const forceReload = () => {
            const baseUrl = (window as Window).location.href.split('?')[0];
            (window as Window).location.href = baseUrl + '?_r=' + Date.now();
          };
          
          if ('caches' in window && typeof caches !== 'undefined') {
            caches.keys().then(names => {
              names.forEach(name => caches.delete(name));
            }).finally(forceReload);
          } else {
            forceReload();
          }
          
          return true;
        }
      }

      // Call original handler for non-chunk errors
      if (originalOnError) {
        return originalOnError.call(window, message, source, lineno, colno, error);
      }
      return false;
    };

    // Also patch unhandledrejection for Promise-based chunk loads
    const originalUnhandledRejection = window.onunhandledrejection;
    
    window.onunhandledrejection = function(event) {
      const error = event.reason;
      const isChunkError = 
        error?.name === 'ChunkLoadError' ||
        (error?.message && (
          error.message.includes('Loading chunk') ||
          error.message.includes('ChunkLoadError') ||
          error.message.includes('dynamically imported module')
        ));

      if (isChunkError) {
        const chunkMatch = error?.message?.match(/chunk (\d+)/i);
        const chunkId = chunkMatch?.[1] || 'unknown';
        
        console.warn(`🔄 [ChunkLoadRetry] Promise rejection for chunk ${chunkId}, triggering recovery...`);

        const state = getRetryState();
        const chunkState = state[chunkId] || { retries: 0, lastAttempt: 0 };
        
        if (chunkState.retries < MAX_RETRIES) {
          const delay = INITIAL_DELAY * Math.pow(2, chunkState.retries);
          
          chunkState.retries += 1;
          chunkState.lastAttempt = Date.now();
          state[chunkId] = chunkState;
          setRetryState(state);

          setTimeout(() => {
            window.location.reload();
          }, delay);

          event.preventDefault();
          return;
        }
      }

      if (originalUnhandledRejection) {
        originalUnhandledRejection.call(window, event);
      }
    };

    console.info('✅ [ChunkLoadRetry] Webpack chunk retry handler installed');

    return () => {
      // Cleanup on unmount (though this rarely happens for root-level components)
      window.onerror = originalOnError;
      window.onunhandledrejection = originalUnhandledRejection;
    };
  }, []);

  return null;
}
