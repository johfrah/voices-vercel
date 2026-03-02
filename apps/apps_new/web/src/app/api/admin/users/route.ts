import { db, users, worlds } from '@/lib/system/voices-config';
import { desc, eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: ADMIN USERS (2026)
 */

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const worldCode = searchParams.get('world');

  try {
    let query = db.select({
      id: users.id,
      first_name: users.first_name,
      last_name: users.last_name,
      email: users.email,
      companyName: users.companyName,
      createdAt: users.createdAt
    }).from(users);

    if (worldCode) {
      // 🌍 World-Aware filtering for users
      // Users are linked to worlds via their subroles or activity, 
      // but for now we filter based on 'approved_flows' or similar metadata if available.
      // For a strict ancestry, we look at users who have orders in this world.
      query = query.where(
        sql`id IN (SELECT user_id FROM orders_v2 WHERE world_id = (SELECT id FROM worlds WHERE code = ${worldCode}))`
      );
    }

    const allUsers = await query.orderBy(desc(users.createdAt)).limit(50);

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('[Admin Users GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
