import { db, marketConfigs } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({});
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const market = searchParams.get('market') || 'BE';

  try {
    const config = await db.query.marketConfigs.findFirst({
      where: eq(marketConfigs.market, market)
    });

    return NextResponse.json(config || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch market config' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { market, ...updateData } = body;

    if (!market) return NextResponse.json({ error: 'Market is required' }, { status: 400 });

    const existing = await db.query.marketConfigs.findFirst({
      where: eq(marketConfigs.market, market)
    });

    if (existing) {
      await db.update(marketConfigs)
        .set({ 
          ...updateData,
          is_manually_edited: true,
          updatedAt: new Date()
        })
        .where(eq(marketConfigs.market, market));
    } else {
      await db.insert(marketConfigs)
        .values({
          market,
          ...updateData,
          is_manually_edited: true,
          updatedAt: new Date()
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Market Config POST Error]:', error);
    return NextResponse.json({ error: 'Failed to update market config' }, { status: 500 });
  }
}
