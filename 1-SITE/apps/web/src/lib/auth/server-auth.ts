/**
 * 🛡️ SERVER-SIDE AUTH (NUCLEAR 2026)
 *
 * Voor Server Components en layouts. Gebruikt Supabase + users table.
 */

import { createClient } from '@/utils/supabase/server';
import { db } from '@db';
import { users } from '@db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

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
  const [dbUser] = await db.select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.email, user.email))
    .limit(1);
  if (!dbUser) return null;
  return { id: dbUser.id, email: dbUser.email, role: dbUser.role };
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
