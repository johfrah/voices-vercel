import { db, users } from '@/lib/system/db';
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
    const allUsers = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      companyName: users.companyName,
      createdAt: users.createdAt
    }).from(users).orderBy(desc(users.createdAt)).limit(50);

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('[Admin Users GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
