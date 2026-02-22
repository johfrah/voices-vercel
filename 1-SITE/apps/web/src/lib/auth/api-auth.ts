/**
 *  API AUTH HELPER (NUCLEAR 2026)
 *
 * Centrale authenticatie voor admin-only API routes.
 * Gebruikt Supabase Auth + users table voor role-check (ADMIN_EMAIL of role === 'admin').
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { db } from '@db';
import { users } from '@db/schema';
import { eq } from 'drizzle-orm';

//  CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sdkClient = createSupabaseClient(supabaseUrl, supabaseKey);

/**
 * Bepaal of de gebruiker admin is. Haalt role op uit users table.
 */
async function checkIsAdmin(user: User | null): Promise<boolean> {
  if (!user?.email) return false;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (user.email === adminEmail || user.email === 'johfrah@voices.be' || user.email === 'bernadette@voices.be') return true;

  try {
    const [dbUser] = await db.select({ role: users.role }).from(users).where(eq(users.email, user.email)).limit(1);
    return dbUser?.role === 'admin';
  } catch (dbError) {
    console.warn(' API Auth Drizzle failed, falling back to SDK');
    const { data, error } = await sdkClient
      .from('users')
      .select('role')
      .eq('email', user.email)
      .single();
    
    if (error || !data) return false;
    return data.role === 'admin';
  }
}

/**
 * Vereist dat de aanvrager een admin is. Gooit 401 als dat niet zo is.
 * Returnt de Supabase user bij succes.
 */
export async function requireAdmin(): Promise<{ user: User } | NextResponse> {
  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = await checkIsAdmin(user ?? null);

  if (!user || !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return { user };
}
