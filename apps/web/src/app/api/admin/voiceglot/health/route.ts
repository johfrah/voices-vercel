import { requireAdmin } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getVoiceglotCoverageSnapshot,
  VOICEGLOT_ALIAS_TO_CANONICAL,
  VOICEGLOT_TARGET_LANGUAGES,
} from '@/lib/services/voiceglot-heal-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data: cronHealthRows, error } = await supabase
      .from('app_configs')
      .select('value, updated_at')
      .eq('key', 'voiceglot_cron_health')
      .limit(1);
    if (error) throw error;

    const coverage = await getVoiceglotCoverageSnapshot(VOICEGLOT_TARGET_LANGUAGES);
    return NextResponse.json({
      success: true,
      target_languages: VOICEGLOT_TARGET_LANGUAGES,
      alias_to_canonical: VOICEGLOT_ALIAS_TO_CANONICAL,
      cron_health: cronHealthRows?.[0] || null,
      coverage,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch health' }, { status: 500 });
  }
}

