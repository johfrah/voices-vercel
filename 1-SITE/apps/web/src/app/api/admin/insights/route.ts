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

    // 1. Klant segmentatie op basis van journey_state
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('journey_state');

    const segmentation = (userData || []).reduce((acc: any, curr: any) => {
      const state = curr.journey_state || 'unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});

    const formattedSegmentation = Object.entries(segmentation).map(([state, count]) => ({ state, count }));

    // 2. Recente klant activiteit
    const { data: recentActivity } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, last_active, journey_state')
      .order('last_active', { ascending: false })
      .limit(10);

    // 3. Gemiddelde order waarde per klant type
    const { data: orderStats } = await supabase
      .from('orders')
      .select('total, users(customer_type)')
      .not('total', 'is', null);

    const orderValueStats = (orderStats || []).reduce((acc: any, curr: any) => {
      const type = curr.users?.customer_type || 'unknown';
      if (!acc[type]) acc[type] = { total: 0, count: 0 };
      acc[type].total += Number(curr.total);
      acc[type].count += 1;
      return acc;
    }, {});

    const formattedOrderStats = Object.entries(orderValueStats).map(([customerType, stats]: [string, any]) => ({
      customerType,
      avgTotal: stats.total / stats.count,
      totalOrders: stats.count
    }));

    // 4. Chat intent analyse
    const { data: chatData } = await supabase
      .from('chat_conversations')
      .select('intent')
      .not('intent', 'is', null);

    const chatIntents = (chatData || []).reduce((acc: any, curr: any) => {
      acc[curr.intent] = (acc[curr.intent] || 0) + 1;
      return acc;
    }, {});

    const formattedChatIntents = Object.entries(chatIntents)
      .map(([intent, count]) => ({ intent, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      segmentation: formattedSegmentation,
      recentActivity: recentActivity?.map(u => ({
        id: u.id,
        email: u.email,
        first_name: u.first_name,
        last_name: u.last_name,
        lastActive: u.last_active,
        journeyState: u.journey_state
      })),
      orderValueStats: formattedOrderStats,
      chatIntents: formattedChatIntents,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('[Insights API Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch insights data' }, { status: 500 });
  }
}
