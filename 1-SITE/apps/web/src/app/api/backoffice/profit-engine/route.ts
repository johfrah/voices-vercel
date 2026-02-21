import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { orders, orderItems, users } from '@db/schema';
import { eq, sql, and, isNotNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 *  NUCLEAR PROFIT ENGINE (GODMODE 2026)
 * 
 * Doel: Real-time berekening van marges door Mollie omzet te koppelen
 * aan Yuki inkoopfacturen en Ponto uitbetalingen.
 */

export async function GET(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ summary: { revenue: 0, costs: 0, profit: 0, margin: '0%' }, topPerformers: [] });
  }

  try {
    // 1. Bereken Totale Omzet (Mollie/Orders)
    const revenueData = await db
      .select({
        totalRevenue: sql`SUM(${orders.total})`,
        orderCount: sql`COUNT(${orders.id})`
      })
      .from(orders)
      .where(eq(orders.status, 'completed'))
      .catch(err => {
        console.error('Profit Engine Revenue Error:', err);
        return [{ totalRevenue: '0', orderCount: 0 }];
      });

    // 2. Bereken Directe Kosten (Gekoppelde Yuki Facturen)
    const costData = await db
      .select({
        totalCosts: sql`SUM(${orders.totalCost})`
      })
      .from(orders)
      .where(and(
        eq(orders.status, 'completed'),
        isNotNull(orders.yukiInvoiceId)
      ))
      .catch(err => {
        console.error('Profit Engine Cost Error:', err);
        return [{ totalCosts: '0' }];
      });

    const revenue = parseFloat((revenueData[0]?.totalRevenue as string) || '0');
    const costs = parseFloat((costData[0]?.totalCosts as string) || '0');
    const profit = revenue - costs;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    // 3. Haal Top Performers op (Meeste marge)
    let topPerformers: any[] = [];
    try {
      topPerformers = await db
        .select({
          name: sql`${users.firstName} || ' ' || ${users.lastName}`,
          totalProfit: sql`SUM(${orders.totalProfit})`,
          orderCount: sql`COUNT(${orders.id})`
        })
        .from(orders)
        .innerJoin(users, eq(orders.userId, users.id))
        .groupBy(users.id)
        .orderBy(sql`SUM(${orders.totalProfit}) DESC`)
        .limit(5);
    } catch (perfError) {
      console.error('Profit Engine Top Performers Error:', perfError);
    }

    return NextResponse.json({
      summary: {
        revenue,
        costs,
        profit,
        margin: margin.toFixed(2) + '%',
      },
      topPerformers,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Profit Engine Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
