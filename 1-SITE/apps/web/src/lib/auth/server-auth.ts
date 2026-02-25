/**
 *  SERVER-SIDE AUTH (NUCLEAR 2026)
 *
 * Voor Server Components en layouts. Gebruikt Supabase + users table.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

//  CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sdkClient = createSupabaseClient(supabaseUrl, supabaseKey);

export interface ServerUser {
  id: number;
  email: string;
  role: string | null;
}

/**
 * Haal de huidige user op (Supabase + users table). Null als niet ingelogd.
 */
export async function getServerUser(): Promise<ServerUser | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  // 🛡️ CHRIS-PROTOCOL: Use SDK as primary source for Edge stability (v2.14.459)
  try {
    if (!sdkClient) throw new Error('Supabase SDK client not initialized');

    // We gebruiken een directe fetch om Drizzle/Edge serialisatie issues te vermijden in layouts
    const { data, error } = await sdkClient
      .from('users')
      .select('id, email, role')
      .eq('email', user.email)
      .maybeSingle();
    
    if (data && !error) {
      // FORCEER ROLE CHECK VOOR DEBUGGING
      console.log(`[Auth] User ${user.email} role: ${data.role}`);
      return { id: data.id, email: data.email, role: data.role };
    }

    if (error) {
      console.warn(' Auth SDK Fetch error:', error.message);
    }

    // 🛡️ CHRIS-PROTOCOL: Drizzle is VERBODEN in server-side auth voor layouts (Edge stability)
    // We vallen alleen terug op de SDK als de eerste call faalde.
  } catch (err: any) {
    console.warn(' Auth Fetch critical failure:', err.message);
  }

  return null;
}

/**
 * Controleer of de gebruiker admin is.
 */
export function isAdminUser(u: ServerUser | null): boolean {
  if (!u) return false;
  // 🛡️ CHRIS-PROTOCOL: Role-based auth is the ONLY source of truth. 
  // Hardcoded emails are forbidden in production.
  return u.role === 'admin' || u.role === 'superadmin';
}

/**
 * Vereist admin. Redirect naar / als niet ingelogd of niet admin.
 * Gebruik in admin layout.
 */
export async function requireAdminRedirect(): Promise<ServerUser> {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) {
    redirect('/');
  }
  return user;
}
