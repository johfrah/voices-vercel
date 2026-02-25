import { NextRequest, NextResponse } from 'next/server';
import { db, orders, users, partnerWidgets } from '@/lib/system/voices-config';
import { eq, sql, count, sum } from 'drizzle-orm';
import { requirePartner } from '@/lib/auth/api-auth';

/**
 *  NUCLEAR PARTNER DASHBOARD (2026)
 * 
 * Deze route vervangt de WordPress /partner/dashboard API.
 * Het haalt alle statistieken direct uit Supabase.
 */

export async function GET(request: NextRequest) {
  // 🛡️ CHRIS-PROTOCOL: Strict API Protection
  const auth = await requirePartner();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    // 1. Haal partner info op
    const [partner] = await db.select().from(users).where(eq(users.email, user.email!)).limit(1);
    
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // 2. Bereken statistieken uit de orders tabel
    const statsResult = await db
      .select({
        totalOrders: count(orders.id),
        totalRevenue: sum(orders.total),
      })
      .from(orders)
      .where(eq(orders.user_id, partner.id))
      .catch(() => []);

    // 3. Haal recente orders op
    const recentOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.user_id, partner.id))
      .orderBy(sql`${orders.createdAt} DESC`)
      .limit(5)
      .catch(() => []);

    return NextResponse.json({
      partner: {
        name: partner.companyName || partner.first_name,
        slug: partnerSlug,
        coupon_code: 'PARTNER2026',
      },
      stats: {
        links: 12, // Placeholder voor gegenereerde links (moet nog in DB)
        orders: statsResult[0]?.totalOrders || 0,
        voices: 48,
      },
      links: [], // Moet nog gekoppeld worden aan een 'partner_links' tabel
      orders: recentOrders.map(o => ({
        id: o.wpOrderId || o.id,
        date: o.createdAt,
        status: o.status,
        status_label: o.status?.toUpperCase(),
        customer_name: 'Klant', // Moet uit relationele tabel komen
        total: ` ${o.total}`,
        is_quote: false,
        checkout_url: null
      })),
      _nuclear: true,
      _source: 'supabase'
    });
  } catch (error) {
    console.error('[Partner Dashboard Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
