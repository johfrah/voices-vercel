/**
 * 🛡️ SERVER-SIDE AUTH (NUCLEAR 2026)
 *
 * Voor Server Components en layouts. Gebruikt Supabase + users table.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { db } from '@db';
import { users } from '@db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

// 🛡️ CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
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

  try {
    const [dbUser] = await db.select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);
    
    if (!dbUser) return null;
    return { id: dbUser.id, email: dbUser.email, role: dbUser.role };
  } catch (dbError) {
    console.warn('⚠️ Auth Drizzle failed, falling back to SDK');
    const { data, error } = await sdkClient
      .from('users')
      .select('id, email, role')
      .eq('email', user.email)
      .single();
    
    if (error || !data) return null;
    return { id: data.id, email: data.email, role: data.role };
  }
}

/**
 * Controleer of de gebruiker admin is.
 */
export function isAdminUser(u: ServerUser | null): boolean {
  if (!u) return false;
  return u.email === 'johfrah@voices.be' || u.role === 'admin';
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
