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

    // 1. Funnel stappen aggregatie via funnel_events
    const { data: funnelSteps, error: funnelError } = await supabase
      .from('funnel_events')
      .select('step')
      .order('created_at', { ascending: false });

    if (funnelError) {
      console.warn('Funnel events table might be empty or missing:', funnelError.message);
    }

    const stepCounts = (funnelSteps || []).reduce((acc: any, curr: any) => {
      acc[curr.step] = (acc[curr.step] || 0) + 1;
      return acc;
    }, {});

    const formattedSteps = Object.entries(stepCounts)
      .map(([step, count]) => ({ step, count: count as number }))
      .sort((a, b) => b.count - a.count);

    // 2. Workshop interesse status
    const { data: interestData, error: interestError } = await supabase
      .from('workshop_interest')
      .select('status');

    const interestCounts = (interestData || []).reduce((acc: any, curr: any) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    const formattedInterest = Object.entries(interestCounts).map(([status, count]) => ({ status, count }));

    // 3. Conversie naar orders (workshop journey)
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('status')
      .eq('journey', 'studio');

    const orderCounts = (orderData || []).reduce((acc: any, curr: any) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    const formattedOrders = Object.entries(orderCounts).map(([status, count]) => ({ status, count }));

    // 4. Laatste funnel events
    const { data: recentEvents } = await supabase
      .from('funnel_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      funnelSteps: formattedSteps,
      interestStats: formattedInterest,
      workshopOrders: formattedOrders,
      recentEvents: recentEvents || [],
      timestamp: new Date()
    });
  } catch (error) {
    console.error('[Funnel API Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch funnel data' }, { status: 500 });
  }
}
