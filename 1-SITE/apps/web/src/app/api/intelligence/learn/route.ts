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

    //  LEX-MANDATE: Only allow learning from authenticated users or specific anonymous paths
    // For now, we allow anonymous but tag them as such. 
    // In the future, we might want to rate-limit this to prevent spam.

    // Haal de numerieke userId op uit onze eigen users tabel
    let numericUserId: number | undefined;
    if (user?.email) {
      const { db } = await import('@/lib/system/voices-config');
      const { users } = await import('@/lib/system/voices-config');
      const { eq } = await import('drizzle-orm');
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      
      try {
        const [dbUser] = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
        numericUserId = dbUser?.id;
      } catch (dbError) {
        console.warn(' Learn API Drizzle failed, falling back to SDK');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const sdkClient = createSupabaseClient(supabaseUrl, supabaseKey);
        
        const { data, error } = await sdkClient
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();
        
        if (!error && data) {
          numericUserId = data.id;
        }
      }
    }

    const analysis = await IntentLearningEngine.learnFromInteraction({
      user_id: numericUserId,
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
