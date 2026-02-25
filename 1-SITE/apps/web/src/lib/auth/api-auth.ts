import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';

/**
 *  API AUTH HELPER (NUCLEAR 2026)
 *
 * Centrale authenticatie voor admin-only API routes.
 * Gebruikt Supabase Auth + users table voor role-check (ADMIN_EMAIL of role === 'admin').
 */

import { createClient as createSupabaseClient, type User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/system/voices-config';
import { users } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

//  CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sdkClient = createSupabaseClient(supabaseUrl, supabaseKey);

/**
 * Bepaal of de gebruiker admin is. Haalt role op uit users table.
 */
async function checkIsAdmin(user: User | null): Promise<boolean> {
  // 🛡️ CHRIS-PROTOCOL: Legacy Auto-Login Bridge Fallback (v2.31)
  // Als er geen Supabase user is, maar wel de voices_role=admin cookie, 
  // dan laten we de admin door (specifiek voor de Johfrah bridge).
  const cookieStore = await cookies();
  const voicesRole = cookieStore.get('voices_role')?.value;
  const hasAccessToken = cookieStore.has('sb-access-token');

  if (!user && voicesRole === 'admin' && hasAccessToken) {
    console.log(' NUCLEAR AUTH: Admin access granted via Legacy Bridge Cookie.');
    return true;
  }

  if (!user?.email) return false;
  const adminEmail = process.env.ADMIN_EMAIL;
  // 🛡️ CHRIS-PROTOCOL: Admin emails are strictly from ENV or DB role
  if (user.email === adminEmail) return true;

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
 * Bepaal of de gebruiker partner is.
 */
async function checkIsPartner(user: User | null): Promise<boolean> {
  if (!user?.email) return false;
  
  // Admins zijn ook partners
  if (await checkIsAdmin(user)) return true;

  try {
    const [dbUser] = await db.select({ role: users.role }).from(users).where(eq(users.email, user.email)).limit(1);
    return dbUser?.role === 'partner';
  } catch (dbError) {
    const { data, error } = await sdkClient
      .from('users')
      .select('role')
      .eq('email', user.email)
      .single();
    
    if (error || !data) return false;
    return data.role === 'partner';
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

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return { user: user as User };
}

/**
 * Vereist dat de aanvrager een partner (of admin) is.
 */
export async function requirePartner(): Promise<{ user: User } | NextResponse> {
  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPartner = await checkIsPartner(user ?? null);

  if (!isPartner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return { user: user as User };
}
