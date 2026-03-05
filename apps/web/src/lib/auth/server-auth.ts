/**
 *  SERVER-SIDE AUTH (NUCLEAR 2026)
 *
 * Voor Server Components en layouts. Gebruikt Supabase + users table.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

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
  const cookieStore = cookies();
  const roleCookie = cookieStore.get('voices_role');
  const bridgeToken = cookieStore.get('sb-access-token');

  // 🛡️ CHRIS-PROTOCOL: Admin Bridge Support (v2.14.785)
  // Als we een geldige admin-bridge token hebben, valideren we deze direct via de SDK
  if (roleCookie?.value === 'admin' && bridgeToken?.value?.startsWith('admin-bridge-')) {
    const adminId = parseInt(bridgeToken.value.replace('admin-bridge-', ''));
    if (!isNaN(adminId)) {
      try {
        const { data, error } = await sdkClient
          .from('users')
          .select('id, email, role')
          .eq('id', adminId)
          .maybeSingle();
        
        if (data && !error && (data.role === 'admin' || data.role === 'ademing_admin')) {
          console.log(`[Auth] Admin Bridge session verified for: ${data.email}`);
          return { id: data.id, email: data.email, role: data.role };
        }
      } catch (e) {
        console.warn('[Auth] Admin Bridge validation failed');
      }
    }
  }

  const supabase = createServerClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  // 🛡️ CHRIS-PROTOCOL: Use SDK as primary source for Edge stability (v2.14.462)
  try {
    if (!sdkClient) throw new Error('Supabase SDK client not initialized');

    // We gebruiken een directe fetch om Drizzle/Edge serialisatie issues te vermijden in layouts
    const { data: rows, error } = await sdkClient
      .from('users')
      .select('id, email, role, last_active, updated_at')
      .ilike('email', user.email)
      .order('last_active', { ascending: false })
      .limit(5);
    
    if (rows && rows.length > 0 && !error) {
      const roleRank: Record<string, number> = {
        superadmin: 5,
        admin: 4,
        ademing_admin: 4,
        partner: 3,
        customer: 2,
        guest: 1,
      };

      const data = rows.sort((a: any, b: any) => {
        const roleDiff = (roleRank[b?.role || ''] || 0) - (roleRank[a?.role || ''] || 0);
        if (roleDiff !== 0) return roleDiff;
        const aTs = new Date(a?.last_active || a?.updated_at || 0).getTime();
        const bTs = new Date(b?.last_active || b?.updated_at || 0).getTime();
        return bTs - aTs;
      })[0];

      // 🛡️ CHRIS-PROTOCOL: Nuclear Role Logging (v2.14.462)
      // We loggen dit naar de server console voor forensische audit
      console.log(`[Auth] User ${user.email} verified with role: ${data.role}`);
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
 * Controleer of de gebruiker admin is of specifieke Ademing beheerder.
 */
export function isAdminUser(u: ServerUser | null): boolean {
  if (!u) return false;
  // 🛡️ CHRIS-PROTOCOL: Role-based auth is the ONLY source of truth. 
  // Hardcoded emails are forbidden in production.
  return u.role === 'admin' || u.role === 'superadmin' || u.role === 'ademing_admin';
}

/**
 * Vereist admin. Redirect naar / als niet ingelogd of niet admin.
 * Gebruik in admin layout.
 */
export async function requireAdminRedirect(redirectPath: string = "/admin/dashboard"): Promise<ServerUser> {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) {
    const safeRedirect = redirectPath.startsWith("/") ? redirectPath : "/admin/dashboard";
    redirect(`/account/login?redirect=${encodeURIComponent(safeRedirect)}`);
  }
  return user;
}
