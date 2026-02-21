import { createBrowserClient } from '@supabase/ssr'
import { type SupabaseClient } from '@supabase/supabase-js'

/**
 * Controleert of Supabase config geldig is.
 * @supabase/ssr gooit als url/key leeg of placeholder zijn.
 */
function hasValidSupabaseConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return false
  if (url.includes('placeholder') || key.includes('placeholder')) return false
  return true
}

let cachedClient: SupabaseClient | null = null

/**
 * Maakt een Supabase-browserclient. Retourneert null wanneer env vars ontbreken 
 * voorkomt crash bij deploy zonder Supabase-config.
 */
export function createClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!hasValidSupabaseConfig()) {
    if (typeof window !== 'undefined') {
      console.warn(
        '[Voices] Supabase niet geconfigureerd. Zet NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in je productie-omgeving en herbouw.',
        'https://supabase.com/dashboard/project/_/settings/api'
      )
    }
    return null
  }

  if (cachedClient) return cachedClient

  console.log('[Voices] Initializing Supabase Browser Client (lockSession: false)')
  
  //  Global patch for AbortError in locks.js
  if (typeof window !== 'undefined') {
    const originalErrorHandler = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (message?.toString().includes('AbortError') || message?.toString().includes('signal is aborted')) {
        console.warn('[Voices] Caught global AbortError (locks.js) - suppressing crash.');
        return true; // Suppress error
      }
      if (originalErrorHandler) {
        return originalErrorHandler(message, source, lineno, colno, error);
      }
      return false;
    };
  }

  cachedClient = createBrowserClient(url!, key!, {
    auth: {
      //  Voorkomt 'AbortError: signal is aborted without reason' en deadlocks bij gelijktijdige requests.
      // lockSession: false schakelt de Web Locks API uit (bron: supabase/supabase-js#1594).
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // @ts-expect-error - lockSession is geldig in auth-js maar niet in @supabase/ssr types
      lockSession: false,
    },
    global: {
      // @ts-ignore
      fetch: (...args) => {
        return fetch(...args).catch(err => {
          if (err.name === 'AbortError' || err.message?.includes('aborted')) {
            console.warn('[Voices] Supabase fetch aborted (harmless):', err.message)
            return new Response(JSON.stringify({ error: 'Aborted', message: err.message }), { 
              status: 499,
              statusText: 'Client Closed Request' 
            })
          }
          throw err
        })
      }
    }
  })
  return cachedClient
}
