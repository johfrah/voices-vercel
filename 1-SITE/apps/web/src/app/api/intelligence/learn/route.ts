import { NextRequest, NextResponse } from 'next/server';
import { IntentLearningEngine } from '@/lib/intelligence/intent-learning-engine';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content, path, visitorHash } = body;

    const supabase = createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 });
    }
    const { data: { user } } = await supabase.auth.getUser();

    // Haal de numerieke userId op uit onze eigen users tabel
    let numericUserId: number | undefined;
    if (user?.email) {
      const { db } = await import('@db');
      const { users } = await import('@db/schema');
      const { eq } = await import('drizzle-orm');
      
      const [dbUser] = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
      numericUserId = dbUser?.id;
    }

    const analysis = await IntentLearningEngine.learnFromInteraction({
      userId: numericUserId,
      visitorHash: visitorHash || 'anonymous',
      type,
      content,
      path
    });

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
