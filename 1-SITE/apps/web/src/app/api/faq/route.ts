import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { faq } from '@db/schema';
import { eq, or, like, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const journey = searchParams.get('journey') || 'general';
  const limit = parseInt(searchParams.get('limit') || '3');

  try {
    // Fetch FAQs based on journey or general
    const results = await db.select()
      .from(faq)
      .where(
        or(
          eq(faq.category, journey),
          eq(faq.category, 'general'),
          eq(faq.category, 'pricing'),
          eq(faq.category, 'service'),
          eq(faq.category, 'agency'),
          eq(faq.category, 'studio'),
          eq(faq.category, 'academy')
        )
      )
      .orderBy(desc(faq.helpfulCount))
      .limit(limit);

    // Filter out any potential null results if necessary, though select() should return an array
    const safeResults = results || [];

    return NextResponse.json(safeResults);
  } catch (error) {
    console.error('FAQ API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
