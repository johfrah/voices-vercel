import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

function hasValidSupabaseConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return false
  if (url.includes('placeholder') || key.includes('placeholder')) return false
  return true
}

/**
 * Maakt een Supabase-serverclient. Retourneert null wanneer env vars ontbreken 
 * voorkomt FATAL 500 bij deploy zonder Supabase-config.
 */
export function createClient(): SupabaseClient | null {
  if (!hasValidSupabaseConfig()) {
    console.warn('[Voices] Supabase env vars missing  server client unavailable')
    return null
  }

  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 *  ADMIN CLIENT (GOD MODE)
 * Gebruikt de Service Role Key om RLS te omzeilen.
 * Alleen gebruiken op de server voor admin-acties!
 */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    console.warn('[Voices] Supabase Admin env vars missing')
    return null
  }

  return createServerClient(url, key, {
    cookies: {
      get(name: string) { return '' },
      set() {},
      remove() {},
    },
  })
}
