/**
 *  API AUTH HELPER (NUCLEAR 2026)
 *
 * Centrale authenticatie voor admin-only API routes.
 * Gebruikt Supabase Auth + users table voor role-check (ADMIN_EMAIL of role === 'admin').
 */

import { createClient as createSupabaseClient, type User } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/system/voices-config';
import { users } from '@/lib/system/voices-config';
import { sql, desc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifyAdminBridgeToken } from './admin-bridge-token';

//  CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sdkClient = createSupabaseClient(supabaseUrl, supabaseKey);

const roleRank: Record<string, number> = {
  superadmin: 5,
  admin: 4,
  ademing_admin: 4,
  partner: 3,
  customer: 2,
  guest: 1,
};

async function getBestRoleByEmail(email: string): Promise<string | null> {
  try {
    const rows = await db
      .select({ role: users.role, lastActive: users.lastActive, createdAt: users.createdAt, id: users.id })
      .from(users)
      .where(sql`lower(${users.email}) = lower(${email})`)
      .orderBy(desc(users.lastActive), desc(users.createdAt), desc(users.id))
      .limit(10);

    if (rows.length > 0) {
      const best = rows.sort((a: any, b: any) => {
        const rankDiff = (roleRank[b.role || ''] || 0) - (roleRank[a.role || ''] || 0);
        if (rankDiff !== 0) return rankDiff;
        const aTs = new Date(a.lastActive || a.createdAt || 0).getTime();
        const bTs = new Date(b.lastActive || b.createdAt || 0).getTime();
        return bTs - aTs;
      })[0];
      return best?.role || null;
    }
  } catch (dbError) {
    console.warn(' API Auth Drizzle failed, falling back to SDK');
  }

  const { data, error } = await sdkClient
    .from('users')
    .select('role, last_active, created_at')
    .ilike('email', email)
    .order('last_active', { ascending: false })
    .limit(10);

  if (error || !data || data.length === 0) return null;

  const best = data.sort((a: any, b: any) => {
    const rankDiff = (roleRank[b?.role || ''] || 0) - (roleRank[a?.role || ''] || 0);
    if (rankDiff !== 0) return rankDiff;
    const aTs = new Date(a?.last_active || a?.created_at || 0).getTime();
    const bTs = new Date(b?.last_active || b?.created_at || 0).getTime();
    return bTs - aTs;
  })[0];

  return best?.role || null;
}

async function getRoleByUserId(userId: number): Promise<string | null> {
  try {
    const rows = await db
      .select({ role: users.role, lastActive: users.lastActive, createdAt: users.createdAt })
      .from(users)
      .where(sql`${users.id} = ${userId}`)
      .orderBy(desc(users.lastActive), desc(users.createdAt))
      .limit(5);

    if (rows.length > 0) {
      const best = rows.reduce((currentBest, candidate) => {
        const currentRank = roleRank[currentBest.role || ''] || 0;
        const candidateRank = roleRank[candidate.role || ''] || 0;
        if (candidateRank > currentRank) return candidate;
        if (candidateRank < currentRank) return currentBest;

        const currentTs = new Date(currentBest.lastActive || currentBest.createdAt || 0).getTime();
        const candidateTs = new Date(candidate.lastActive || candidate.createdAt || 0).getTime();
        return candidateTs > currentTs ? candidate : currentBest;
      }, rows[0]);
      return best?.role || null;
    }
  } catch (dbError) {
    console.warn(' API Auth Bridge user lookup via Drizzle failed, falling back to SDK');
  }

  const { data, error } = await sdkClient
    .from('users')
    .select('role')
    .eq('id', userId)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data.role || null;
}

/**
 * Bepaal of de gebruiker admin is. Haalt role op uit users table.
 */
async function checkIsAdmin(user: User | null): Promise<boolean> {
  const cookieStore = await cookies();
  const voicesRole = cookieStore.get('voices_role')?.value;
  const bridgeToken = cookieStore.get('sb-access-token')?.value || '';
  const verifiedBridge = verifyAdminBridgeToken(bridgeToken);

  // Cookie bridge blijft beschikbaar, maar alleen met cryptografisch ondertekend token.
  if (!user && voicesRole === 'admin' && verifiedBridge) {
    const bridgeRole = await getRoleByUserId(verifiedBridge.adminId);
    if (bridgeRole === 'admin' || bridgeRole === 'superadmin' || bridgeRole === 'ademing_admin') {
      return true;
    }
  }
  if (!user && (voicesRole === 'admin' || bridgeToken.length > 0)) {
    console.warn(' NUCLEAR AUTH: Blocked unsigned or invalid admin bridge token.');
  }

  if (!user?.email) return false;
  const adminEmail = process.env.ADMIN_EMAIL;
  // 🛡️ CHRIS-PROTOCOL: Admin emails are strictly from ENV or DB role
  if (user.email === adminEmail) return true;

  const role = await getBestRoleByEmail(user.email);
  return role === 'admin' || role === 'superadmin' || role === 'ademing_admin';
}

/**
 * Bepaal of de gebruiker partner is.
 */
async function checkIsPartner(user: User | null): Promise<boolean> {
  if (!user?.email) return false;
  
  // Admins zijn ook partners
  if (await checkIsAdmin(user)) return true;

  const role = await getBestRoleByEmail(user.email);
  return role === 'partner';
}

/**
 * Vereist dat de aanvrager een admin is. Gooit 401 als dat niet zo is.
 * Returnt de Supabase user bij succes.
 */
export async function requireAdmin(): Promise<{ user: User } | NextResponse> {
  const supabase = createServerClient();
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
  const supabase = createServerClient();
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
