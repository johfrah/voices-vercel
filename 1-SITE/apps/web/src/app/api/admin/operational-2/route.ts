import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Locks Data (App Configs with 'lock' in key)
    const { data: locks } = await supabase
      .from('app_configs')
      .select('*')
      .ilike('key', '%lock%');

    // 2. Feedback Data (Reviews)
    const { data: feedback } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    // 3. Chat Data (Conversations)
    const { data: chats } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(20);

    // 4. AI Settings (App Configs with 'ai' or 'openai' in key)
    const { data: aiSettings } = await supabase
      .from('app_configs')
      .select('*')
      .or('key.ilike.%ai%,key.ilike.%openai%');

    return NextResponse.json({
      locks: locks || [],
      feedback: feedback || [],
      chats: chats || [],
      aiSettings: aiSettings || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Operational API 2 Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch operational data' }, { status: 500 });
  }
}
