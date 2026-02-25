import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/system/db';
import { utmTouchpoints, orders } from '@/lib/system/db';
import { eq, sql, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  UTM ATTRIBUTION & ROI ENGINE
 * 
 * Doel: Marketing journey koppelen aan orderwaarde.
 */

export async function GET(request: NextRequest) {
  //  LEX-MANDATE: Admin only access for ROI data
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

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
      .orderBy(desc(sql`SUM(${orders.total})`))
      .catch(err => {
        console.error('ROI Engine DB Error:', err);
        return [];
      });

    return NextResponse.json({
      summary: roiData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[ROI Engine Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
