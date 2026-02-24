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

    // 1. Media Engine Data
    const { data: mediaFiles } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    const mediaStats = (mediaFiles || []).reduce((acc: any, curr: any) => {
      const type = curr.file_type?.split('/')[0] || 'other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // 2. Meetings Data (Appointments + Studio Sessions)
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*, users(first_name, last_name)')
      .order('start_time', { ascending: true })
      .limit(20);

    // 3. Vacations Data (Actors with holidays)
    const { data: actorHolidays } = await supabase
      .from('actors')
      .select('id, first_name, last_name, holiday_from, holiday_till')
      .not('holiday_from', 'is', null)
      .order('holiday_from', { ascending: true });

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
