import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { orders, orderItems, users } from '@db/schema';
import { eq, sql, and, isNotNull } from 'drizzle-orm';

/**
 * 📈 NUCLEAR PROFIT ENGINE (GODMODE 2026)
 * 
 * Doel: Real-time berekening van marges door Mollie omzet te koppelen
 * aan Yuki inkoopfacturen en Ponto uitbetalingen.
 */

export async function GET(request: NextRequest) {
  try {
    // 1. Bereken Totale Omzet (Mollie/Orders)
    const revenueData = await db
      .select({
        totalRevenue: sql`SUM(${orders.total})`,
        orderCount: sql`COUNT(${orders.id})`
      })
      .from(orders)
      .where(eq(orders.status, 'completed'));

    // 2. Bereken Directe Kosten (Gekoppelde Yuki Facturen)
    const costData = await db
      .select({
        totalCosts: sql`SUM(${orders.totalCost})`
      })
      .from(orders)
      .where(and(
        eq(orders.status, 'completed'),
        isNotNull(orders.yukiInvoiceId)
      ));

    const revenue = parseFloat((revenueData[0]?.totalRevenue as string) || '0');
    const costs = parseFloat((costData[0]?.totalCosts as string) || '0');
    const profit = revenue - costs;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    // 3. Haal Top Performers op (Meeste marge)
    const topPerformers = await db
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
