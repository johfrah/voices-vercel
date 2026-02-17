import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { utmTouchpoints, orders } from '@db/schema';
import { eq, sql, desc } from 'drizzle-orm';

/**
 *  UTM ATTRIBUTION & ROI ENGINE
 * 
 * Doel: Marketing journey koppelen aan orderwaarde.
 */

export async function GET(request: NextRequest) {
  try {
    // Aggregeer ROI per bron (Source)
    const roiData = await db
      .select({
        source: utmTouchpoints.source,
        totalOrders: sql`COUNT(DISTINCT ${orders.id})`,
        totalRevenue: sql`SUM(${orders.total})`,
        avgOrderValue: sql`AVG(${orders.total})`
      })
      .from(utmTouchpoints)
      .innerJoin(orders, eq(utmTouchpoints.orderId, orders.id))
      .groupBy(utmTouchpoints.source)
      .orderBy(desc(sql`SUM(${orders.total})`));

    return NextResponse.json({
      summary: roiData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[ROI Engine Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
