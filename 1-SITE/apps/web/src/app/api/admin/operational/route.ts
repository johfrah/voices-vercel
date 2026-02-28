import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const worldCode = searchParams.get('world');

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let worldId = null;
    if (worldCode) {
      const { data: worldData } = await supabase.from('worlds').select('id').eq('code', worldCode).single();
      if (worldData) worldId = worldData.id;
    }

    // 1. Studio Data (Media)
    let mediaQuery = supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (worldId) {
      mediaQuery = mediaQuery.eq('world_id', worldId);
    }

    const { data: mediaFiles } = await mediaQuery;

    const mediaStats = (mediaFiles || []).reduce((acc: any, curr: any) => {
      const type = curr.file_type?.split('/')[0] || 'other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // 2. Meetings Data (Appointments + Studio Sessions)
    let appointmentsQuery = supabase
      .from('appointments')
      .select('*, users(first_name, last_name)')
      .order('start_time', { ascending: true })
      .limit(20);

    // Appointments are currently global, but could be world-aware in the future
    const { data: appointments } = await appointmentsQuery;

    // 3. Vacations Data (Actors with holidays)
    let actorsQuery = supabase
      .from('actors')
      .select('id, first_name, last_name, holiday_from, holiday_till')
      .not('holiday_from', 'is', null)
      .order('holiday_from', { ascending: true });

    if (worldId) {
      actorsQuery = actorsQuery.eq('world_id', worldId);
    }

    const { data: actorHolidays } = await actorsQuery;

    return NextResponse.json({
      media: {
        files: mediaFiles || [],
        stats: mediaStats
      },
      meetings: appointments || [],
      vacations: actorHolidays || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Operational API Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch operational data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, consent } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (action === 'log_consent' && consent) {
      // ⚖️ LEX-MANDATE: Forensic Consent Audit Trail (v2.16.078)
      // We log consent even for non-admins to maintain a legal audit trail.
      const { error } = await supabase.from('system_events').insert({
        event_type: 'cookie_consent',
        severity: 'info',
        message: `Consent updated: ${consent.type} (v${consent.version})`,
        metadata: {
          consent_type: consent.type,
          consent_version: consent.version,
          visitor_hash: consent.visitor_hash,
          user_agent: request.headers.get('user-agent'),
          ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        }
      });

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // Other POST actions require admin
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[Operational POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
