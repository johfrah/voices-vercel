import { db } from '@db';
import { translations } from '@db/schema';
import { desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const results = await db.select().from(translations).orderBy(desc(translations.updatedAt));
    return NextResponse.json({ translations: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
