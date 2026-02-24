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

    // 1. Haal alle workshops op (journey = academy)
    const { data: academyWorkshops } = await supabase
      .from('workshops')
      .select('*')
      .eq('journey', 'academy');

    // 2. Haal voortgangsstatistieken op
    const { data: progressData } = await supabase
      .from('course_progress')
      .select('status');

    const progressStats = (progressData || []).reduce((acc: any, curr: any) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    // 3. Haal recente inzendingen op
    const { data: recentSubmissions } = await supabase
      .from('course_submissions')
      .select('*, users(first_name, last_name)')
      .order('submitted_at', { ascending: false })
      .limit(10);

    // 4. Totaal aantal studenten (unieke gebruikers in course_progress)
    const { data: students } = await supabase
      .from('course_progress')
      .select('user_id');
    
    const uniqueStudents = new Set(students?.map(s => s.user_id)).size;

    return NextResponse.json({
      workshops: academyWorkshops || [],
      stats: {
        progress: progressStats,
        totalStudents: uniqueStudents,
      },
      recentSubmissions: recentSubmissions || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Academy API Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch academy data' }, { status: 500 });
  }
}
