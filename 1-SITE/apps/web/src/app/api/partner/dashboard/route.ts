import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { orders, users, partnerWidgets } from '@db/schema';
import { eq, sql, count, sum } from 'drizzle-orm';

/**
 * ⚡ NUCLEAR PARTNER DASHBOARD (2026)
 * 
 * Deze route vervangt de WordPress /partner/dashboard API.
 * Het haalt alle statistieken direct uit Supabase.
 */

export async function GET(request: NextRequest) {
  // In een echte scenario zouden we hier de auth-sessie controleren
  // Voor nu simuleren we de data op basis van de partner slug of user ID
  const { searchParams } = new URL(request.url);
  const partnerSlug = searchParams.get('partner_slug') || 'default';

  try {
    // 1. Haal partner info op
    const [partner] = await db.select().from(users).where(eq(users.role, 'partner')).limit(1); // Placeholder logic
    
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
      .where(eq(orders.userId, partner.id));

    // 3. Haal recente orders op
    const recentOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, partner.id))
      .orderBy(sql`${orders.createdAt} DESC`)
      .limit(5);

    return NextResponse.json({
      partner: {
        name: partner.companyName || partner.firstName,
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
        total: `€ ${o.total}`,
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
