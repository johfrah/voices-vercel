import { db } from '@db';
import { chatMessages } from '@db/schema';
import { desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 * 🧠 API: CODY THOUGHTS (2026)
 * 
 * Doel: Maakt de interne logica en "gedachten" van Cody zichtbaar voor de admin.
 */

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    // We halen de laatste AI interacties op die 'agent' mode gebruikten
    // In een uitgebreidere versie zouden we een specifieke 'cody_thoughts' tabel hebben
    const recentThoughts = await db.select({
      id: chatMessages.id,
      thought: chatMessages.message,
      timestamp: chatMessages.createdAt,
      conversationId: chatMessages.conversationId
    })
    .from(chatMessages)
    .where(eq(chatMessages.senderType, 'ai'))
    .orderBy(desc(chatMessages.createdAt))
    .limit(10);

    return NextResponse.json(recentThoughts);
  } catch (error) {
    console.error('[Cody Thoughts Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch Cody thoughts' }, { status: 500 });
  }
}
