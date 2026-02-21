import { db } from '@db';
import { translations } from '@db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { id, isLocked } = await request.json();
    
    await db.update(translations)
      .set({ isLocked, updatedAt: new Date() })
      .where(eq(translations.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
