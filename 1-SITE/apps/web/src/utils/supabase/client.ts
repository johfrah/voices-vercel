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
 * Maakt een Supabase-browserclient. Retourneert null wanneer env vars ontbreken –
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
  cachedClient = createBrowserClient(url!, key!, {
    auth: {
      // 🔒 Voorkomt 'AbortError: signal is aborted without reason' bij veel gelijktijdige requests
      // door de navigator.locks API uit te schakelen voor sessie-beheer.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // @ts-ignore - lockSession is een geldige optie in @supabase/auth-js maar soms niet in types
      lockSession: false,
    }
  })
  return cachedClient
}
