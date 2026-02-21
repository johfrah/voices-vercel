import { db } from '@db';
import { marketConfigs } from '@db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: MARKET CONFIGURATION (GOD MODE 2026)
 * 
 * Doel: Beheer van markten en hun configuratie in de database.
 */

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, markets: [] });
  }

  try {
    await requireAdmin();
    
    const configs = await db.select().from(marketConfigs);
    return NextResponse.json({ success: true, markets: configs });
  } catch (error: any) {
    console.error('[API Markets GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true });
  }

  try {
    await requireAdmin();
    
    const body = await request.json();
    const { market, name, email, phone, localization, theme } = body;

    if (!market || !name) {
      return NextResponse.json({ error: 'Market code and name are required' }, { status: 400 });
    }

    await db.insert(marketConfigs).values({
      market,
      name,
      email: email || '',
      phone: phone || '',
      localization: localization || {},
      theme: theme || 'voices',
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: [marketConfigs.market],
      set: {
        name,
        email,
        phone,
        localization,
        theme,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Markets POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
