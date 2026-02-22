import { db } from '@db';
import { users } from '@db/schema';
import { desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: ADMIN USERS (2026)
 */

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt)).catch(() => []);
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('[Admin Users GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
