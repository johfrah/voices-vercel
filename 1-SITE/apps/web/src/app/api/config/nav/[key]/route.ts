import { db, navMenus } from '@/lib/system/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    // Check if table exists by doing a raw query first or just catch the error
    const menu = await db.query.navMenus.findFirst({
      where: eq(navMenus.key, params.key)
    });

    return NextResponse.json(menu || { items: [] });
  } catch (error) {
    console.error('Nav API Error (Table might be missing):', error);
    // Return a graceful empty response instead of 500
    return NextResponse.json({ items: [], error: 'Table missing or query failed' });
  }
}
